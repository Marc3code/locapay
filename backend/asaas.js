// asaas.js

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
        'access_token': process.env.ASAAS_SECRET_KEY, // sua chave de API do Asaas
      },
    });

    console.log('Cobrança criada com sucesso!');
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error('Erro ao criar pagamento:', err.response?.data || err.message);
    throw new Error(err.response?.data?.message || 'Erro ao criar pagamento');
  }
};

// Função para criação de um cliente no Asaas, caso seja necessário
const criarClienteAsaas = async (clienteData) => {
  try {
    const response = await axios.post(`${BASE_URL}/customers`, clienteData, {
      headers: {
        'Content-Type': 'application/json',
        'access_token': process.env.ASAAS_SECRET_KEY, // sua chave de API do Asaas
      },
    });

    console.log('Cliente criado com sucesso!');
    await fetch('https://locapay-production.up.railway.app/adiciona_id_asaas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        asaas_id: response.data.customer,
      }),
    })
    return response.data;
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
