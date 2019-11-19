const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const User = require('./../models/userModel');
const AppError = require('../utils/appError');

const singTonken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt
  });

  const token = singTonken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1) check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  //2) check if the user exist  and password is correct
  const user = await User.findOne({ email: email }).select('+password');
  //call User Model Instance method to reaturn a boolean
  // compare password that was provided by the user, with the password retrieved from the database with the users associated email
  const isCorrect = user
    ? await user.correctPassword(password, user.password)
    : false;

  if (!user || !isCorrect) {
    return next(new AppError('Incorrect email or password'));
  }

  //3) if everything is ok, send token to the client
  const token = singTonken(user._id);

  res.status(200).json({
    status: 'success',
    token
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  //1) Getting token and check if its there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please login to get access.', 401)
    );
  }
  //2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3)check if user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError('The user belonging to this token no longer exist.', 401)
    );
  }

  //4) Check if user changed password after the token was issues
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please login again', 401)
    );
  }

  //grant access to protected route
  req.user = freshUser;
  next();
});

// exports.restrictTo =
