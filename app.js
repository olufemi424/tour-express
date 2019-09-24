const fs = require('fs');
const express = require('express');

const app = express();

// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .json({ message: 'Hello from the server !', app: 'Hotel Express' });
// });

// //Set up route to handle request and responses
// app.post('/', (req, res) => {
//   res.send('You can post to this end point');
// });

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

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`App running on http://localhost:${PORT}`);
});
