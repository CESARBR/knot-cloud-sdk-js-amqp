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
    };
  }

  subscribeToResponse(resolve, reject, routingKey) {
    const exchange = api.getExchange(routingKey);
    const queue = `client-${exchange}-${routingKey}`;
    const consumerTag = `consumer-${exchange}-${routingKey}`;

    const handleResponse = async ({ error, ...message }) => {
      await this.amqp.unsubscribeConsumer(consumerTag);
      await this.amqp.deleteQueue(queue);
      if (error) {
        reject(Error(error));
      } else {
        resolve(message);
      }
    };

    this.amqp.subscribeTo(exchange, routingKey, queue, handleResponse, { consumerTag });
  }

  async sendRequest(routingKey, message) {
    const exchange = api.getExchange(routingKey);
    const responseKey = api.getResponseKey(routingKey);

    if (responseKey) {
      return new Promise((resolve, reject) => {
        this.subscribeToResponse(resolve, reject, responseKey);
        this.amqp.publishMessage(exchange, routingKey, message, this.headers);
      });
    }

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

  on(event, callback, options) {
    const routingKey = this.events[event];
    const exchange = api.getExchange(routingKey);

    const queue = `client-${exchange}-${event}`;
    return this.amqp.subscribeTo(exchange, routingKey, queue, callback, options);
  }
}
