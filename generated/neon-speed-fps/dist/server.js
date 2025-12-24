import 'dotenv/config';
import express from 'express';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Easy AI Mode Configuration
const SYSTEM_PROMPT = process.env.AI_SYSTEM_PROMPT || 'You are a helpful assistant.';

app.post('/api/chat', async (req, res) => {
  const { message, provider = 'openai' } = req.body;
  try {
    let reply = '';
    if (provider === 'openai') {
      const completion = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message }
        ],
        model: 'gpt-4-turbo-preview',
      });
      reply = completion.choices[0].message.content;
    } else if (provider === 'anthropic') {
      const msg = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: message }],
      });
      reply = msg.content[0].text;
    }
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('LLM Gateway running on 3000'));