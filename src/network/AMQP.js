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

  async declareExchange(exchange, type, options = { durable: true }) {
    await this.channel.assertExchange(exchange, type, options);
  }

  async bindQueue(queue, exchange, routingKey) {
    await this.channel.assertQueue(queue, {
      exclusive: true,
      autoDelete: true,
    });
    await this.channel.bindQueue(queue, exchange, routingKey);
  }

  async publishMessage(exchange, type, routingKey, message, headers) {
    await this.declareExchange(exchange, type);
    this.channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { headers }
    );
  }

  async subscribeTo(exchange, type, routingKey, queue, onMessage, options) {
    const callback = (msg) => onMessage(JSON.parse(msg.content.toString()));
    await this.declareExchange(exchange, type);
    await this.bindQueue(queue, exchange, routingKey);
    return this.channel.consume(queue, callback, options);
  }

  async unsubscribeConsumer(consumer) {
    return this.channel.cancel(consumer);
  }
}
