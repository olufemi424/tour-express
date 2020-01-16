const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-yzj5q.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
  )
  .then(() => {
    console.log(`DB connected successful`);
  })
  .catch(err => console.log(err));

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`App running on http://localhost:${PORT}`);
});

//unhandle routes error
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLE REJECTION! Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
