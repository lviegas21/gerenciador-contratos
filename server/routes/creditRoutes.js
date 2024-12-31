const express = require('express');
const router = express.Router();
const creditController = require('../controllers/creditController');
const auth = require('../middleware/auth');

// Rotas públicas
router.post('/webhook', express.raw({ type: 'application/json' }), creditController.handleStripeWebhook);

// Rotas protegidas
router.get('/packages', auth, creditController.getCreditPackages);
router.get('/user', auth, creditController.getUserCredits);
router.post('/checkout', auth, creditController.createCheckoutSession);
router.post('/deduct', auth, creditController.deductCredit);

module.exports = router;
