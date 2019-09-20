const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res
    .status(200)
    .json({ message: 'Hello from the server !', app: 'Hotel Express' });
});

//Set up route to handle request and responses
app.post('/', (req, res) => {
  res.send('You can post to this end point');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`App running on http://localhost:${PORT}`);
});
