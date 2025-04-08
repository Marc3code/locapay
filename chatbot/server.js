const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const axios = require("axios");

const app = express();
app.use(express.json());

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// Verificação do Webhook (GET)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK VERIFICADO");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Receber mensagens (POST)
app.post("/webhook", async (req, res) => {
  const entry = req.body.entry?.[0];

  if (entry?.changes?.[0]?.value?.messages) {
    const message = entry.changes[0].value.messages[0];
    const phone_number_id = entry.changes[0].value.metadata.phone_number_id;
    const from = message.from; // número do usuário
    const msg_body = message.text?.body || "";

    console.log("phone_number_id:", phone_number_id);
    console.log("from:", from);
    console.log("resposta:", resposta);

    console.log("Mensagem recebida:", msg_body);

    // Lógica simples de resposta
    let resposta = "Não entendi...";
    if (msg_body === "1") resposta = "Você escolheu a opção 1";
    else if (msg_body === "2") resposta = "Você escolheu a opção 2";
    else if (msg_body.toLowerCase().includes("oi"))
      resposta = "Olá! Como posso te ajudar?";

    // Enviar resposta
    await axios.post(
      `https://graph.facebook.com/v18.0/${phone_number_id}/messages`,
      {
        messaging_product: "whatsapp",
        to: from,
        text: { body: resposta },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );
  }

  res.sendStatus(200);
});

// Iniciar servidor
app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
