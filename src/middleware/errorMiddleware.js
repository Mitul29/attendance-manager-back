const errorHandler = (err, req, res, next) => {
  console.log(err);
  const statusCode = res.statusCode ? res.statusCode : 500;
  res.status(statusCode).json({
    data: null,
    meta: {
      error: err.message,
      message: "",
      status: statusCode,
    },
  });
};

module.exports = errorHandler;
