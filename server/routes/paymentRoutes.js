const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

// Webhook do Mercado Pago (público)
router.post('/webhook', express.json(), paymentController.handleWebhook);

// Rotas protegidas
router.post('/create', auth, paymentController.createPayment);
router.get('/:paymentId/status', auth, paymentController.getPaymentStatus);

module.exports = router;
