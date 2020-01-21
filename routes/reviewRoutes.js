const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

//mergePrams will take in incoming routes
const router = express.Router({ mergeParams: true });

//POST /tour/243nm2/reviews
//GET /tour/243nm2/reviews //get all reviews for a particular post
//POST /reviews
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .patch(reviewController.updateReview)
  .delete(
    authController.protect,
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = router;
