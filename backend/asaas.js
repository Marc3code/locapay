const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const BASE_URL = 'https://sandbox.asaas.com/api/v3'; // para ambiente de testes
// Para produção: 'https://www.asaas.com/api/v3'



const gerarPagamentoPix = async (customerId, value, dueDate) => { //trocar os parametros para um array de objetos
  try {
    const response = await axios.post(`${BASE_URL}/payments`, {
      customer: customerId, 
      billingType: 'PIX', 
      value: value, // valor em centavos (exemplo: R$ 50 seria 5000)
      dueDate: dueDate, 
    }, {
      headers: {
        'Content-Type': 'application/json',
        'access_token': process.env.ASAAS_API_KEY 
      },
    });

    console.log('Cobrança criada com sucesso!');
    return response.data;
  } catch (err) {
    console.error('Erro ao criar pagamento:', err.response?.data || err.message);
    throw new Error(err.response?.data?.message || 'Erro ao criar pagamento');
  }
};

// Função para criação de um cliente no Asaas
const criarClienteAsaas = async (clienteData) => {
  try {
    const response = await axios.post(`${BASE_URL}/customers`, clienteData, {
      headers: {
        'Content-Type': 'application/json',
        'access_token': process.env.ASAAS_API_KEY, 
      },
    });
    return response.data.id;
  } catch (err) {
    console.error('Erro ao criar cliente:', err.response?.data || err.message);
    throw new Error(err.response?.data?.message || 'Erro ao criar cliente');
  }
};

// Exportar funções para uso em outras partes do seu backend
module.exports = {
  gerarPagamentoPix,
  criarClienteAsaas,
};
