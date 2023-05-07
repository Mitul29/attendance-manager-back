const HttpException = require("../exceptions/HttpException");
const generalResponse = require("../helper/commonHelper");

const errorHandler = (error, req, res, next) => {
  if (error instanceof HttpException) {
    const status = error.status || 500;
    const message = error.message || "Something went wrong!";
    const data = error.data || null;

    return generalResponse(
      res,
      { data, meta: { error: error.message, message: "", status: status } },
      message,
      status
    );
  }

  const statusCode = res.statusCode ? res.statusCode : 500;
  generalResponse(
    res,
    {
      data: null,
      meta: { error: error.message, message: "", status: statusCode },
    },
    error.message,
    statusCode
  );
};

module.exports = errorHandler;
