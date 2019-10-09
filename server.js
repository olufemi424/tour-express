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
  name: { type: String, required: [true, 'A tour must have a name'] },
  rating: { type: Number, default: 4.5, unique: true },
  price: { type: Number, required: [true, 'A tour must have a price'] }
});

const Tour = mongoose.model('Tour', tourSchema);

app.listen(PORT, () => {
  console.log(`App running on http://localhost:${PORT}`);
});
