import AMQP from './network/AMQP';

// Based on websocket interface: https://github.com/CESARBR/knot-cloud-websocket#methods
export default class Client {
  constructor(config = {}) {
    this.headers = { Authorization: config.token };
    this.amqp = new AMQP({
      hostname: 'localhost',
      port: 5672,
      username: 'knot',
      password: 'knot',
      ...config,
    });
  }

  async connect() {
    return this.amqp.start();
  }

  async close() {
    return this.amqp.stop();
  }

  register(id, name) {
    const msg = { id, name };
    this.amqp.publishMessage('fogIn', 'device.register', msg, this.headers);
  }

  unregister(id) {
    const msg = { id };
    this.amqp.publishMessage('fogIn', 'device.unregister', msg, this.headers);
  }

  getDevices() {
    const msg = {};
    this.amqp.publishMessage('fogIn', 'device.cmd.list', msg, this.headers);
  }

  updateSchema(id, schemaList) {
    const msg = { id, schema: schemaList };
    this.amqp.publishMessage('fogIn', 'schema.update', msg, this.headers);
  }

  publishData(id, dataList) {
    const msg = { id, data: dataList };
    this.amqp.publishMessage('fogIn', 'data.publish', msg, this.headers);
  }

  getData(id, sensorIds) {
    const msg = { id, sensorIds };
    this.amqp.publishMessage('connOut', 'data.request', msg, this.headers);
  }

  setData(id, dataList) {
    const msg = { id, data: dataList };
    this.amqp.publishMessage('connOut', 'data.update', msg, this.headers);
  }

  on(event, callback, options) {
    let exchange;
    let routingKeys;

    switch (event) {
      case 'device':
        exchange = 'fogOut';
        routingKeys = ['device.registered', 'device.unregistered', 'device.list'];
        break;
      case 'schema':
        exchange = 'fogOut';
        routingKeys = ['schema.updated'];
        break;
      case 'data':
        exchange = 'fogIn';
        routingKeys = ['data.publish'];
        break;
      default:
    }

    const queue = `client-${exchange}-${event}`;
    return this.amqp.subscribeTo(exchange, routingKeys, queue, callback, options);
  }
}
