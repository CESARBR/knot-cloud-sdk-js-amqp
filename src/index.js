import Authenticator from '@cesarbr/knot-cloud-sdk-js-authenticator';
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
      ...config.amqp,
    });
    const auth = new Authenticator({
      hostname: 'localhost',
      port: 80,
      protocol: 'http',
      ...config.http,
    });

    super(config.amqp.token, amqp, auth, api);
  }
}
