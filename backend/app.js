const express       = require('express');
const cors          = require('cors');
const helmet        = require('helmet');
const morgan        = require('morgan');
const cookieParser  = require('cookie-parser');
const compression   = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const hpp           = require('hpp');

const { generalLimiter } = require('./middleware/rateLimit');

function createApp() {
  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet({ crossOriginEmbedderPolicy: false }));
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  }));
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());
  app.use(mongoSanitize());
  app.use(hpp());
  if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
  app.use(generalLimiter);

  app.use('/api/auth',          require('./routes/auth'));
  app.use('/api/users',         require('./routes/users'));
  app.use('/api/chats',         require('./routes/chats'));
  app.use('/api/messages',      require('./routes/messages'));
  app.use('/api/friends',       require('./routes/friends'));
  app.use('/api/groups',        require('./routes/groups'));
  app.use('/api/notifications', require('./routes/notifications'));
  app.use('/api/ai',            require('./routes/ai'));
  app.use('/api/search',        require('./routes/search'));
  app.use('/api/admin',         require('./routes/admin'));

  app.get('/api/health', (req, res) =>
    res.json({ status: 'ok', app: 'MeCHAT', version: '1.0.0', timestamp: new Date() })
  );

  // 404 handler
  app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

  // Error handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
  });

  return app;
}

module.exports = createApp;
