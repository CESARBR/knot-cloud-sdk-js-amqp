import amqplib from 'amqplib';

export default class AMQP {
  constructor(config) {
    this.config = {
      protocol: 'amqp',
      hostname: config.hostname,
      port: config.port,
      username: config.username,
      password: config.password,
    };
  }

  async start() {
    this.connection = await amqplib.connect(this.config);
    this.channel = await this.connection.createChannel();
  }

  async stop() {
    await this.channel.close();
    await this.connection.close();
  }

  declareExchange(exchange) {
    this.channel.assertExchange(exchange, 'topic', { durable: true });
  }

  bindQueue(queue, exchange, routingKey) {
    this.channel.assertQueue(queue, { durable: true });
    this.channel.bindQueue(queue, exchange, routingKey);
  }

  publishMessage(exchange, routingKey, message, headers) {
    this.declareExchange(exchange);
    this.channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), { headers });
  }

  subscribeTo(exchange, routingKeys, queue, onMessage) {
    this.declareExchange(exchange);
    routingKeys.forEach((key) => this.bindQueue(queue, exchange, key));
    this.channel.consume(queue, (msg) => onMessage(JSON.parse(msg.content.toString())));
  }
}
