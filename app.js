const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1.GLOBAL MIDDLEWARES
//serving static files
app.use(express.static(path.join(__dirname, 'public')));
//Helmet helps secure Express apps by setting various HTTP headers. It's not a silver bullet, but it can help!
app.use(helmet());

// development loggin
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // logger middleware
}

// limit requet from same apu
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many reqiests from this IP, please try again in an hour!'
});
app.use('/api', limiter); //limit all request on API

// Body parser, reading data from the body into req.body
// built-in json middleware
app.use(
  express.json({
    limit: '10kb'
  })
);
// parse url encoded, such as default form submissions.
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Parse Cookie header and populate req.cookies with an object keyed by the cookie names.
// Optionally you may enable signed cookie support by passing a secret string,
// which assigns req.secret so it may be used by other middleware.
app.use(cookieParser());

// Data sanitization against NoSQL query injection //	"email":{"$gt":""},
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// middleware to protect against HTTP Parameter Pollution attacks
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

//Test middleware
app.use((req, res, next) => {
  next();
});

// add request time to the req
app.use((req, res, next) => {
  req.reqestTime = new Date().toISOString();
  next();
});

// ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

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
