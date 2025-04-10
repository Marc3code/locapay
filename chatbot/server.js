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
app.post("/webhook", (req, res) => {
  const from = req.body.From;
  const text = req.body.Body.trim().toLowerCase();

  console.log("Mensagem recebida de:", from);
  console.log("Conteúdo:", text);

  const inquilino_id = fetch(`https://locapay-production.up.railway.app/getinquilino/${from}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      return data.inquilino_id;
    })
    .catch((error) => {
      console.error("Erro ao buscar inquilino:", error);
      return null;
  })

  let resposta = "";

  // Exibe o menu se o usuário mandar "oi" ou "menu"
  if (text === "oi" || text === "menu") {
    resposta = `Olá! 👋 Como posso te ajudar?\n\nEscolha uma opção:\n1️⃣ Pagar aluguel\n2️⃣ Verificar pagamentos pendentes\n3️⃣ Ver data de vencimento`;
  } else if (text === "1") {
    resposta = `💳 Link para pagamento do aluguel:\nhttps://locapay-production.up.railway.app/stripe/criar-pagamento`;
  } else if (text === "2") {
    const pendencia = fetch(`https://locapay-production.up.railway.app/pagamentos/${inquilino_id}/status/pendente`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inquilino_id })
      .then((response) => response.json())
      .then((data) => {
        return data;
      })
      .catch((error) => {
        console.error("Erro ao buscar pendências:", error);
        return null;
      })
    })
    if (pendencia) {
      const quantidadePendencias = pendencia.length;
      if (quantidadePendencias > 0) {
        resposta = `Você possui ${quantidadePendencias} pendências de pagamento.\n\n`;
        pendencia.forEach((p) => {
          resposta += `- Valor: R$ ${p.valor_pago}\n- Data de vencimento: ${p.data_vencimento.toLocaleDateString("pt-BR")}\n- Status: ${p.status}\n\n`;
        });
      } else {
        resposta = `Você não possui pendências de pagamento.`;
      }
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
