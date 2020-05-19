export const mockStart = jest.fn();
export const mockStop = jest.fn();
export const mockPublishMessage = jest.fn();
export const mockSubscribeTo = jest.fn();
export const mockUnsubscribeConsumer = jest.fn();

export default jest.fn().mockImplementation((options = {}) => {
  let mockCallback = () => {};

  // start
  if (options.startErr) {
    mockStart.mockRejectedValue(Error(options.startErr));
  } else {
    mockStart.mockResolvedValue();
  }

  // stop
  if (options.stopErr) {
    mockStop.mockRejectedValue(Error(options.stopErr));
  } else {
    mockStop.mockResolvedValue();
  }

  // publishMessage
  mockPublishMessage.mockImplementation(() => {
    if (options.publishErr) {
      return Promise.reject(Error(options.publishErr));
    }
    mockCallback(options.responseMessage);
    return Promise.resolve(options.publishRet);
  });

  // subscribeTo
  mockSubscribeTo.mockImplementation((e, t, k, q, callback) => {
    if (options.subscribeErr) {
      return Promise.reject(Error(options.subscribeErr));
    }
    mockCallback = callback;
    return Promise.resolve(options.subscribeRet);
  });

  // unsubscribeConsumer
  if (options.unsubscribeErr) {
    mockUnsubscribeConsumer.mockRejectedValue(Error(options.unsubscribeErr));
  } else {
    mockUnsubscribeConsumer.mockResolvedValue();
  }

  const executeEvent = () => {
    mockCallback();
  };

  return {
    start: mockStart,
    stop: mockStop,
    publishMessage: mockPublishMessage,
    subscribeTo: mockSubscribeTo,
    unsubscribeConsumer: mockUnsubscribeConsumer,
    executeEvent,
  };
});
