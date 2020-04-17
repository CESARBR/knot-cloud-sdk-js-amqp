// API reference: https://github.com/CESARBR/knot-fog-connector/blob/master/docs/api/amqp.md

export const REGISTER_DEVICE = 'device.register';
export const UNREGISTER_DEVICE = 'device.unregister';
export const LIST_DEVICES = 'device.cmd.list';
export const UPDATE_SCHEMA = 'schema.update';
export const PUBLISH_DATA = 'data.publish';

export const REGISTER_DEVICE_RESPONSE = 'device.registered';
export const UNREGISTER_DEVICE_RESPONSE = 'device.unregistered';
export const LIST_DEVICES_RESPONSE = 'device.list';
export const UPDATE_SCHEMA_RESPONSE = 'schema.updated';
export const REQUEST_DATA = 'data.request';
export const UPDATE_DATA = 'data.update';

const exchanges = {
  fogIn: [
    REGISTER_DEVICE,
    UNREGISTER_DEVICE,
    LIST_DEVICES,
    UPDATE_SCHEMA,
    PUBLISH_DATA,
  ],
  fogOut: [
    REGISTER_DEVICE_RESPONSE,
    UNREGISTER_DEVICE_RESPONSE,
    LIST_DEVICES_RESPONSE,
    UPDATE_SCHEMA_RESPONSE,
  ],
  connOut: [
    REQUEST_DATA,
    UPDATE_DATA,
  ],
};

const responses = {
  [REGISTER_DEVICE]: REGISTER_DEVICE_RESPONSE,
  [UNREGISTER_DEVICE]: UNREGISTER_DEVICE_RESPONSE,
  [LIST_DEVICES]: LIST_DEVICES_RESPONSE,
  [UPDATE_SCHEMA]: UPDATE_SCHEMA_RESPONSE,
};

export const getExchange = (key) => {
  const [exchange] = Object.entries(exchanges)
    .find(([, keys]) => keys.includes(key)) || [];
  return exchange;
};

export const getResponseKey = (key) => responses[key];
