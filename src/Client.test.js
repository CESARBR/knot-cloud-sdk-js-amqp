import AMQP, * as amqpMocks from './network/AMQP';
import * as api from './config/api';
import Client from './Client';

jest.mock('./network/AMQP');

const mockToken = 'my-authorization-token';
const mockThing = {
  id: 'abcdef1234568790',
  name: 'my-device',
  schema: [
    {
      sensorId: 0,
      typeId: 65521,
      valueType: 3,
      unit: 0,
      name: 'bool-sensor',
    },
  ],
};

const errors = {
  // Client methods
  register: 'error registering thing',
  unregister: 'error unregistering thing',
  // AMQP methods
  start: 'error while starting AMQP connection',
  stop: 'error while stopping AMQP connection',
  publishMessage: 'error publishing message on broker',
  subscribeTo: 'error subscribing consumer on queue',
  unsubscribeConsumer: 'error unsubscribing consumer',
};

const registerUseCases = [
  {
    testName: 'should register when there is no error at all',
    amqpOptions: {
      responseMessage: { id: mockThing.id },
    },
  },
  {
    testName: 'should fail to register when response has some error',
    amqpOptions: {
      responseMessage: { id: mockThing.id, error: errors.register },
    },
    expectedErr: errors.register,
  },
  {
    testName: 'should fail to register when unable to publish to channel',
    amqpOptions: {
      publishErr: errors.publishMessage,
    },
    expectedErr: errors.publishMessage,
  },
  {
    testName: 'should fail to register when unable to subscribe on channel',
    amqpOptions: {
      subscribeErr: errors.subscribeTo,
    },
    expectedErr: errors.subscribeTo,
  },
  {
    testName: 'should register even when unable to unsubscribe consumer',
    amqpOptions: {
      responseMessage: { id: mockThing.id },
      unsubscribeErr: errors.unsubscribeConsumer,
    },
  },
];

const unregisterUseCases = [
  {
    testName: 'should unregister thing when there is no error at all',
    amqpOptions: {
      responseMessage: { id: mockThing.id },
    },
  },
  {
    testName: 'should fail to unregister when response has some error',
    amqpOptions: {
      responseMessage: { id: mockThing.id, error: errors.unregister },
    },
    expectedErr: errors.unregister,
  },
];

describe('Client', () => {
  beforeEach(() => {
    amqpMocks.mockStart.mockClear();
    amqpMocks.mockStop.mockClear();
    amqpMocks.mockPublishMessage.mockClear();
    amqpMocks.mockSubscribeTo.mockClear();
    amqpMocks.mockUnsubscribeConsumer.mockClear();
  });

  registerUseCases.forEach((useCase) => {
    const { testName, amqpOptions, expectedErr } = useCase;

    test(`register: ${testName}`, async () => {
      const amqp = new AMQP(amqpOptions);
      const client = new Client(mockToken, amqp, api);
      let response;
      let error;

      try {
        response = await client.register(mockThing.id, mockThing.name);
      } catch (err) {
        error = err.message;
      }

      if (response) {
        expect(response).toMatchObject(amqpOptions.responseMessage);
      }
      if (error) {
        expect(error).toBe(expectedErr);
      }
    });
  });

  unregisterUseCases.forEach((useCase) => {
    const { testName, amqpOptions, expectedErr } = useCase;

    test(`unregister: ${testName}`, async () => {
      const amqp = new AMQP(amqpOptions);
      const client = new Client(mockToken, amqp, api);
      let response;
      let error;

      try {
        response = await client.unregister(mockThing.id);
      } catch (err) {
        error = err.message;
      }

      if (response) {
        expect(response).toMatchObject(amqpOptions.responseMessage);
      }
      if (error) {
        expect(error).toBe(expectedErr);
      }
    });
  });
});
