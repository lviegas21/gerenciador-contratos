const ContractContent = ({ data }) => {
  if (!data) return null;

  const getContractTitle = () => {
    switch (data.type) {
      case 'service':
        return 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS';
      case 'rental':
        return 'CONTRATO DE LOCAÇÃO';
      case 'sale':
        return 'CONTRATO DE COMPRA E VENDA';
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = (value) => {
    try {
      // Se o valor já estiver formatado como moeda, retorna ele mesmo
      if (typeof value === 'string' && value.includes('R$')) {
        return value;
      }

      // Converte para número
      const number = typeof value === 'string' ? parseFloat(value) : value;
      
      // Verifica se é um número válido
      if (isNaN(number)) {
        throw new Error('Valor inválido');
      }

      // Formata como moeda
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(number);
    } catch (error) {
      console.error('Erro ao formatar valor:', error);
      return 'R$ 0,00';
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-gray-900 p-8">
      <div className="text-center mb-16">
        <h2 className="text-xl font-bold uppercase tracking-wide text-gray-900">
          {getContractTitle()}
        </h2>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="font-bold text-gray-900 uppercase">CONTRATANTE</h3>
          <p className="mt-2 text-gray-900">{data.contractorName}</p>
        </div>

        <div>
          <h3 className="font-bold text-gray-900 uppercase">CONTRATADO</h3>
          <p className="mt-2 text-gray-900">{data.contracteeName}</p>
        </div>

        <div>
          <h3 className="font-bold text-gray-900 uppercase">OBJETO DO CONTRATO</h3>
          <p className="mt-2 whitespace-pre-wrap text-gray-900 text-justify">{data.description}</p>
        </div>

        <div>
          <h3 className="font-bold text-gray-900 uppercase">VALOR</h3>
          <p className="mt-2 text-gray-900">
            {formatCurrency(data.value)}
            {data.value && (
              <span className="ml-2">
                ({formatCurrency(data.value).replace('R$', '').trim()} reais)
              </span>
            )}
          </p>
        </div>

        <div>
          <h3 className="font-bold text-gray-900 uppercase">VIGÊNCIA</h3>
          <p className="mt-2 text-gray-900">
            De {formatDate(data.startDate)} a {formatDate(data.endDate)}
          </p>
        </div>

        {data.terms && (
          <div>
            <h3 className="font-bold text-gray-900 uppercase">TERMOS ADICIONAIS</h3>
            <p className="mt-2 whitespace-pre-wrap text-gray-900 text-justify">{data.terms}</p>
          </div>
        )}

        <div className="mt-16 pt-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <p className="text-gray-900 mb-2">{data.contractorName}</p>
              <div className="border-t border-gray-900 w-full"></div>
              <p className="font-bold text-gray-900 uppercase mt-2">CONTRATANTE</p>
            </div>

            <div className="text-center">
              <p className="text-gray-900 mb-2">{data.contracteeName}</p>
              <div className="border-t border-gray-900 w-full"></div>
              <p className="font-bold text-gray-900 uppercase mt-2">CONTRATADO</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-block">
            <p className="text-gray-900 mb-1">{new Date().toLocaleDateString('pt-BR')}</p>
            <div className="border-t border-gray-900 min-w-[200px]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractContent;
