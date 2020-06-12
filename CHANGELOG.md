
# [2.0.0](https://github.com/CESARBR/knot-cloud-sdk-js-amqp/compare/v1.0.1...v2.0.0)

## Feature

  - Add support to the new AMQP API documented [here](https://github.com/CESARBR/knot-babeltower/blob/master/docs/events.md)

## Bug Fixes

  - Fix error catching when subscribing to response

## Improvements

  - Add prettier formatter
  - Add unit test to all operations

# [1.0.1](https://github.com/CESARBR/knot-cloud-sdk-js-amqp/compare/v1.0.0...v1.0.1)

## Bug Fixes

  - Wait to publish message after subscription
  - Fix `handleResponse` callback
  - Fix error when pass invalid event to `on`

## Improvements

  - Change `queue` and `consumerTag` default names
  - Use `uniqid` lib instead of random numbers

# [1.0.0](https://github.com/CESARBR/knot-cloud-sdk-js-amqp/compare/5770b30...v1.0.0)

## Features

- Methods to communicate with [KNoT Cloud Core AMQP API](https://github.com/CESARBR/knot-fog-connector/blob/master/docs/api/amqp.md).
  - connect()
  - close()
  - register()
  - unregister()
  - getDevices()
  - updateSchema()
  - publishData()
  - getData()
  - setData()
  - on()