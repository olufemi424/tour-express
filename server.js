const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

const app = require('./app');

const PORT = process.env.PORT || 8000;

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-yzj5q.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
  )
  .then(() => {
    console.log(`db connect successful`);
  })
  .catch(err => console.log(err));

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true
  },
  rating: { type: Number, default: 4.5 },
  price: { type: Number, required: [true, 'A tour must have a price'] }
});

const Tour = mongoose.model('Tour', tourSchema);

const testTour = new Tour({
  name: 'Test Tour 3',
  price: 997,
  rating: 4.6
});

testTour
  .save()
  .then(doc => console.log(doc))
  .catch(err => console.log(err));

app.listen(PORT, () => {
  console.log(`App running on http://localhost:${PORT}`);
});
