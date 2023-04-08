const generalResponse = (res, data = {}, message = "", statusCode = 200) => {
  res.status(statusCode).json({
    data,
    meta: {
      message,
      error: null,
      status: statusCode,
    },
  });
};

module.exports = generalResponse;
