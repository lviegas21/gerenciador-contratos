const mongoose = require('mongoose');

const ContractSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  templateType: {
    type: String,
    enum: ['service', 'rental', 'sale'],
    required: true
  },
  contractorName: {
    type: String,
    required: true
  },
  contracteeName: {
    type: String,
    required: true
  },
  contractValue: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  additionalTerms: String,
  status: {
    type: String,
    enum: ['draft', 'generated', 'signed'],
    default: 'draft'
  },
  pdfUrl: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Atualizar updatedAt antes de salvar
ContractSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Contract', ContractSchema);
