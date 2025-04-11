const express = require("express");
const db = require("./database.js");
const cors = require("cors");
const stripe = require("./stripe.js");

const app = express();

app.use(cors(
  {
    origin: "https://locapay-production-844e.up.railway.app, http://127.0.0.1:5500",
    methods: ["GET", "POST"],
    credentials: true,
  }
));
app.use(express.json());

// Rota básica
app.get("/", (req, res) => {
  res.send("API rodando!");
});

// ------------------ ROTAS GET ------------------

// Rota GET - Imóveis
app.get("/imoveis", async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM imoveis");
    res.json(results);
  } catch (err) {
    console.error("Erro ao buscar imóveis:", err);
    res.status(500).json({ erro: "Erro ao buscar imóveis" });
  }
});

// Rota GET - Inquilinos
app.get("/inquilinos", async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM inquilinos");
    res.json(results);
  } catch (err) {
    console.error("Erro ao buscar inquilinos:", err);
    res.status(500).json({ erro: "Erro ao buscar inquilinos" });
  }
});

// Rota GET - Pagamentos
app.get("/pagamentos", async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM pagamentos");
    res.json(results);
  } catch (err) {
    console.error("Erro ao buscar pagamentos:", err);
    res.status(500).json({ erro: "Erro ao buscar pagamentos" });
  }
});

// Rota GET - Último pagamento por inquilino
app.get("/ultimopagamento/:inquilino_id", async (req, res) => {
  const { inquilino_id } = req.params;
  try {
    const [results] = await db.query(
      `SELECT * FROM pagamentos
       WHERE inquilino_id = ?
       AND status = 'pago'
       ORDER BY data_pagamento DESC
       LIMIT 1`,
      [inquilino_id]
    );
    res.json(results[0] || null);
  } catch (err) {
    console.error("Erro ao buscar último pagamento:", err);
    res.status(500).json({ erro: "Erro ao buscar último pagamento" });
  }
});

// Rota GET - Atrasos por inquilino
app.get("/atrasos/:inquilino_id", async (req, res) => {
  const { inquilino_id } = req.params;
  try {
    const [results] = await db.query(
      `SELECT COUNT(*) AS total_atrasos
       FROM pagamentos
       WHERE inquilino_id = ? AND status = 'pendente'`,
      [inquilino_id]
    );
    res.json(results[0]);
  } catch (err) {
    console.error("Erro ao buscar atrasos:", err);
    res.status(500).json({ erro: "Erro ao buscar atrasos" });
  }
});



// Rota GET - Inquilinos com Imóvel
app.get("/inquilinos-com-imovel", async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT i.id, i.nome, i.numero_imovel, i.telefone, i.valor_aluguel, i.data_vencimento,
             im.tipo AS tipo_imovel, im.endereco, im.numero
      FROM inquilinos i
      JOIN imoveis im ON i.imovel_id = im.id
    `);
    res.json(results);
  } catch (err) {
    console.error("Erro ao buscar inquilinos com imóvel:", err);
    res.status(500).json({ erro: "Erro ao buscar inquilinos com imóvel" });
  }
});

// Rota GET - todos os Pagamentos de um inquilino
app.get("/todos-pagamentos", async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT p.*, i.nome AS nome_inquilino
      FROM pagamentos p
      JOIN inquilinos i ON p.inquilino_id = i.id
      ORDER BY p.data_pagamento DESC
    `);
    res.json(results);
  } catch (err) {
    console.error("Erro ao buscar pagamentos:", err);
    res.status(500).json({ erro: "Erro ao buscar pagamentos" });
  }
});


// ------------------ ROTAS POST ------------------

// Rota POST - Adicionar imóvel
app.post("/imoveis", async (req, res) => {
  const { tipo, endereco, numero } = req.body;
  try {
    const [results] = await db.query(
      "INSERT INTO imoveis (tipo, endereco, numero) VALUES (?, ?, ?)",
      [tipo, endereco, numero]
    );
    res.status(201).json({ id: results.insertId, tipo, endereco, numero });
  } catch (err) {
    console.error("Erro ao adicionar imóvel:", err);
    res.status(500).json({ erro: "Erro ao adicionar imóvel" });
  }
});



// Rota POST - Adicionar inquilino
app.post("/inquilinos", async (req, res) => {
  const {
    imovel_id,
    nome,
    numero_imovel,
    telefone,
    valor_aluguel,
    data_vencimento,
  } = req.body;
  try {
    const [results] = await db.query(
      "INSERT INTO inquilinos (imovel_id, nome, numero_imovel, telefone, valor_aluguel, data_vencimento) VALUES (?, ?, ?, ?, ?, ?)",
      [imovel_id, nome, numero_imovel, telefone, valor_aluguel, data_vencimento]
    );
    res.status(201).json({
      id: results.insertId,
      imovel_id,
      nome,
      numero_imovel,
      telefone,
      valor_aluguel,
      data_vencimento,
    });
  } catch (err) {
    console.error("Erro ao adicionar inquilino:", err);
    res.status(500).json({ erro: "Erro ao adicionar inquilino" });
  }
});

// Rota POST - Adicionar pagamento
app.post("/pagamentos", async (req, res) => {
  const {
    inquilino_id,
    stripe_session_id,
    data_vencimento,
    data_pagamento,
    valor_pago,
    status,
  } = req.body;
  try {
    const [results] = await db.query(
      "INSERT INTO pagamentos (inquilino_id, stripe_session_id, data_vencimento, data_pagamento, valor_pago, status) VALUES (?, ?, ?, ?, ?, ?)",
      [
        inquilino_id,
        stripe_session_id,
        data_vencimento,
        data_pagamento,
        valor_pago,
        status,
      ]
    );
    res.status(201).json({
      id: results.insertId,
      inquilino_id,
      stripe_session_id,
      data_vencimento,
      data_pagamento,
      valor_pago,
      status,
    });
  } catch (err) {
    console.error("Erro ao adicionar pagamento:", err);
    res.status(500).json({ erro: "Erro ao adicionar pagamento" });
  }
});

// Rota GET - Buscar inquilino por telefone
app.get("/getinquilino/:telefone", async (req, res) => {
  const { telefone } = req.params;
  try {
    const [results] = await db.query("SELECT * FROM inquilinos WHERE telefone = ?", [telefone]);
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

// Rota GET - Pagamentos por inquilino e status
app.get("/pagamentos/:inquilino_id/status/:status", async (req, res) => {
  const { inquilino_id, status } = req.params;
  if (!inquilino_id) {
    return res.status(400).json({ erro: "inquilino_id não foi passado" });
  }
  try {
    const [results] = await db.query(
      "SELECT * FROM pagamentos WHERE inquilino_id = ? AND status = ?",
      [inquilino_id, status]
    );
    res.json(results);
  } catch (err) {
    console.error("Erro ao buscar pagamento:", err);
    res.status(500).json({ erro: "Erro ao buscar pagamento" });
  }
});

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
      success_url: "https://locapay-production-844e.up.railway.app/sucesso",
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