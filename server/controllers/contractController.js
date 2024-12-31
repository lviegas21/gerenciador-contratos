const Contract = require('../models/Contract');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Templates de contratos
const contractTemplates = {
  service: {
    title: 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS',
    template: (data) => `
CONTRATO DE PRESTAÇÃO DE SERVIÇOS

Por este instrumento particular, de um lado:

CONTRATANTE: ${data.contractorName}, doravante denominado simplesmente CONTRATANTE,

e de outro lado:

CONTRATADO: ${data.contracteeName}, doravante denominado simplesmente CONTRATADO,

têm entre si justo e contratado o seguinte:

1. OBJETO DO CONTRATO
1.1. O presente contrato tem como objeto a prestação dos seguintes serviços:
${data.description}

2. VALOR E FORMA DE PAGAMENTO
2.1. Pela prestação dos serviços, o CONTRATANTE pagará ao CONTRATADO o valor de R$ ${data.contractValue},00 (${valorPorExtenso(data.contractValue)} reais).

3. PRAZO
3.1. O presente contrato terá vigência de ${formatDate(data.startDate)} a ${formatDate(data.endDate)}.

4. TERMOS ADICIONAIS
${data.additionalTerms || 'Não há termos adicionais.'}

5. FORO
5.1. Para dirimir quaisquer controvérsias oriundas do presente contrato, as partes elegem o foro da comarca de [CIDADE].

E, por estarem assim justos e contratados, firmam o presente instrumento em duas vias de igual teor.

[CIDADE], ${formatDate(new Date())}

________________________________
${data.contractorName}
CONTRATANTE

________________________________
${data.contracteeName}
CONTRATADO
    `
  },
  // Adicionar outros templates (rental, sale) aqui
};

// Função auxiliar para formatar datas
function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
}

// Função auxiliar para converter números em texto por extenso
function valorPorExtenso(valor) {
  // Implementar conversão de números para texto
  return valor.toString();
}

// Gerar PDF do contrato
const generateContractPDF = async (contractData) => {
  const doc = new PDFDocument();
  const template = contractTemplates[contractData.templateType];
  
  if (!template) {
    throw new Error('Tipo de contrato não suportado');
  }

  // Configurar documento PDF
  doc.font('Helvetica');
  doc.fontSize(12);
  
  // Adicionar conteúdo
  const content = template.template(contractData);
  doc.text(content);

  // Retornar stream do PDF
  return doc;
};

// Controladores
exports.generateContract = async (req, res) => {
  try {
    // Criar registro do contrato
    const contract = new Contract({
      ...req.body,
      userId: req.user._id, // Assumindo que você tem autenticação implementada
      status: 'generated'
    });

    await contract.save();

    // Gerar PDF
    const doc = await generateContractPDF(req.body);
    
    // Configurar resposta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=contrato-${contract._id}.pdf`);
    
    // Enviar PDF
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('Erro ao gerar contrato:', error);
    res.status(500).json({ error: 'Erro ao gerar contrato' });
  }
};

exports.getContracts = async (req, res) => {
  try {
    const contracts = await Contract.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar contratos' });
  }
};

exports.getContract = async (req, res) => {
  try {
    const contract = await Contract.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!contract) {
      return res.status(404).json({ error: 'Contrato não encontrado' });
    }
    
    res.json(contract);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar contrato' });
  }
};
