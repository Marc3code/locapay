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
  const event = req.body.event;

  if (event === "message") {
    const msg = req.body.message;

    const from = msg.from;
    const text = msg.text || "";
    console.log("Mensagem recebida de:", from);
    console.log("Conteúdo:", text);

    // Lógica de resposta
    let resposta = "Não entendi...";
    if (text === "1") resposta = "Você escolheu a opção 1";
    else if (text === "2") resposta = "Você escolheu a opção 2";
    else if (text.toLowerCase().includes("oi"))
      resposta = "Olá! Como posso te ajudar?";

    // Enviar resposta via Z-API
    await axios.post(`https://api.z-api.io/instances/3DF7A08EBAE0F00686418E66062CE0C1/token/7C15DC72E37255AD095DB505/send-text`, {
      phone: from,
      message: resposta,
    });

    console.log("Resposta enviada:", resposta);
  }

  res.sendStatus(200);
});

// Iniciar servidor
app.listen(process.env.PORT||3000, () => {
  console.log("Servidor rodando na porta 3000");
});
