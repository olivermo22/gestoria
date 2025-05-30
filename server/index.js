
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

app.post('/api/message', async (req, res) => {
  try {
    const { message, threadId: clientThreadId } = req.body;
    let threadId = clientThreadId;

    // Crear un thread si no lo mandó el frontend
    if (!threadId) {
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
    }

    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: "asst_zW2PFxbqvj7MmHRjff65zZfo"
    });

    let completed = false;
    let replyText = '...';

    while (!completed) {
      const runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      if (runStatus.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(threadId);
        replyText = messages.data[0].content[0].text.value;
        completed = true;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    res.json({ reply: replyText, threadId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error procesando el mensaje' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});
