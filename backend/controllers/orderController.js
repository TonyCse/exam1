const axios = require('axios');
const Order = require('../models/Order');
const Product = require('../models/Product');

exports.createOrder = async (req, res) => {
  const { items, shippingAddress, paymentMethod, shippingMethod } = req.body;
  const userId = req.user.userId;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      message: "Le corps de la requête doit contenir un tableau d'objets { productId, quantity }.",
    });
  }

  try {
    // Récupère les prix depuis la base — le client ne peut pas les falsifier
    const orderDetails = [];
    for (const { productId, quantity } of items) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: `Produit introuvable : ${productId}` });
      }
      orderDetails.push({ productId, quantity, price: product.price });
    }

    const total = orderDetails.reduce(
      (acc, { price, quantity }) => acc + price * quantity,
      0
    );

    const newOrder = new Order({
      userId,
      items: orderDetails,
      total,
      shippingAddress,
      paymentMethod,
      shippingMethod,
    });

    const savedOrder = await newOrder.save();

    try {
      await axios.post('http://localhost:8000/notify', {
        to: 'syaob@yahoo.fr',
        subject: 'Nouvelle Commande Créée',
        text: `Une commande a été créée avec succès pour les produits suivants :\n${orderDetails
          .map((item) => `Produit ID : ${item.productId}, Quantité : ${item.quantity}`)
          .join('\n')}`,
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi de la notification", error);
    }

    res.status(201).json({ message: 'Commande créée avec succès', order: savedOrder });
  } catch (error) {
    console.error('Erreur lors de la création de la commande', error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la création de la commande.' });
  }
};

exports.deleteOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée.' });
    }
    res.json({ message: 'Commande supprimée' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la commande', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.validateOrder = async (req, res) => {
  const { orderId } = req.body;
  res.status(200).json({ message: `Commande ${orderId} validée avec succès.` });
};

exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    if (!status) {
      return res.status(400).json({ message: 'Le statut est requis.' });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée.' });
    }

    res.status(200).json({ message: 'Statut mis à jour avec succès', order });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la commande :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
