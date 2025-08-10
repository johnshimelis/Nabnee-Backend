const mongoose = require("mongoose");
const config = require("./config");

mongoose.Promise = global.Promise;

const mongoURI = config.mongoURI;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,         // fixes URL parser warning
  useUnifiedTopology: true,      // fixes Server Discovery warning
  connectTimeoutMS: 30000,
  socketTimeoutMS: 30000,
  serverSelectionTimeoutMS: 5000,
});

mongoose.connection
  .once("open", () => {
  console.log("\x1b[32m%s\x1b[0m", "✅ MongoDB connection has been established successfully");

  })
  .on("error", (error) => {
    console.error("MongoDB connection error:", error);
  });
