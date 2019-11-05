/*eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["err"] }]*/

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
  if (err.isOpreational) {
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
    sendErrorForProd(err, res);
  }
};
