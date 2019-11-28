const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const User = require('./../models/userModel');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const singTonken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// create send token to user, and the user will use this token to perform actions, this token contains user details
const createSendToken = (user, statusCode, res) => {
  const token = singTonken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  //only want cooking in production
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }
  //attach cooking to requests
  res.cookie('jwt', token, cookieOptions);

  //remove the password from the output
  user.password = undefined; /*eslint no-param-reassign: "error"*/
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user
    }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role
  });

  createSendToken(newUser, 201, res);
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
  createSendToken(user, 201, res);
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

//wrapper function
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log(roles.includes(req.user.role));
    //roles ["admin", "lead-guide"]. role ='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perfome this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) get user based on posted email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }
  //2) Generate the random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); //remove all validating
  //3) sent it to users email
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/ysers/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a patch request with your new password and  passowrdConfirm to ${resetUrl}.\nIf you ddidnt forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token(valid for 10mins)',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

//this function will only be successful if the it is called less than 10mins after forgot password is called
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() } //user is back before 10mins
  });

  //2) if token has not expired, and there is a user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired!', 400));
  }

  //3) Update changed password property in user model method
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //4) Log the user in and send JWT
  createSendToken(user, 201, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1.) Get user from collection
  const user = await User.findById(req.user.id).select('+password');
  //2.) check if the posted currrent password is correct

  if (!user.correctPassword(req.body.passowrdCurrent, user.password)) {
    return next(new AppError('Your current password is wrong!', 401));
  }
  //3.) if so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //user.findOneAndUpdate will not work here

  //4.) log user in, send JWT
  createSendToken(user, 201, res);
});
