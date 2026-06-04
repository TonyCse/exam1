require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const nodemailer = require('nodemailer');
const logger = require('./logger');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'notifications', timestamp: new Date().toISOString() });
});

app.post('/notify', async (req, res) => {
  const { to, subject, text } = req.body;
  logger.info(`Envoi email à ${to}, sujet: ${subject}`);

  const mailOptions = {
    from: process.env.MAIL_FROM,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info('Email envoyé avec succès');
    return res.status(200).json({ message: 'Email envoyé avec succès.' });
  } catch (error) {
    logger.error("Erreur lors de l'envoi de l'email", { error });
    return res.status(500).json({ message: "Erreur lors de l'envoi de l'email." });
  }
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  logger.info(`Service de notification en écoute sur le port ${PORT}`);
});
