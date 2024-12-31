const mongoose = require('mongoose');

const ContractHistorySchema = new mongoose.Schema({
  contractType: {
    type: String,
    required: true,
    enum: ['service', 'rental', 'sale']
  },
  contractorName: {
    type: String,
    required: true
  },
  contracteeName: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  pdfUrl: String
});

const PaymentHistorySchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  creditsAdded: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  transactionId: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  credits: {
    type: Number,
    default: 0
  },
  contractsHistory: [ContractHistorySchema],
  paymentsHistory: [PaymentHistorySchema],
  socialAccounts: {
    instagram: {
      connected: Boolean,
      accessToken: String,
      pageId: String,
      pageName: String,
    },
    facebook: {
      connected: Boolean,
      accessToken: String,
      pageId: String,
      pageName: String,
    },
    twitter: {
      connected: Boolean,
      accessToken: String,
      username: String,
    },
    linkedin: {
      connected: Boolean,
      accessToken: String,
      pageId: String,
      pageName: String,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  plan: {
    type: String,
    enum: ['free', 'basic', 'pro', 'business'],
    default: 'free'
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

// Método para verificar se o usuário tem créditos suficientes
UserSchema.methods.hasEnoughCredits = function() {
  return this.credits > 0;
};

// Método para deduzir créditos
UserSchema.methods.deductCredits = async function(amount = 1) {
  if (this.credits < amount) {
    throw new Error('Créditos insuficientes');
  }
  this.credits -= amount;
  await this.save();
  return this.credits;
};

// Método para adicionar créditos
UserSchema.methods.addCredits = async function(amount) {
  this.credits += amount;
  await this.save();
  return this.credits;
};

// Método para adicionar contrato ao histórico
UserSchema.methods.addContractToHistory = async function(contractData) {
  this.contractsHistory.push(contractData);
  await this.save();
  return this.contractsHistory[this.contractsHistory.length - 1];
};

module.exports = mongoose.model('User', UserSchema);
