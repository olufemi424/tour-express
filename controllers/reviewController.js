const Review = require('./../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getAllReviews = catchAsync(async (req, res) => {
  let filter = {};
  // find reviews for a particular tour
  if (req.params.tourId) filter = { tour: req.params.tourId };

  //execute query
  const reviews = await Review.find(filter);

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

exports.deleteReview = factory.deleteOne(Review);
