import uniqid from 'uniqid';
import AMQP from './network/AMQP';
import * as api from './config/api';

// Based on websocket interface: https://github.com/CESARBR/knot-cloud-websocket#methods
export default class Client {
  constructor(config = {}) {
    this.amqp = new AMQP({
      hostname: 'localhost',
      port: 5672,
      username: 'knot',
      password: 'knot',
      ...config,
    });
    this.headers = { Authorization: config.token };
    this.userKey = uniqid();
  }

  async subscribeToResponse(resolve, reject, req, resp, message) {
    const queue = `${resp.key}-${this.userKey}`;
    const consumerTag = uniqid.time(`${queue}-`);
    const handler = async ({ error, ...reply }) => {
      if (reply.id === message.id) {
        await this.amqp.unsubscribeConsumer(consumerTag);
        if (error) {
          reject(Error(error));
        } else {
          resolve(reply);
        }
      }
    };
    await this.amqp.subscribeTo(resp.name, resp.type, resp.key, queue, handler, { consumerTag });
    await this.amqp.publishMessage(req.name, req.type, req.key, message, this.headers);
  }

  async sendRequest(req, resp, message) {
    return new Promise((resolve, reject) => (
      this.subscribeToResponse(resolve, reject, req, resp, message)
    ));
  }

  setReplyOptions() {
    const correlationId = uniqid();
    this.headers['correlation-id'] = correlationId;
    return correlationId;
  }

  async connect() {
    return this.amqp.start();
  }

  async close() {
    return this.amqp.stop();
  }

  async register(id, name) {
    const msg = { id, name };
    const req = api.getDefinitionByKey(api.REGISTER_DEVICE);
    const resp = { name: req.name, type: req.type, key: api.getResponseKey(api.REGISTER_DEVICE) };
    return this.sendRequest(req, resp, msg);
  }

  async unregister(id) {
    const msg = { id };
    const req = api.getDefinitionByKey(api.UNREGISTER_DEVICE);
    const resp = { name: req.name, type: req.type, key: api.getResponseKey(api.UNREGISTER_DEVICE) };
    return this.sendRequest(req, resp, msg);
  }

  async authDevice(id) {
    const msg = { id };
    const correlationId = this.setReplyOptions();
    const req = api.getDefinitionByKey(api.AUTH_DEVICE);
    const resp = { name: req.name, type: req.type, key: correlationId };
    return this.sendRequest(req, resp, msg);
  }

  async getDevices() {
    const correlationId = this.setReplyOptions();
    const req = api.getDefinitionByKey(api.LIST_DEVICES);
    const resp = { name: req.name, type: req.type, key: correlationId };
    return this.sendRequest(req, resp, {});
  }

  async updateSchema(id, schemaList) {
    const msg = { id, schema: schemaList };
    const req = api.getDefinitionByKey(api.UPDATE_SCHEMA);
    const resp = { name: req.name, type: req.type, key: api.getResponseKey(api.UPDATE_SCHEMA) };
    return this.sendRequest(req, resp, msg);
  }

  async publishData(id, dataList) {
    const msg = { id, data: dataList };
    return this.sendRequest(api.PUBLISH_DATA, msg);
  }

  async getData(id, sensorIds) {
    const msg = { id, sensorIds };
    return this.sendRequest(api.REQUEST_DATA, msg);
  }

  async setData(id, dataList) {
    const msg = { id, data: dataList };
    return this.sendRequest(api.UPDATE_DATA, msg);
  }

  async on(event, callback, options) {
    if (Object.keys(this.events).includes(event)) {
      const routingKey = this.events[event];
      const exchange = api.getExchange(routingKey);
      const queue = `${event}-${this.userKey}`;
      return this.amqp.subscribeTo(exchange, routingKey, queue, (msg) => {
        const { error, ...message } = msg;
        callback(error, message);
      }, options);
    }
    return Error('Event not recognized!');
  }

  async once(event, callback, options = {}) {
    if (Object.keys(this.events).includes(event)) {
      const routingKey = this.events[event];
      const exchange = api.getExchange(routingKey);
      const queue = `${event}-${this.userKey}`;
      const consumerTag = uniqid.time(`${queue}-`);
      return this.amqp.subscribeTo(exchange, routingKey, queue, async (msg) => {
        this.amqp.unsubscribeConsumer(consumerTag);
        const { error, ...message } = msg;
        callback(error, message);
      }, { ...options, consumerTag });
    }
    return Error('Event not recognized!');
  }
}
