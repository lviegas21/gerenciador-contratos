import { useState } from 'react';
import ContractPreview from './ContractPreview';
import { DocumentTextIcon, CurrencyDollarIcon, CalendarIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const contractTypes = [
  { 
    id: 'service',
    name: 'Prestação de Serviços',
    description: 'Ideal para freelancers e prestadores de serviço',
    icon: DocumentTextIcon
  },
  { 
    id: 'rental',
    name: 'Contrato de Locação',
    description: 'Para aluguéis de imóveis, equipamentos e mais',
    icon: CurrencyDollarIcon
  },
  { 
    id: 'sale',
    name: 'Contrato de Compra e Venda',
    description: 'Para transações comerciais e vendas',
    icon: CalendarIcon
  },
];

export default function ContractForm() {
  const [formData, setFormData] = useState({
    type: 'service',
    contractorName: '',
    contracteeName: '',
    value: '',
    startDate: '',
    endDate: '',
    description: '',
    terms: '',
  });
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Primeiro, cria o pagamento
      const paymentResponse = await axios.post('/api/payments/create', {
        contractData: formData
      });

      // Redireciona para a página de pagamento do Mercado Pago
      window.location.href = paymentResponse.data.paymentUrl;
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao processar pagamento');
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    // Remove tudo que não é número
    value = value.replace(/\D/g, '');
    
    // Converte para número e divide por 100 para considerar centavos
    const number = Number(value) / 100;
    
    // Formata como moeda
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(number);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'value') {
      // Se for o campo de valor, aplica a formatação
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: formatCurrency(numericValue)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="max-w-xl">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Novo Contrato</h3>
          <p className="mt-1 text-sm text-gray-500">
            Preencha os dados para gerar seu contrato profissional
          </p>
        </div>

        {/* Seleção do tipo de contrato */}
        <div className="mt-6">
          <fieldset>
            <legend className="text-base font-medium text-gray-900">Tipo de Contrato</legend>
            <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4">
              {contractTypes.map((type) => (
                <label
                  key={type.id}
                  className={`relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none ${
                    formData.type === type.id
                      ? 'border-indigo-500 ring-2 ring-indigo-500'
                      : 'border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={type.id}
                    checked={formData.type === type.id}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className="flex flex-1">
                    <div className="flex flex-col">
                      <span className="block text-sm font-medium text-gray-900">
                        {type.name}
                      </span>
                      <span className="mt-1 flex items-center text-sm text-gray-500">
                        {type.description}
                      </span>
                    </div>
                  </div>
                  <type.icon
                    className={`h-5 w-5 ${
                      formData.type === type.id ? 'text-indigo-600' : 'text-gray-400'
                    }`}
                    aria-hidden="true"
                  />
                  <span
                    className={`pointer-events-none absolute -inset-px rounded-lg border-2 ${
                      formData.type === type.id ? 'border-indigo-500' : 'border-transparent'
                    }`}
                    aria-hidden="true"
                  />
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
          <div>
            <label htmlFor="contractorName" className="block text-sm font-medium text-gray-700">
              Nome do Contratante
            </label>
            <input
              type="text"
              name="contractorName"
              id="contractorName"
              value={formData.contractorName}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="contracteeName" className="block text-sm font-medium text-gray-700">
              Nome do Contratado
            </label>
            <input
              type="text"
              name="contracteeName"
              id="contracteeName"
              value={formData.contracteeName}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="value" className="block text-sm font-medium text-gray-700">
              Valor
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">R$</span>
              </div>
              <input
                type="text"
                name="value"
                id="value"
                value={formData.value}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="0,00"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Data de Início
            </label>
            <input
              type="date"
              name="startDate"
              id="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              Data de Término
            </label>
            <input
              type="date"
              name="endDate"
              id="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Descrição do Serviço/Produto
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
            <p className="mt-2 text-sm text-gray-500">
              Descreva detalhadamente o objeto do contrato
            </p>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="terms" className="block text-sm font-medium text-gray-700">
              Termos Adicionais
            </label>
            <textarea
              id="terms"
              name="terms"
              rows={4}
              value={formData.terms}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <p className="mt-2 text-sm text-gray-500">
              Cláusulas ou condições específicas para este contrato
            </p>
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Processando...' : 'Visualizar Contrato'}
            </button>
            {error && (
              <p className="mt-2 text-sm text-red-500">{error}</p>
            )}
          </div>
        </form>
      </div>

      <ContractPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        contractData={{
          ...formData,
          value: formData.value.replace(/[^\d,]/g, '').replace(',', '.')
        }}
      />
    </div>
  );
}
