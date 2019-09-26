const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();

app.use(express.json());

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'succcess',
    result: tours.length,
    data: {
      tours
    }
  });
});

app.get('/api/v1/tours/:id', (req, res) => {
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
});

app.post('/api/v1/tours', (req, res) => {
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
});

app.patch('/api/v1/tours/:id', (req, res) => {
  if (+req.params.id > tours.length) {
    return res.status(404).json({ status: 'fail', message: 'Invalid Id' });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour: 'updated tour'
    }
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`App running on http://localhost:${PORT}`);
});
