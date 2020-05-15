import AMQP from './network/AMQP';
import * as api from './config/api';
import Client from './Client';

export default class Main extends Client {
  constructor(config = {}) {
    const amqp = new AMQP({
      hostname: 'localhost',
      port: 5672,
      username: 'knot',
      password: 'knot',
      ...config,
    });
    super(config.token, amqp, api);
  }
}
