const Review = require('./../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllReviews = catchAsync(async (req, res) => {
  //execute query
  const reviews = await Review.find({});

  res.status(200).json({
    status: 'succcess',
    results: reviews.length,
    data: {
      reviews
    }
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  // allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newReview
    }
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);

  if (!review) {
    return next(new AppError('No Review found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

//review controller
