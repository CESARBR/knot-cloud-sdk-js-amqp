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
    this.events = {
      data: api.PUBLISH_DATA,
      getData: api.REQUEST_DATA,
      setData: api.UPDATE_DATA,
    };
    this.userKey = uniqid();
  }

  async subscribeToResponse(resolve, reject, reqKey, resKey, msg) {
    const reqExchange = api.getExchange(reqKey);
    const resExchange = api.getExchange(resKey);
    const queue = `${resKey}-${this.userKey}`;
    const consumerTag = uniqid.time(`${queue}-`);

    const handleResponse = async ({ error, ...message }) => {
      if (message.id === msg.id) {
        await this.amqp.unsubscribeConsumer(consumerTag);
        if (error) {
          reject(Error(error));
        } else {
          resolve(message);
        }
      }
    };

    await this.amqp.subscribeTo(resExchange, resKey, queue, handleResponse, { consumerTag });
    await this.amqp.publishMessage(reqExchange, reqKey, msg, this.headers);
  }

  async sendRequest(routingKey, message) {
    const responseKey = api.getResponseKey(routingKey);
    if (responseKey) {
      return new Promise((resolve, reject) => {
        this.subscribeToResponse(resolve, reject, routingKey, responseKey, message);
      });
    }
    const exchange = api.getExchange(routingKey);
    return this.amqp.publishMessage(exchange, routingKey, message, this.headers);
  }

  async connect() {
    return this.amqp.start();
  }

  async close() {
    return this.amqp.stop();
  }

  async register(id, name) {
    const msg = { id, name };
    return this.sendRequest(api.REGISTER_DEVICE, msg);
  }

  async unregister(id) {
    const msg = { id };
    return this.sendRequest(api.UNREGISTER_DEVICE, msg);
  }

  async getDevices() {
    const msg = {};
    return this.sendRequest(api.LIST_DEVICES, msg);
  }

  async updateSchema(id, schemaList) {
    const msg = { id, schema: schemaList };
    return this.sendRequest(api.UPDATE_SCHEMA, msg);
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
      return this.amqp.subscribeTo(exchange, routingKey, queue, callback, options);
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
        callback(msg);
      }, { ...options, consumerTag });
    }
    return Error('Event not recognized!');
  }
}
