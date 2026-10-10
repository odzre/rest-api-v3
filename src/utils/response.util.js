export const sendResponse = (res, statusCode, success, message, data = null) => {
  return res.status(statusCode).json({
    success,
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};
