// config.js
const environment = process.env.NODE_ENV || 'development';

const config = {
  development: {
    mongoURI: 'mongodb://localhost:27017/nabnee',
    port: 3001,
    corsOrigins: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:8080", 
      "http://localhost:8081", 
      "http://127.0.0.1:8080", 
      "http://127.0.0.1:8081",
      "https://localhost:8080", 
      "https://localhost:8081",
      "https://127.0.0.1:8080",
      "https://127.0.0.1:8081"
    ]
  },
  production: {
    mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/nabnee',
    port: process.env.PORT || 3001,
    corsOrigins: [
      "http://nabnee.com",
      "https://nabnee.com", 
      "http://www.nabnee.com",
      "https://www.nabnee.com",
      "http://45.63.20.179"
    ]
  },
  test: {
    mongoURI: 'mongodb://localhost:27017/nabnee_test',
    port: 3001,
    corsOrigins: ["http://localhost:8080"]
  }
};

module.exports = config[environment];
