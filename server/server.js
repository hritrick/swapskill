const http = require('http');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

// Load env vars first — before anything that depends on them
dotenv.config();

// ─── Env-boot guard ───────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  const REQUIRED_ENV = ['JWT_SECRET', 'MONGODB_URI'];
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`\n❌  Missing required environment variables: ${missing.join(', ')}`);
    console.error('    Copy server/.env.example to server/.env and fill in the values.\n');
    process.exit(1);
  }
}

const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const { setIo } = require('./controllers/swapRequestController');
const { setIo: setSkillIo } = require('./controllers/skillController');

// (Database connection is initiated before server.listen below; tests manage their own in-memory connection)

const app = express();

// ─── Security middleware ──────────────────────────────────────────────────────
app.use(helmet());

// CORS: allow only the configured client origin in production, anything in dev
const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL]
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

// ─── Request logging ──────────────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Rate limiting ────────────────────────────────────────────────────────────
// Global limiter
const globalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests — please try again later.' },
});
app.use('/api/', globalLimiter);

// Tighter limiter for auth routes (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts — please try again in 15 minutes.' },
});

// ─── Body parser ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/skills', require('./routes/skillRoutes'));
app.use('/api/swaps', require('./routes/swapRoutes'));

// Health-check endpoint (useful for Docker / Render)
app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// ─── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── HTTP Server ──────────────────────────────────────────────────────────────
const server = http.createServer(app);

// ─── Socket.IO ────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Inject io into controllers (avoids circular require)
setIo(io);
setSkillIo(io);

// JWT authentication for socket connections
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Socket: authentication token missing'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    return next();
  } catch {
    return next(new Error('Socket: invalid or expired token'));
  }
});

io.on('connection', (socket) => {
  // Each user joins a private room keyed by their user ID
  // so we can emit targeted events: io.to(userId).emit(...)
  socket.join(socket.userId);
  console.log(`🔌  Socket connected: user ${socket.userId} (${socket.id})`);

  socket.on('disconnect', (reason) => {
    console.log(`🔌  Socket disconnected: user ${socket.userId} — ${reason}`);
  });
});

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5001;
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    server.listen(PORT, () => {
      console.log(`\n🚀  SwapSkill API running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    });
  }).catch((err) => {
    console.error('Failed to initialize database:', err);
  });
}

// Export for testing (supertest needs the app, integration tests need the server)
module.exports = { app, server };
