require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const connection = require("./connection");
const index = require("./routes/routes");
const config = require("./config");

const app = express();

// ================== CORS Configuration ================== //

// Add localhost automatically in development
const allowedOrigins = [
  ...config.corsOrigins,

  // Always allow localhost for dev
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",

  // Your existing domains
  "https://nabnee-backend.onrender.com",
  "https://admin.nabnee.com",
  "http://45.63.20.179",
  "https://45.63.20.179",

  // Ngrok tunnels (for testing)
  /https?:\/\/.*\.ngrok\.io$/,
  /https?:\/\/.*\.ngrok-free\.app$/
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow server-to-server or Postman requests
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some(allowed => {
      return typeof allowed === "string" ? origin === allowed : allowed.test(origin);
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.error(`❌ CORS blocked for origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "x-api-key",
    "_id"
  ],
  exposedHeaders: ["x-auth-token"]
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight requests

// ================== Middleware ================== //
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// Static files
app.use("/img_directory", express.static("img_directory"));
app.use("/assets", express.static("assets"));
app.use("/images", express.static(path.join(__dirname, "public")));

// ================== Routes ================== //
app.use("/", index);

// ================== Error Handling ================== //
app.use((req, res, next) => {
  res.status(404).json({ error: "Endpoint not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// ================== Server Start ================== //
const PORT = config.port || process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`
  🚀 Server running in ${process.env.NODE_ENV || "development"} mode
  Backend URL: http://localhost:${PORT}
  API Docs: http://localhost:${PORT}/api-docs
  `);
});

module.exports = app;
