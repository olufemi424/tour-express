const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1.GLOBAL MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // logger middleware
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many reqiests from this IP, please try again in an hour!'
});
app.use('/api', limiter); //limit all request on API

app.use(express.json()); // built-in json middleware
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  next();
});

app.use((req, res, next) => {
  req.reqestTime = new Date().toISOString();
  next();
});

// ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//not found error handling
app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 400;
  const error = new AppError(
    `Can't find ${req.originalUrl} on this server!`,
    404
  );
  next(error);
});

//error handling
app.use(globalErrorHandler);

//Start Server
module.exports = app;
