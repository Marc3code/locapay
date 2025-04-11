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

app.get("/inquilinos", async (req, res) => {
  try {
    const [results] = await db.pool("SELECT * FROM inquilinos");
    res.json(results);
  } catch (err) {
    console.error("Erro ao buscar inquilinos:", err);
    res.status(500).json({ erro: "Erro ao buscar inquilinos" });
  }
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
      res.status(201).json({
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
      res.status(201).json({
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

app.get("/getinquilino/:telefone", async (req, res) => {
  const { telefone } = req.params;
  const query = "SELECT * FROM inquilinos WHERE telefone = ?";

  try {
    const [results] = await db.query(query, [telefone]);
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ erro: "Inquilino não encontrado" });
    }
  } catch (err) {
    console.error("Erro ao buscar inquilino:", err);
    res.status(500).json({ erro: "Erro ao buscar inquilino" });
  }
});

//-- Rotas GET - Pagamentos por inquilino e status -- ver pendencias
app.get("/pagamentos/:inquilino_id/status/:status", async (req, res) => {
  const { inquilino_id, status } = req.params;

  if (!inquilino_id) {
    return res.status(400).json({ erro: "inquilino_id não foi passado" });
  }

  try {
    const query =
      "SELECT * FROM pagamentos WHERE inquilino_id = ? AND status = ?";

    const [results] = await pool.query(query, [inquilino_id, status]);
    res.json(results);
  } catch (err) {
    console.error("Erro ao buscar pagamento:", err);
    res.status(500).json({ erro: "Erro ao buscar pagamento" });
  }
});

//---------------Rotas STRIPE--------------------------------------------------//

// Rota POST - Criar pagamento com Stripe
app.post("/stripe/criar-pagamento", async (req, res) => {
  const { valor, nomeInquilino } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: `Aluguel - ${nomeInquilino}`,
            },
            unit_amount: Math.round(valor * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://locapay-production-844e.up.railway.app",
      cancel_url: "https://locapay-production-844e.up.railway.app/falha",
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao criar sessão de pagamento" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
