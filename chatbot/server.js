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

  from = from.replace(" whatsapp:", "").trim();
  from.trim();
  console.log("Número formatado:", from);

  let inquilino_id = null;

  try {
    const response = await fetch(
      `https://locapay-production.up.railway.app/getinquilino/${from}`
    );
    const data = await response.json();
    console.log("Dados do inquilino:", data);
    inquilino_id = data.inquilino_id;
  } catch (error) {
    console.error("Erro ao buscar inquilino:", error);
  }
  console.log("Inquilino ID:", inquilino_id);
  if (!inquilino_id) {
    resposta = `❌ Não consegui identificar você. Por favor, entre em contato com o suporte.`;
    res.set("Content-Type", "text/xml");
    res.send(`
      <Response>
        <Message>${resposta}</Message>
      </Response>
    `);
    return;
  }

  if (text === "oi" || text === "menu") {
    resposta = `Olá! 👋 Como posso te ajudar?\n\nEscolha uma opção:\n1️⃣ Pagar aluguel\n2️⃣ Verificar pagamentos pendentes\n3️⃣ Ver data de vencimento`;
  } else if (text === "1") {
    resposta = `💳 Link para pagamento do aluguel:\nhttps://locapay-production.up.railway.app/stripe/criar-pagamento`;
  } else if (text === "2") {
    try {
      const resp = await fetch(
        `https://locapay-production.up.railway.app/pagamentos/${inquilino_id}/status/pendente`
      );
      const pendencia = await resp.json();
      console.log("Pendências:", pendencia);
      if (pendencia && pendencia.length > 0) {
        resposta = `Você possui ${pendencia.length} pendências de pagamento.\n\n`;
        pendencia.forEach((p) => {
          resposta += `- Valor: R$ ${
            p.valor_pago
          }\n- Data de vencimento: ${new Date(
            p.data_vencimento
          ).toLocaleDateString("pt-BR")}\n- Status: ${p.status}\n\n`;
        });
      } else {
        resposta = `Você não possui pendências de pagamento.`;
      }
    } catch (error) {
      console.error("Erro ao buscar pendências:", error);
      resposta = `❌ Erro ao verificar pendências.`;
    }
  } else if (text === "3") {
    resposta = `📅 Sua próxima data de vencimento é 10/04/2025.`;
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
