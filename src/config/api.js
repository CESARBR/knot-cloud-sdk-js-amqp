// API reference: https://github.com/CESARBR/knot-fog-connector/blob/master/docs/api/amqp.md

export const REGISTER_DEVICE = 'device.register';
export const UNREGISTER_DEVICE = 'device.unregister';
export const AUTH_DEVICE = 'device.auth';
export const LIST_DEVICES = 'device.list';
export const UPDATE_SCHEMA = 'device.schema.sent';
export const PUBLISH_DATA = 'data.published';
export const REGISTER_DEVICE_RESPONSE = 'device.registered';
export const UNREGISTER_DEVICE_RESPONSE = 'device.unregistered';
export const UPDATE_SCHEMA_RESPONSE = 'device.schema.updated';
export const REQUEST_DATA = 'data.request';
export const UPDATE_DATA = 'data.update';

export const DEVICE_EXCHANGE = 'device';
export const DEVICE_EXCHANGE_TYPE = 'direct';

export const DATA_SENT_EXCHANGE = 'data.sent';
export const DATA_SENT_EXCHANGE_TYPE = 'fanout';

const requestExchanges = {
  [DEVICE_EXCHANGE]: {
    type: DEVICE_EXCHANGE_TYPE,
    keys: [
      AUTH_DEVICE,
      LIST_DEVICES,
      REGISTER_DEVICE,
      REGISTER_DEVICE_RESPONSE,
      UNREGISTER_DEVICE,
      UNREGISTER_DEVICE_RESPONSE,
      UPDATE_SCHEMA,
      UPDATE_SCHEMA_RESPONSE,
      REQUEST_DATA,
      UPDATE_DATA,
    ],
  },
};

const responses = {
  [REGISTER_DEVICE]: REGISTER_DEVICE_RESPONSE,
  [UNREGISTER_DEVICE]: UNREGISTER_DEVICE_RESPONSE,
  [UPDATE_SCHEMA]: UPDATE_SCHEMA_RESPONSE,
};

export const getExchange = (key) => {
  const [name] = Object
    .entries(requestExchanges)
    .find(([, obj]) => obj.keys.includes(key)) || [];
  return name;
};

export const getResponseKey = (key) => responses[key];
