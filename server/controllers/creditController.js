const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Preços fixos para os pacotes de créditos (R$2 por contrato)
const CREDIT_PACKAGES = {
  basic: {
    credits: 5,
    price: 1000, // R$10.00 (5 contratos x R$2)
    priceId: 'price_seu_id_basic' // Você precisará criar este preço no Stripe
  },
  pro: {
    credits: 25,
    price: 4500, // R$45.00 (25 contratos x R$1.80)
    priceId: 'price_seu_id_pro'
  },
  business: {
    credits: 100,
    price: 16000, // R$160.00 (100 contratos x R$1.60)
    priceId: 'price_seu_id_business'
  }
};

exports.getCreditPackages = async (req, res) => {
  try {
    // Retorna os pacotes sem os IDs dos preços
    const packages = Object.entries(CREDIT_PACKAGES).reduce((acc, [key, value]) => {
      const { priceId, ...rest } = value;
      acc[key] = rest;
      return acc;
    }, {});
    
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCheckoutSession = async (req, res) => {
  try {
    const { packageType } = req.body;
    const package = CREDIT_PACKAGES[packageType];
    
    if (!package) {
      return res.status(400).json({ error: 'Pacote inválido' });
    }

    // Criar sessão do Stripe com preço fixo
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: package.priceId, // Usa o ID do preço criado no Stripe
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/dashboard?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard?canceled=true`,
      metadata: {
        userId: req.user.id,
        packageType,
        credits: package.credits,
      },
      payment_intent_data: {
        metadata: {
          userId: req.user.id,
          packageType,
          credits: package.credits,
        },
      },
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Erro no webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manipula o evento de pagamento bem-sucedido
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const metadata = paymentIntent.metadata;

    try {
      const user = await User.findById(metadata.userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Adiciona os créditos
      await user.addCredits(parseInt(metadata.credits));

      // Registra o pagamento
      user.paymentsHistory.push({
        amount: paymentIntent.amount,
        creditsAdded: parseInt(metadata.credits),
        paymentMethod: 'stripe',
        status: 'completed',
        transactionId: paymentIntent.id
      });

      await user.save();
      console.log(`Créditos adicionados para usuário ${metadata.userId}: ${metadata.credits}`);
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  res.json({ received: true });
};

exports.getUserCredits = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json({
      credits: user.credits,
      contractsHistory: user.contractsHistory,
      paymentsHistory: user.paymentsHistory
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deductCredit = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (!user.hasEnoughCredits()) {
      return res.status(400).json({ 
        error: 'Créditos insuficientes',
        credits: user.credits
      });
    }

    await user.deductCredits(1);
    
    res.json({ 
      success: true, 
      remainingCredits: user.credits 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
