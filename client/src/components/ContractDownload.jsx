import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ContractDownload = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkPayment = async () => {
      try {
        // Pega o payment_id da URL (adicionado pelo Mercado Pago)
        const params = new URLSearchParams(location.search);
        const paymentId = params.get('payment_id');
        const status = params.get('status');

        if (!paymentId || status !== 'approved') {
          throw new Error('Pagamento não aprovado');
        }

        // Verifica o status do pagamento
        const response = await axios.get(`/api/payments/${paymentId}/status`);
        
        if (response.data.status === 'approved') {
          // Gera o PDF do contrato
          const contractResponse = await axios.get('/api/contracts/generate', {
            responseType: 'blob'
          });

          // Cria um link para download
          const url = window.URL.createObjectURL(new Blob([contractResponse.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'contrato.pdf');
          document.body.appendChild(link);
          link.click();
          link.remove();
        } else {
          throw new Error('Pagamento não aprovado');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    checkPayment();
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Processando seu pagamento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
          <button
            onClick={() => navigate('/contract-form')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Voltar ao formulário
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p>Pagamento aprovado! Seu contrato está sendo baixado.</p>
        </div>
        <button
          onClick={() => navigate('/contract-form')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Gerar novo contrato
        </button>
      </div>
    </div>
  );
};

export default ContractDownload;
