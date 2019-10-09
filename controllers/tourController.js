const Tour = require('./../models/tourModel');

exports.checkTourBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing Tour name or Price'
    });
  }
  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'succcess',
    data: {
      tours: 'return all tours'
    }
  });
};

exports.getTour = (req, res) => {
  res.status(200).json({
    status: 'succcess',
    data: {
      tour: 'return tour'
    }
  });
};

exports.createTour = (req, res) => {
  res.status(201).json({
    status: 'success',
    data: {
      tour: 'Create tour'
    }
  });
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: 'updated tour'
    }
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null
  });
};
