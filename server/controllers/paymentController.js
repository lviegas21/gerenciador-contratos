const mercadopago = require('mercadopago');
const User = require('../models/User');

// Configura o Mercado Pago
mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
  sandbox: true // Ambiente de testes
});

exports.createPayment = async (req, res) => {
  try {
    const { contractData } = req.body;
    
    // Cria o pagamento de R$2,00 para o contrato
    const preference = {
      items: [
        {
          title: 'Geração de Contrato Profissional',
          description: 'Geração de contrato em PDF com dados personalizados',
          unit_price: 2.00,
          quantity: 1,
          currency_id: 'BRL',
        }
      ],
      payer: {
        name: req.user.name,
        email: req.user.email
      },
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 1, // Apenas pagamento à vista
      },
      back_urls: {
        success: `${process.env.CLIENT_URL}/download-contract`,
        failure: `${process.env.CLIENT_URL}/contract-form`,
        pending: `${process.env.CLIENT_URL}/contract-form`
      },
      auto_return: 'approved',
      external_reference: JSON.stringify({
        userId: req.user.id,
        contractData
      }),
      notification_url: `${process.env.SERVER_URL}/api/payments/webhook`
    };

    const response = await mercadopago.preferences.create(preference);
    
    // No ambiente de teste, usa sandbox_init_point
    const paymentUrl = process.env.NODE_ENV === 'production' 
      ? response.body.init_point 
      : response.body.sandbox_init_point;

    res.json({
      paymentUrl,
      preferenceId: response.body.id
    });
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.handleWebhook = async (req, res) => {
  try {
    console.log('Webhook recebido:', req.body);
    const { type, data } = req.body;

    if (type === 'payment') {
      const paymentId = data.id;
      console.log('Buscando pagamento:', paymentId);
      
      const payment = await mercadopago.payment.findById(paymentId);
      console.log('Pagamento encontrado:', payment.body);
      
      if (payment.body.status === 'approved') {
        const externalReference = JSON.parse(payment.body.external_reference);
        const { userId, contractData } = externalReference;

        console.log('Atualizando usuário:', userId);
        
        // Registra o pagamento no histórico do usuário
        const user = await User.findById(userId);
        if (user) {
          user.paymentsHistory.push({
            amount: payment.body.transaction_amount,
            status: 'completed',
            paymentMethod: payment.body.payment_type_id,
            transactionId: payment.body.id,
            createdAt: new Date()
          });

          // Adiciona o contrato ao histórico
          user.contractsHistory.push({
            ...contractData,
            createdAt: new Date()
          });

          await user.save();
          console.log('Usuário atualizado com sucesso');
        }
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).send('Error');
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    console.log('Verificando status do pagamento:', paymentId);
    
    const payment = await mercadopago.payment.findById(paymentId);
    console.log('Status do pagamento:', payment.body.status);
    
    res.json({
      status: payment.body.status,
      paymentMethod: payment.body.payment_type_id
    });
  } catch (error) {
    console.error('Erro ao verificar pagamento:', error);
    res.status(500).json({ error: error.message });
  }
};
