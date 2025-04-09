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
  const from = req.body.From; // número que enviou
  const text = req.body.Body; // texto enviado

  console.log("Mensagem recebida de:", from);
  console.log("Conteúdo:", text);

  // Lógica de resposta
  let resposta = "Não entendi...";
  if (text === "1") resposta = "Você escolheu a opção 1";
  else if (text === "2") resposta = "Você escolheu a opção 2";
  else if (text.toLowerCase().includes("oi"))
    resposta = "Olá! Como posso te ajudar?";

  // Responder com TwiML
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
