require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const logger = require('./logger');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'stock-management', timestamp: new Date().toISOString() });
});

app.post('/update-stock', (req, res) => {
  const { productId, quantity } = req.body;
  logger.info(`Mise à jour du stock: Produit ${productId}, Quantité ${quantity}`);
  res.json({ message: `Stock mis à jour pour le produit de ID : ${productId}` });
});

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => logger.info(`Service de gestion des stocks sur le port ${PORT}`));
