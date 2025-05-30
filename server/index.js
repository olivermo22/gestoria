const express = require('express');
const cors = require('cors');
const path = require('path');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get('/api/thread', async (req, res) => {
  try {
    const thread = await openai.beta.threads.create();
    res.json({ thread_id: thread.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo crear el thread' });
  }
});

app.post('/api/message', async (req, res) => {
  try {
    const { message, thread_id } = req.body;

    await openai.beta.threads.messages.create(thread_id, {
      role: "user",
      content: message,
    });

    const run = await openai.beta.threads.runs.create(thread_id, {
      assistant_id: process.env.ASSISTANT_ID
    });

    let completed = false;
    let replyText = '...';

    while (!completed) {
      const runStatus = await openai.beta.threads.runs.retrieve(thread_id, run.id);
      if (runStatus.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(thread_id);
        replyText = messages.data[0].content[0].text.value;
        completed = true;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    res.json({ reply: replyText });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error procesando el mensaje' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});
