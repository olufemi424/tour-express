const dotenv = require('dotenv');
const connectDb = require('./config/db');

process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  process.exit(1);
});

dotenv.config({ path: './config/config.env' });

const app = require('./app');

//connect database func
connectDb();

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log(`App running on http://localhost:${PORT}`);
});

//unhandle routes error
process.on('unhandledRejection', err => {
  console.log(err);
  console.log(err.name, err.message);
  console.log('UNHANDLE REJECTION! Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
