const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const axios = require("axios");

const app = express();
app.use(express.json());

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
    fetch(
      "https://api.z-api.io/instances/3DF7A08EBAE0F00686418E66062CE0C1/token/7C15DC72E37255AD095DB505/send-text",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "client-token": "F775e0c83a317429f93eefaa27ba21c03S",
        },
        body: JSON.stringify({
          
            from: "558496132907",
            text: "1",
          
        }),
      }
    )
      .then((response) => response.json())
      .then((data) => console.log("Resposta da API:", data))
      .catch((err) => console.error("Erro ao enviar mensagem:", err));

    console.log("Resposta enviada:", resposta);
  }

  res.sendStatus(200);
});

// Iniciar servidor
app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor rodando na porta 3000");
});
