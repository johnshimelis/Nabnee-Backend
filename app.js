require("dotenv").config();
let express = require("express");
let path = require("path");
let bodyParser = require("body-parser");
let cors = require("cors");
let connection = require("./connection");
let index = require("./routes/routes");
let https = require("https");
let fs = require("fs");
let app = express();

// Define CORS configuration options
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:8080",
      "http://localhost:8081",
      "http://127.0.0.1:8080",
      "http://127.0.0.1:8081",
      "https://localhost:8080",
      "https://localhost:8081",
      "https://127.0.0.1:8080",
      "https://127.0.0.1:8081",
      "http://localhost:5173",
      "http://nabnee.com",
      "https://nabnee.com",
      "http://www.nabnee.com",
      "https://www.nabnee.com",
      "https://admin.nabnee.com",
      "http://45.63.20.179",
      "https://45.63.20.179",
    ];

    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);

    // Check against allowed origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else if (
      origin &&
      // Allow ngrok HTTPS domains (these are dynamic)
      (/https:\/\/.*\.ngrok\.io$/.test(origin) ||
        // Allow ngrok-free domains (newer format)
        /https:\/\/.*\.ngrok-free\.app$/.test(origin))
    ) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed for this origin"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "x-api-key",
    "_id",
  ],
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Add a middleware to handle preflight requests with the same CORS options
app.options("*", cors(corsOptions));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use("/img_directory", express.static("img_directory"));

// Increase header size limits to prevent 431 errors
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use("/assets", express.static("assets"));
app.use("/images", express.static(path.join(__dirname, "public")));

app.use("/", index);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  let err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
module.exports = app;
