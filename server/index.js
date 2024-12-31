import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Importa as rotas de créditos
const creditRoutes = require('./routes/creditRoutes');

app.post('/api/contracts/generate', async (req, res) => {
  let browser = null;
  try {
    const contractData = req.body;
    console.log('Iniciando geração do PDF...', contractData);

    // Inicia o navegador com configurações específicas para Windows
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });
    
    console.log('Navegador iniciado');
    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 1200 });

    // Gera o HTML do contrato
    const contractHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @page {
              margin: 0;
              size: A4;
            }
            * {
              color: #111827 !important;
              font-family: Arial, sans-serif !important;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 3cm;
              color: #111827;
              background-color: white;
              font-size: 12pt;
            }
            .title {
              text-align: center;
              font-size: 16pt;
              font-weight: bold;
              margin-bottom: 3cm;
              text-transform: uppercase;
              color: #111827;
            }
            .section {
              margin-bottom: 2cm;
            }
            .section-title {
              font-weight: bold;
              margin-bottom: 0.5cm;
              color: #111827;
              text-transform: uppercase;
            }
            .section-content {
              margin-top: 0.3cm;
              color: #111827;
              text-align: justify;
            }
            .signatures {
              margin-top: 4cm;
              display: flex;
              justify-content: space-between;
              page-break-inside: avoid;
            }
            .signature-block {
              text-align: center;
              width: 45%;
            }
            .signature-line {
              width: 100%;
              border-top: 1px solid #111827;
              margin-bottom: 0.5cm;
            }
            .signature-name {
              margin-top: 0.3cm;
              font-weight: normal;
            }
            .signature-title {
              font-weight: bold;
              margin-top: 0.3cm;
              text-transform: uppercase;
            }
            .date-section {
              text-align: center;
              margin-top: 3cm;
              page-break-inside: avoid;
            }
            .pre-wrap {
              white-space: pre-wrap;
            }
            .underline {
              border-bottom: 1px solid #111827;
              padding-bottom: 2px;
            }
          </style>
        </head>
        <body>
          <div class="title">
            ${contractData.type === 'service' ? 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS' :
              contractData.type === 'rental' ? 'CONTRATO DE LOCAÇÃO' :
              'CONTRATO DE COMPRA E VENDA'}
          </div>

          <div class="section">
            <div class="section-title">CONTRATANTE</div>
            <div class="section-content">${contractData.contractorName}</div>
          </div>

          <div class="section">
            <div class="section-title">CONTRATADO</div>
            <div class="section-content">${contractData.contracteeName}</div>
          </div>

          <div class="section">
            <div class="section-title">OBJETO DO CONTRATO</div>
            <div class="section-content pre-wrap">${contractData.description}</div>
          </div>

          <div class="section">
            <div class="section-title">VALOR</div>
            <div class="section-content">
              ${new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(parseFloat(contractData.value))} (${contractData.value
                ? new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(parseFloat(contractData.value)).replace('R$', '').trim()
                  + ' reais'
                : ''})
            </div>
          </div>

          <div class="section">
            <div class="section-title">VIGÊNCIA</div>
            <div class="section-content">
              De ${new Date(contractData.startDate).toLocaleDateString('pt-BR')} 
              a ${new Date(contractData.endDate).toLocaleDateString('pt-BR')}
            </div>
          </div>

          ${contractData.terms ? `
            <div class="section">
              <div class="section-title">TERMOS ADICIONAIS</div>
              <div class="section-content pre-wrap">${contractData.terms}</div>
            </div>
          ` : ''}

          <div class="signatures">
            <div class="signature-block">
              <div class="signature-line"></div>
              <div class="signature-name">${contractData.contractorName}</div>
              <div class="signature-title">CONTRATANTE</div>
            </div>

            <div class="signature-block">
              <div class="signature-line"></div>
              <div class="signature-name">${contractData.contracteeName}</div>
              <div class="signature-title">CONTRATADO</div>
            </div>
          </div>

          <div class="date-section">
            <span class="underline">________________________</span>, ${new Date().toLocaleDateString('pt-BR')}
          </div>
        </body>
      </html>
    `;

    console.log('HTML gerado, configurando página...');

    // Configura o conteúdo da página com timeout maior
    await page.setContent(contractHtml, {
      waitUntil: ['load', 'networkidle0'],
      timeout: 30000
    });

    console.log('Gerando PDF...');

    // Gera o PDF com configurações ajustadas
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0'
      }
    });

    console.log('PDF gerado com sucesso');

    // Fecha o navegador
    await browser.close();
    browser = null;

    // Envia o PDF como resposta
    res.contentType('application/pdf');
    res.send(pdf);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    res.status(500).json({ error: 'Erro ao gerar PDF: ' + error.message });
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Erro ao fechar o navegador:', closeError);
      }
    }
  }
});

// Adiciona as rotas de créditos
app.use('/api/credits', creditRoutes);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
