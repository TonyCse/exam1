require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const notifiProxy = require('./routes/notifi');
const stockProxy = require('./routes/stock');
const logger = require('./logger');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'gateway', timestamp: new Date().toISOString() });
});

// app.use('/auth', require('./routes/auth'));
app.use('/notify', notifiProxy);
app.use('/update-stock', stockProxy);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  logger.info(`Gateway opérationnel sur le port ${PORT}`);
});
