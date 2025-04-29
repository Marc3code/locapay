const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

dotenv.config();
const app = express();

// Twilio envia dados como x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Rota raiz (opcional)
app.get("/", (req, res) => {
  res.send("Webhook do WhatsApp com Twilio está funcionando.");
});

// Rota de webhook
app.post("/webhook", async (req, res) => {
  let from = req.body.From;
  const text = req.body.Body.trim().toLowerCase();
  let resposta = "";

  console.log("Mensagem recebida de:", from);
  console.log("Conteúdo:", text);

  let numeroFormatado = from.replace("whatsapp:", "").trim();

  // Garante que começa com +55
  if (!numeroFormatado.startsWith("+55")) {
    numeroFormatado = "+55" + numeroFormatado;
  }

  // Extrai o DDD e o número
  const ddd = numeroFormatado.slice(3, 5); // Ex: 84
  let numero = numeroFormatado.slice(5); // Ex: 996132907 ou 96132907

  // Adiciona o '9' se o número tiver só 8 dígitos
  if (numero.length === 8) {
    numero = "9" + numero;
  } else if (numero.length === 9 && numero[0] !== "9") {
    // verifica se o 9 está na frente
    numero = "9" + numero.slice(1);
  }

  // Reconstrói o número completo
  numeroFormatado = `+55${ddd}${numero}`;

  let inquilino = null;

  try {
    const response = await fetch(
      `https://locapay-production.up.railway.app/getinquilino/${numeroFormatado}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          return data;
        } else {
          console.error("Inquilino não encontrado:", data);
          return null;
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar inquilino:", err);
        return null;
      });
    inquilino = response;
    console.log("inquilino:", inquilino);
  } catch (error) {
    console.error("Erro ao buscar inquilino:", error);
  }

  if (!inquilino.id) {
    resposta = `❌ Não consegui identificar você. Por favor, entre em contato com o suporte.`;
    res.set("Content-Type", "text/xml");
    res.send(`
      <Response>
        <Message>${resposta}</Message>
      </Response>
    `);
    return;
  }

  function formatarData(date) {
    const data = new Date(date);
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  if (text === "menu", "oi", "olá", "boa tarde", "bom dia", "boa noite") {
    resposta = `Olá, ${inquilino.nome}! 👋 Como posso te ajudar?\n\nEscolha uma opção:\n1️⃣ Pagar aluguel\n2️⃣ Verificar pagamentos pendentes\n3️⃣ Ver data de vencimento`;
  } else if (text === "1") {
    resposta = `💳 Link para pagamento do aluguel:\n `;
  } else if (text === "2") {
    resposta = `🔍 Verificando pendências...`;
  } else if (text === "3") {
    resposta = `📅 Sua data de vencimento: ${formatarData(
      inquilino.data_vencimento
    )}`;
  } else {
    resposta = `❌ Não entendi o que você quis dizer.\nDigite *menu* para ver as opções.`;
  }

  res.set("Content-Type", "text/xml");
  res.send(`
    <Response>
      <Message>${resposta}</Message>
    </Response>
  `);

  console.log("Resposta enviada:", resposta);
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
