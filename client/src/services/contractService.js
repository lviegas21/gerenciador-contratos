const API_URL = 'http://localhost:3001/api';

export const generateContract = async (contractData) => {
  try {
    console.log('Enviando dados para geração:', contractData);

    // Remove a formatação do valor antes de enviar
    const formattedData = {
      ...contractData,
      value: contractData.value.replace(/[^\d,]/g, '').replace(',', '.')
    };

    console.log('Dados formatados:', formattedData);

    const response = await fetch(`${API_URL}/contracts/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro na resposta:', errorData);
      throw new Error(errorData.error || 'Erro ao gerar contrato');
    }

    const blob = await response.blob();
    if (blob.size === 0) {
      throw new Error('PDF gerado está vazio');
    }

    console.log('PDF gerado com sucesso, tamanho:', blob.size);

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contrato-${formattedData.type}-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return true;
  } catch (error) {
    console.error('Erro ao gerar contrato:', error);
    throw error;
  }
};

export const listContracts = async () => {
  try {
    const response = await fetch(`${API_URL}/contracts`);
    if (!response.ok) {
      throw new Error('Erro ao listar contratos');
    }
    return await response.json();
  } catch (error) {
    console.error('Erro:', error);
    throw error;
  }
};
