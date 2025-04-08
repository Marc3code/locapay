const express = require("express");
const db = require("./database.js");
const cors = require("cors");
const stripe = require("./stripe.js");

const app = express();

app.use(cors());
app.use(express.json());

// Rota básica
app.get("/", (req, res) => {
  res.send("API rodando!");
});

// ------------------ ROTAS GET ------------------

// Rota GET - Imóveis
app.get("/imoveis", (req, res) => {
  const query = "SELECT * FROM imoveis";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Erro ao buscar imóveis:", err);
      return res.status(500).json({ erro: "Erro ao buscar imóveis" });
    }
    res.json(results);
  });
});

// Rota GET - Inquilinos
app.get("/inquilinos", (req, res) => {
  const query = "SELECT * FROM inquilinos";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Erro ao buscar inquilinos:", err);
      return res.status(500).json({ erro: "Erro ao buscar inquilinos" });
    }
    res.json(results);
  });
});

// Rota GET - Pagamentos
app.get("/pagamentos", (req, res) => {
  const query = "SELECT * FROM pagamentos";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Erro ao buscar pagamentos:", err);
      return res.status(500).json({ erro: "Erro ao buscar pagamentos" });
    }
    res.json(results);
  });
});

// ------------------ ROTAS POST ------------------

// Rota POST - Adicionar imóvel
app.post("/imoveis", (req, res) => {
  const { tipo, endereco, numero } = req.body;
  const query = "INSERT INTO imoveis (tipo, endereco, numero) VALUES (?, ?, ?)";
  db.query(query, [tipo, endereco, numero], (err, results) => {
    if (err) {
      console.error("Erro ao adicionar imóvel:", err);
      return res.status(500).json({ erro: "Erro ao adicionar imóvel" });
    }
    res.status(201).json({ id: results.insertId, tipo, endereco, numero });
  });
});

// Rota POST - Adicionar inquilino
app.post("/inquilinos", (req, res) => {
  const {
    imovel_id,
    nome,
    numero_imovel,
    telefone,
    valor_aluguel,
    data_vencimento,
  } = req.body;
  const query =
    "INSERT INTO inquilinos (imovel_id, nome, numero_imovel, telefone, valor_aluguel, data_vencimento) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(
    query,
    [imovel_id, nome, numero_imovel, telefone, valor_aluguel, data_vencimento],
    (err, results) => {
      if (err) {
        console.error("Erro ao adicionar inquilino:", err);
        return res.status(500).json({ erro: "Erro ao adicionar inquilino" });
      }
      res
        .status(201)
        .json({
          id: results.insertId,
          imovel_id,
          nome,
          numero_imovel,
          telefone,
          valor_aluguel,
          data_vencimento,
        });
    }
  );
});

app.post("/pagamentos", (req, res) => {
  const {
    inquilino_id,
    stripe_session_id,
    data_vencimento,
    data_pagamento,
    valor_pago,
    status,
  } = req.body;

  db.query(
    "INSERT INTO pagamentos (inquilino_id, stripe_session_id, data_vencimento, data_pagamento, valor_pago, status) VALUES (?, ?, ?, ?, ?, ?)",
    [
      inquilino_id,
      stripe_session_id,
      data_vencimento,
      data_pagamento,
      valor_pago,
      status,
    ],
    (err, results) => {
      if (err) {
        console.error("Erro ao adicionar pagamento:", err);
        return res.status(500).json({ erro: "Erro ao adicionar pagamento" });
      }
      res
        .status(201)
        .json({
          id: results.insertId,
          inquilino_id,
          stripe_session_id,
          data_vencimento,
          data_pagamento,
          valor_pago,
          status,
        });
    }
  );
});


// Rota POST - Criar pagamento com Stripe
app.post('/stripe/criar-pagamento', async (req, res) => {
    const { valor, nomeInquilino } = req.body;
  
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'brl',
              product_data: {
                name: `Aluguel - ${nomeInquilino}`,
              },
              unit_amount: Math.round(valor * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: 'https://youtube.com',
        cancel_url: 'https://google.com',
      });
  
      res.json({ url: session.url, sessionId: session.id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao criar sessão de pagamento' });
    }
  });

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
