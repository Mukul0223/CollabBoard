// config/cors.js
const cors = require("cors");
const env = require("./env");

// Parse origins into an array (handles comma-separated strings or defaults)
const getAllowedOrigins = () => {
  const defaultOrigins = ["http://localhost:5173", "http://localhost:3000"];
  if (!env.CLIENT_ORIGIN) return defaultOrigins;

  // Supports single string or comma-separated list in env: "https://my-app.vercel.app,https://my-domain.com"
  const origins = env.CLIENT_ORIGIN.split(",").map((o) => o.trim());
  return [...new Set([...origins, ...defaultOrigins])];
};

const allowedOrigins = getAllowedOrigins();

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};

const configureCors = (app) => {
  app.use(cors(corsOptions));
};

module.exports = configureCors;
module.exports.corsOptions = corsOptions; // Exported so Socket.IO can reuse it
