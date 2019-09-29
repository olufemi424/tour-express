const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const app = express();

// 1. MIDDLEWARES
app.use(morgan('dev'));

// built in middleware
app.use(express.json());

app.use((req, res, next) => {
  console.log('Hello from the middle ware 🌼');
  next();
});

app.use((req, res, next) => {
  req.reqestTime = new Date().toISOString();
  next();
});

// 2. ROUTE HANDLERS
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

const getAllTours = (req, res) => {
  console.log(req.reqestTime);
  res.status(200).json({
    status: 'succcess',
    requestedAt: req.reqestTime,
    result: tours.length,
    data: {
      tours
    }
  });
};

const getTour = (req, res) => {
  const id = +req.params.id;
  const tour = tours.find(el => el.id === id);
  // if (id > tours.length) {
  if (!tour) {
    return res.status(404).json({ status: 'fail', message: 'Invalid Id' });
  }
  res.status(200).json({
    status: 'succcess',
    data: {
      tour
    }
  });
};

const createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    err => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour
        }
      });
    }
  );
};
const updateTour = (req, res) => {
  if (+req.params.id > tours.length) {
    return res.status(404).json({ status: 'fail', message: 'Invalid Id' });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour: 'updated tour'
    }
  });
};

const deleteTour = (req, res) => {
  if (+req.params.id > tours.length) {
    return res.status(404).json({ status: 'fail', message: 'Invalid Id' });
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
};

// app.get('/api/v1/tours', getAllTours);

// app.post('/api/v1/tours', createTour);

// app.get('/api/v1/tours/:id', getTour);

// app.patch('/api/v1/tours/:id', updateTour);

// app.delete('/api/v1/tours/:id', deleteTour);

// 3.  ROUTES
app
  .route('/api/v1/tours')
  .get(getAllTours)
  .post(createTour);

app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

// 4. Start Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`App running on http://localhost:${PORT}`);
});
