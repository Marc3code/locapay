const express = require("express");
const db = require("./database.js");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
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

// Rota GET - Inquilinos com Imóvel (atualizada para nova estrutura)
app.get("/inquilinos-com-imovel", async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        i.id AS inquilino_id, 
        i.nome, 
        i.telefone, 
        i.cpfCnpj,
        i.id_asaas,
        ii.id AS relacao_id,
        ii.valor_aluguel, 
        ii.data_vencimento,
        ii.data_inicio,
        ii.data_fim,
        ii.status,
        im.id AS imovel_id,
        im.tipo AS tipo_imovel, 
        im.endereco, 
        im.numero,
        im.complemento
      FROM inquilinos i
      JOIN inquilinos_imoveis ii ON i.id = ii.inquilino_id
      JOIN imoveis im ON ii.imovel_id = im.id
    `);
    res.json(results);
  } catch (err) {
    console.error("Erro ao buscar inquilinos com imóvel:", err);
    res.status(500).json({ erro: "Erro ao buscar inquilinos com imóvel" });
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

// ------------------ ROTAS POST ------------------

// Rota POST - Adicionar imóvel (atualizada com complemento)
app.post("/imoveis", async (req, res) => {
  const { tipo, endereco, numero, complemento } = req.body;
  try {
    const [results] = await db.query(
      "INSERT INTO imoveis (tipo, endereco, numero, complemento) VALUES (?, ?, ?, ?)",
      [tipo, endereco, numero, complemento]
    );
    res.status(201).json({ 
      id: results.insertId, 
      tipo, 
      endereco, 
      numero,
      complemento 
    });
  } catch (err) {
    console.error("Erro ao adicionar imóvel:", err);
    res.status(500).json({ erro: "Erro ao adicionar imóvel" });
  }
});

// Rota POST - Adicionar inquilino (atualizada com novos campos)
app.post("/inquilinos", async (req, res) => {
  const {
    nome,
    telefone,
    cpfCnpj,
    id_asaas
  } = req.body;

  try {
    const [results] = await db.query(
      "INSERT INTO inquilinos (nome, telefone, cpfCnpj, id_asaas) VALUES (?, ?, ?, ?)",
      [nome, telefone, cpfCnpj, id_asaas]
    );

    res.status(201).json({
      id: results.insertId,
      nome,
      telefone,
      cpfCnpj,
      id_asaas
    });
  } catch (err) {
    console.error("Erro ao adicionar inquilino:", err);
    res.status(500).json({ erro: "Erro ao adicionar inquilino" });
  }
});

// Rota POST - Vincular inquilino a imóvel
app.post("/inquilinos-imoveis", async (req, res) => {
  const {
    inquilino_id,
    imovel_id,
    valor_aluguel,
    data_vencimento,
    data_inicio,
    data_fim,
    status
  } = req.body;

  try {
    const [results] = await db.query(
      `INSERT INTO inquilinos_imoveis 
      (inquilino_id, imovel_id, valor_aluguel, data_vencimento, data_inicio, data_fim, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [inquilino_id, imovel_id, valor_aluguel, data_vencimento, data_inicio || null, data_fim || null, status || 'ativo']
    );

    res.status(201).json({
      id: results.insertId,
      inquilino_id,
      imovel_id,
      valor_aluguel,
      data_vencimento,
      data_inicio,
      data_fim,
      status
    });
  } catch (err) {
    console.error("Erro ao vincular inquilino a imóvel:", err);
    res.status(500).json({ erro: "Erro ao vincular inquilino a imóvel" });
  }
});

// Rota POST - Adicionar pagamento
app.post("/pagamentos", async (req, res) => {
  const {
    inquilino_id,
    asaas_payment_id,
    due_date,
    payment_date,
    amount,
    status
  } = req.body;

  try {
    const [results] = await db.query(
      `INSERT INTO pagamentos 
      (inquilino_id, asaas_payment_id, due_date, payment_date, amount, status) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [inquilino_id, asaas_payment_id, due_date, payment_date || null, amount, status || 'pendente']
    );

    res.status(201).json({
      id: results.insertId,
      inquilino_id,
      asaas_payment_id,
      due_date,
      payment_date,
      amount,
      status
    });
  } catch (err) {
    console.error("Erro ao registrar pagamento:", err);
    res.status(500).json({ erro: "Erro ao registrar pagamento" });
  }
});

// Rota GET - Buscar inquilino por telefone (atualizada)
app.get("/getinquilino/:telefone", async (req, res) => {
  const { telefone } = req.params;
  try {
    const [results] = await db.query(
      "SELECT * FROM inquilinos WHERE telefone = ?",
      [telefone]
    );
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

// Inicializa o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});