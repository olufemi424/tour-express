/*eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["err","error"] }]*/

const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 404);
};

const handleDubplicateDB = err => {
  let value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  value = value.replace(/\\/g, ' ');

  const message = `Duplicate field value: ${value}. Please use another name`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid Token, Please login again!.', 401);

const handleJWTExpiredError = () =>
  new AppError('Your Token has expired!. Please login again', 401);

const sendErrorForDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorForProd = (err, res) => {
  // Operational, trusted error: Send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
    // Programing or other unknown error: don't leak error detils
  } else {
    // 1.) Log Error
    console.error('ERROR :', err);

    //2.) send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong'
    });
  }
};

module.exports = (err, req, res, next) => {
  //   console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorForDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDubplicateDB(error);
    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }
    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError(error);
    }

    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError(error);
    }

    sendErrorForProd(error, res);
  }
};
