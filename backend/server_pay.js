const express = require('express');
const stripe = require('./stripe');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());


app.post('/criar-pagamento', async (req, res) => {
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
      success_url: 'http://localhost:3000/sucesso',
      cancel_url: 'http://localhost:3000/cancelado',
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar sessão de pagamento' });
  }
});
