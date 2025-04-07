const express = require('express');
const db = require('./database.js');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Rota básica
app.get('/', (req, res) => {
    res.send('API rodando!');
});

// Rota GET - Imóveis
app.get('/imoveis', (req, res) => {
    const query = 'SELECT * FROM imoveis';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar imóveis:', err);
            return res.status(500).json({ erro: 'Erro ao buscar imóveis' });
        }
        res.json(results);
    });
});

// Rota GET - Inquilinos
app.get('/inquilinos', (req, res) => {
    const query = 'SELECT * FROM inquilinos';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar inquilinos:', err);
            return res.status(500).json({ erro: 'Erro ao buscar inquilinos' });
        }
        res.json(results);
    });
});

// Rota GET - Pagamentos
app.get('/pagamentos', (req, res) => {
    const query = 'SELECT * FROM pagamentos';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar pagamentos:', err);
            return res.status(500).json({ erro: 'Erro ao buscar pagamentos' });
        }
        res.json(results);
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
