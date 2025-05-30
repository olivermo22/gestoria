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

// Creamos el hilo una sola vez para mantener la conversación
let threadId = null;

async function getThreadId() {
  if (!threadId) {
    const thread = await openai.beta.threads.create();
    threadId = thread.id;
  }
  return threadId;
}

app.post('/api/message', async (req, res) => {
  try {
    const userMessage = req.body.message;
    const threadId = await getThreadId();

    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: "asst_zW2PFxbqvj7MmHRjff65zZfo",
      instructions: "Eres un asistente de Gestoría Virtual. Brinda respuestas claras y precisas sobre trámites de licencias.",
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