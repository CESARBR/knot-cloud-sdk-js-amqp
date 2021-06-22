# knot-cloud-sdk-js-amqp

A client-side library that provides an AMQP abstraction to the KNoT Cloud for Node.js applications.

## Quickstart

### Install

```console
npm install --save @cesarbr/knot-cloud-sdk-js-amqp
```

### Run

`KNoT Cloud AMQP` communicates with a RabbitMQ broker at amqp://&lt;username&gt;:&lt;password&gt;@&lt;hostname&gt;:&lt;port&gt; using &lt;token&gt; as credential to execute the operations. Replace this address with your broker instance and the credentials with valid ones. In addition, the library should be configured with the HTTP address of the API Gateway (knot-babeltower).

```javascript
const Client = require('@cesarbr/knot-cloud-sdk-js-amqp');

const config = {
  amqp: {
    hostname: 'broker.knot.cloud',
    port: 5672,
    username: 'knot',
    password: 'knot',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // this is not a valid token!
  },
  http: {
    hostname: 'api.knot.cloud', // API Gateway address
    port: 80,
    protocol: 'http',
  },
};

const client = new Client(config);

const thing = {
  id: 'abcdef1234567890',
  name: 'my-thing',
};

const main = async () => {
  try {
    await client.connect();
    const response = await client.register(thing.id, thing.name);
    console.log('register response:', response);
    await client.close();
  } catch (err) {
    console.error(err);
  }
};

main();
```

## Methods

### Constructor(config)

Create a client object that will connect to a KNoT Cloud RabbitMQ instance.

#### Arguments

- `config` **Object** JSON object with the configuration.
  - `amqp` **Object** JSON object with broker properties.
    - `hostname` **String** (Optional) RabbitMQ instance hostname. Default: `'localhost'`.
    - `port` **Number** (Optional) RabbitMQ instance port. Default: 5672.
    - `username` **String** (Optional) RabbitMQ instance username. Default: `'knot'`.
    - `password` **String** (Optional) RabbitMQ instance password. Default: `'knot'`.
    - `token` **String** (Required) KNoT Cloud user token.
  - `http` **Object** JSON object with API Gateway configuration.
    - `hostname` **String** API Gateway hostname. Default: `'localhost'`.
    - `port` **Number** API Gateway port. Default: 80.
    - `protocol` **Number** API Gateway protocol. Default: `'http'`.

#### Example

```javascript
const Client = require('@cesarbr/knot-cloud-sdk-js-amqp');

const client = new Client(config);
```

### connect(): Promise&lt;Void&gt;

Connects to a RabbitMQ broker instance.

#### Example

```javascript
const Client = require('@cesarbr/knot-cloud-sdk-js-amqp');

const client = new Client(config);

const main = async () => {
  try {
    await client.connect();
    console.log('successfully connected!');
  } catch (err) {
    console.error(err);
  }
};

main();
```

### close(): Promise&lt;Void&gt;

Closes the current connection with the RabbitMQ broker instance.

#### Example

```javascript
const Client = require('@cesarbr/knot-cloud-sdk-js-amqp');

const client = new Client(config);

const main = async () => {
  try {
    await client.connect();
    await client.close();
    console.log('connection successfully closed');
  } catch (err) {
    console.error(err);
  }
};

main();
```

### register(id, name): Promise&lt;Object&gt;

Registers a new thing. Receives an object containing the registered thing's ID.

#### Arguments

- `id` **String** Thing's ID.
- `name` **String** Thing's name.

#### Result

- `device` **Object** JSON object in the following format:
  - `id` **String** Thing's ID.

#### Example

```javascript
const Client = require('@cesarbr/knot-cloud-sdk-js-amqp');

const client = new Client(config);

const thing = {
  id: 'abcdef1234567890',
  name: 'my-thing',
};

const main = async () => {
  try {
    await client.connect();
    const response = await client.register(thing.id, thing.name);
    console.log('thing successfully registered:', response);
    await client.close();
  } catch (err) {
    console.error(err);
  }
};

main();

/*
thing successfully registered:
{
  id: 'abcdef1234567890',
  token: '0d26d2e5-1611-477d-b8d3-46adbb14139a'
}
*/
```

### unregister(id): Promise&lt;Object&gt;

Removes a thing from the cloud.

#### Arguments

- `id` **String** Thing's ID.

#### Result

- `device` **Object** JSON object in the following format:
  - `id` **String** Thing's ID.

#### Example

```javascript
const Client = require('@cesarbr/knot-cloud-sdk-js-amqp');

const client = new Client(config);

const thing = {
  id: 'abcdef1234567890',
  name: 'my-thing',
};

const main = async () => {
  try {
    await client.connect();
    await client.register(thing.id, thing.name);
    const response = await client.unregister(thing.id);
    console.log('thing successfully unregistered:', response);
    await client.close();
  } catch (err) {
    console.error(err);
  }
};

main();

/*
thing successfully unregistered:
{
  id: 'abcdef1234567890'
}
*/
```

### getDevices(): Promise&lt;Object&gt;

List all things registered on cloud.

#### Result

- `devices` **Object** JSON object, containing set of things on cloud.

#### Example

```javascript
const Client = require('@cesarbr/knot-cloud-sdk-js-amqp');

const client = new Client(config);

const thing = {
  id: 'abcdef1234567890',
  name: 'my-thing',
};

const main = () => {
  try {
    await client.connect();
    await client.register(thing.id, thing.name);
    const response = client.getDevices();
    console.log('list of things:', response);
    await client.close();
  } catch (err) {
    console.error(err);
  }
};

main();

/*
list of things:
{
  devices: [
    {
      id: 'abcdef1234567890',
      name: 'my-thing'
    }
  ]
}
*/
```

### updateConfig(id, config): Promise&lt;Object&gt;

Updates the thing's config.

#### Arguments

- `id` **String** Thing's ID.
- `config` **Array** Objects in the following format:
  - `sensorId` **Number** Sensor ID.
  - `schema` **JSON Object** Schema definition, formed by:
    - `typeId` **Number** Semantic value type (voltage, current, temperature, etc).
    - `valueType` **Number** Data value type (boolean, integer, etc).
    - `unit` **Number** Sensor unit (V, A, W, W, etc).
    - `name` **String** Sensor name.
  - `event` **JSON Object** Event definition, formed by:
    - `change` **Boolean** Enable sending sensor data when its value changes
    - `timeSec` **Number - Optional** Time interval in seconds that indicates when data must be sent to the cloud
    - `lowerThreshold` **(Depends on schema's valueType) - Optional** Send data to the cloud if it's lower than this threshold
    - `upperThreshold` **(Depends on schema's valueType) - Optional** Send data to the cloud if it's upper than this threshold

#### Result

- `device` **Object** JSON object, containing thing's metadata.

#### Example

```javascript
const Client = require('@cesarbr/knot-cloud-sdk-js-amqp');

const client = new Client(config);

const thing = {
  id: 'abcdef1234567890',
  name: 'my-thing',
  config: [
    {
      sensorId: 0,
      schema: {
        typeId: 65521,
        valueType: 3,
        unit: 0,
        name: 'bool-sensor',
      },
      event: {
        change: true,
        timeSec: 10,
        lowerThreshold: 1000,
        upperThreshold: 3000,
      },
    },
  ],
};

const main = async () => {
  try {
    await client.connect();
    await client.register(thing.id, thing.name);
    const response = await client.updateConfig(thing.id, thing.config);
    console.log('config successfully updated:', response);
    await client.close();
  } catch (err) {
    console.error(err);
  }
};

main();

/*
config successfully updated:
{
  id: 'abcdef1234567890',
  name: 'my-thing',
  config: [{
    sensorId: 0,
    schema: {
      typeId: 65521,
      valueType: 3,
      unit: 0,
      name: 'bool-sensor',
    },
    event: {
      change: true,
      timeSec: 10,
      lowerThreshold: 1000,
      upperThreshold: 3000,
    }
  }]
}
*/
```

### publishData(id, data): Promise&lt;Void&gt;

Publishes thing's data.

#### Arguments

- `id` **String** Thing's ID.
- `data` **Array** Data in the following format:
  - `sensorId` **Number** Sensor ID.
  - `value` **String|Boolean|Number** Sensor value.

#### Example

```javascript
const Client = require('@cesarbr/knot-cloud-sdk-js-amqp');

const client = new Client(config);

const thingId = 'abcdef1234567890'; // thing already registered!

const main = async () => {
  try {
    await client.connect();
    await client.on('data', (err, msg) => {
      if (err) {
        console.error(err);
      } else {
        console.log('data published successfully:', msg);
      }
    });
    await client.publishData(thingId, [{ sensorId: 0, value: true }]);
    await client.close();
  } catch (err) {
    console.error(err);
  }
};

main();

/*
data published successfully:
{
  id: 'abcdef1234567890',
  data: [
    {
      sensorId: 0,
      value: true
    }
  ]
}
*/
```

### getData(id, sensorIds): Promise&lt;Void&gt;

Requests a thing to publish the current data value of the specified sensor(s).

#### Arguments

- `id` **String** Thing's ID.
- `sensorIds` **Array** Sensor IDs to request data from.

#### Example

```javascript
const Client = require('@cesarbr/knot-cloud-sdk-js-amqp');

const client = new Client(config);

const thingId = 'abcdef1234567890'; // thing already registered!

const main = async () => {
  try {
    await client.connect();
    await client.on('getData', (err, msg) => {
      if (err) {
        console.error(err);
      } else {
        console.log('data successfully requested:', msg);
      }
    });
    await client.getData(thingId, [0]);
    await client.close();
  } catch (err) {
    console.error(err);
  }
};

main();

/*
data successfully requested:
{
  id: 'abcdef1234567890',
  sensorIds: [0]
}
*/
```

### setData(id, data): Promise&lt;Void&gt;

Requests a thing to updates the current data value of the specified sensor(s).

#### Arguments

- `id` **String** Device ID.
- `data` **Array** Data items to be published, each one in the following format:
  - `sensorId` **Number** Sensor ID.
  - `value` **String|Boolean|Number** Sensor value.

#### Example

```javascript
const Client = require('@cesarbr/knot-cloud-sdk-js-amqp');

const client = new Client(config);

const thingId = 'abcdef1234567890'; // thing already registered!

const main = async () => {
  try {
    await client.connect();
    await client.on('setData', (err, msg) => {
      if (err) {
        console.error(err);
      } else {
        console.log('setData request successfully sent:', msg);
      }
    }
    await client.setData(thingId, [{ sensorId: 0, value: true }]);
    await client.close();
  } catch (err) {
    console.error(err);
  }
};

main();

/*
setData request successfully sent:
{
  id: 'abcdef1234567890',
  data: [{
    sensorId: 0,
    value: true
  }]
}
*/
```

### on(event, callback): Promise&lt;Void&gt;

Registers an event callback handler. See next section for details on events.

#### Arguments

- `name` **String** Event name.
- `callback` **Function** Event callback handler.

#### Example

```javascript
const Client = require('@cesarbr/knot-cloud-sdk-js-amqp');

const client = new Client(config);

const thingId = 'abcdef1234567890'; // thing already registered!

const main = async () => {
  try {
    await client.connect();
    await client.on('setData', (err, msg) => {
      if (err) {
        console.error(err);
      } else {
        console.log('data.update message sent:', msg);
      }
    });
    await Promise.all(
      [true, false, true].map((value) => {
        return client.publishData(thingId, [{ sensorId: 0, value }]);
      })
    );
    await client.close();
  } catch (err) {
    console.error(err);
  }
};

main();
```

### once(event, callback): Promise&lt;Void&gt;

Registers an callback handler only for next event occurrence. See next section for details on events.

#### Arguments

- `name` **String** Event name.
- `callback` **Function** Event callback handler.

#### Example

```javascript
const Client = require('@cesarbr/knot-cloud-sdk-js-amqp');

const client = new Client(config);

const thingId = 'abcdef1234567890'; // thing already registered!

const main = async () => {
  try {
    await client.connect();
    await client.once('setData', (err, msg) => {
      if (err) {
        console.error(err);
      } else {
        console.log('data.update message sent:', msg);
      }
    });
    await client.publishData(thingId, [{ sensorId: 0, value: true }]);
    await client.close();
  } catch (err) {
    console.error(err);
  }
};

main();
```

# Events

Events can be listened by registering a handler with `on` or `once` methods. The handler will receive two parameters: an object containing the message data and an error indicating if something went wrong (it can be `null`).

### Event: "data"

Triggered when a thing publishes sensor data.

#### Messages

- `id` **String** Thing's ID.
- `data` **Array** Data objects in the following format:
  - `sensorId` **Number** Sensor ID.
  - `value` **String|Boolean|Number** Sensor value.

#### Example

```javascript
{
  id: 'abcdef1234567890',
  data: [
    {
      sensorId: 0,
      value: false,
    },
    {
      sensorId: 1,
      35,
    },
  ],
}
```

### Event: "getData"

Triggered when a request for things to publish data is sent.

#### Message

- `id` **String** Thing's ID.
- `sensorIds` **Array** Sensor IDs to request data.

#### Example

```javascript
{
  id: 'abcdef1234567890',
  sensorIds: [0, 1],
}
```

### Event: "setData"

Triggered when a request for things to update data is sent.

#### Message

- `id` **String** Thing's ID.
- `data` **Array** Data objects in the following format:
  - `sensorId` **Number** Sensor ID.
  - `value` **String|Boolean|Number** Sensor value.

#### Example

```javascript
{
  id: 'abcdef1234567890',
  data: [
    {
      sensorId: 0,
      value: false,
    },
    {
      sensorId: 1,
      35,
    },
  ],
}
```
