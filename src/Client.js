import uniqid from 'uniqid';

// Based on websocket interface: https://github.com/CESARBR/knot-cloud-websocket#methods
class Client {
  constructor(token, amqp, api) {
    this.amqp = amqp;
    this.api = api;
    this.headers = { Authorization: token };
    this.userKey = uniqid();
  }

  async subscribeToResponse(resolve, reject, req, resp, message) {
    const queue = `${resp.key}-${this.userKey}`;
    const consumerTag = uniqid.time(`${queue}-`);
    const handler = async ({ error, ...reply }) => {
      if (reply.id === message.id) {
        this.amqp
          .unsubscribeConsumer(consumerTag)
          .catch((err) => console.log(err.message));
        if (error) {
          reject(Error(error));
        } else {
          resolve(reply);
        }
      }
    };
    await this.amqp.subscribeTo(
      resp.name,
      resp.type,
      resp.key,
      queue,
      handler,
      { consumerTag }
    );
    try {
      await this.amqp.publishMessage(
        req.name,
        req.type,
        req.key,
        message,
        this.headers
      );
    } catch (err) {
      await this.amqp.unsubscribeConsumer(consumerTag);
      throw err;
    }
  }

  async sendRequest(req, resp, message) {
    return new Promise((resolve, reject) =>
      this.subscribeToResponse(
        resolve,
        reject,
        req,
        resp,
        message
      ).catch((err) => reject(err))
    );
  }

  setReplyOptions() {
    const replyTo = uniqid();
    this.headers.reply_to = replyTo;
    this.headers.correlation_id = '';
    return replyTo;
  }

  async connect() {
    return this.amqp.start();
  }

  async close() {
    return this.amqp.stop();
  }

  async register(id, name) {
    const msg = { id, name };
    const req = this.api.getDefinitionByKey(this.api.REGISTER_DEVICE);
    const resp = {
      name: req.name,
      type: req.type,
      key: this.api.getResponseKey(this.api.REGISTER_DEVICE),
    };
    return this.sendRequest(req, resp, msg);
  }

  async unregister(id) {
    const msg = { id };
    const req = this.api.getDefinitionByKey(this.api.UNREGISTER_DEVICE);
    const resp = {
      name: req.name,
      type: req.type,
      key: this.api.getResponseKey(this.api.UNREGISTER_DEVICE),
    };
    return this.sendRequest(req, resp, msg);
  }

  async authDevice(id) {
    const msg = { id };
    const correlationId = this.setReplyOptions();
    const req = this.api.getDefinitionByKey(this.api.AUTH_DEVICE);
    const resp = { name: req.name, type: req.type, key: correlationId };
    return this.sendRequest(req, resp, msg);
  }

  async getDevices() {
    const replyTo = this.setReplyOptions();
    const req = this.api.getDefinitionByKey(this.api.LIST_DEVICES);
    const resp = { name: req.name, type: req.type, key: replyTo };
    return this.sendRequest(req, resp, {});
  }

  async updateSchema(id, schemaList) {
    const msg = { id, schema: schemaList };
    const req = this.api.getDefinitionByKey(this.api.UPDATE_SCHEMA);
    const resp = {
      name: req.name,
      type: req.type,
      key: this.api.getResponseKey(this.api.UPDATE_SCHEMA),
    };
    return this.sendRequest(req, resp, msg);
  }

  async publishData(id, dataList) {
    const msg = { id, data: dataList };
    return this.amqp.publishMessage(
      this.api.DATA_SENT_EXCHANGE,
      this.api.DATA_SENT_EXCHANGE_TYPE,
      '',
      msg,
      this.headers
    );
  }

  async getData(id, sensorIds) {
    const msg = { id, sensorIds };
    const req = this.api.getDefinitionByKey(this.api.REQUEST_DATA);
    return this.amqp.publishMessage(
      req.name,
      req.type,
      req.key,
      msg,
      this.headers
    );
  }

  async setData(id, dataList) {
    const msg = { id, data: dataList };
    const req = this.api.getDefinitionByKey(this.api.UPDATE_DATA);
    return this.amqp.publishMessage(
      req.name,
      req.type,
      req.key,
      msg,
      this.headers
    );
  }

  async once(event, callback, options = {}) {
    const queue = `${event}-${this.userKey}`;
    const consumerTag = uniqid.time(`${queue}-`);
    return this.on(
      event,
      async (msg) => {
        this.amqp.unsubscribeConsumer(consumerTag);
        const { error, ...message } = msg;
        callback(error, message);
      },
      { ...options, consumerTag }
    );
  }

  async on(event, callback, options) {
    const queue = `${event}-${this.userKey}`;

    if (!this.isValidEvent(event)) {
      throw new Error('Event not recognized!');
    }

    const exchange =
      event === 'data'
        ? {
            name: this.api.PUBLISH_DATA,
            type: this.api.DATA_SENT_EXCHANGE_TYPE,
          }
        : {
            name: this.api.DEVICE_EXCHANGE,
            type: this.api.DEVICE_EXCHANGE_TYPE,
          };

    return this.amqp.subscribeTo(
      exchange.name,
      exchange.type,
      event,
      queue,
      callback,
      options
    );
  }

  isValidEvent(event) {
    // Regex to check if event follows the pattern device.*.data.*
    const dataRegex = /device\.([a-f0-9]{16})\.data\.(request|update)/;
    return dataRegex.test(event) || event === 'data';
  }
}

export default Client;
