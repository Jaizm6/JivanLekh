import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Initialize Google GenAI client (picks up GEMINI_API_KEY from environment)
const ai = new GoogleGenAI();

// Endpoint for Suggest Edits (diff preview)
// Helper to call Gemini with model fallback if a model experiences high demand
async function callGeminiWithFallback(prompt: string): Promise<string> {
  const models = ['gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-2.5-flash'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });
      if (response && response.text) {
        return response.text.trim();
      }
    } catch (err: any) {
      console.warn(`Model ${model} failed, trying next fallback:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('All AI models unavailable');
}

// Endpoint for Suggest Edits (diff preview)
app.post('/api/ai/suggest', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.json({ suggestion: '' });
    }

    const prompt = `You are an expert editor. Improve the following text for clarity, conciseness, flow, and grammar. Preserve the original meaning and formatting. Return ONLY the edited text, with no explanations, greetings, or surrounding quotes:\n\n${text}`;
    const suggestion = await callGeminiWithFallback(prompt);
    res.json({ suggestion });
  } catch (error: any) {
    console.error('Error in /api/ai/suggest:', error);
    res.status(500).json({ error: error.message || 'AI suggest edits failed' });
  }
});

// Endpoint for Ask AI (improve writing, fix grammar, summarize, shorter, longer, custom)
app.post('/api/ai/ask', async (req: Request, res: Response) => {
  try {
    const { action, text, prompt } = req.body;
    if (!text && !prompt) {
      return res.status(400).json({ error: 'Text or prompt is required' });
    }

    let userPrompt = '';
    switch (action) {
      case 'improve':
        userPrompt = `Improve the writing of the following text to make it more engaging, articulate, and polished:\n\n${text}`;
        break;
      case 'fix':
        userPrompt = `Fix all spelling, punctuation, and grammatical mistakes in the following text, keeping the original voice:\n\n${text}`;
        break;
      case 'summarize':
        userPrompt = `Provide a concise, high-impact bulleted or paragraph summary of the following text:\n\n${text}`;
        break;
      case 'shorter':
        userPrompt = `Make the following text significantly shorter and more concise without losing core meaning:\n\n${text}`;
        break;
      case 'longer':
        userPrompt = `Elaborate and expand on the following text with insightful context, supporting detail, and examples:\n\n${text}`;
        break;
      case 'custom':
      default:
        userPrompt = `${prompt || 'Analyze and refine the following text'}:\n\n${text || ''}`;
        break;
    }

    const result = await callGeminiWithFallback(userPrompt);
    res.json({ result });
  } catch (error: any) {
    console.error('Error in /api/ai/ask:', error);
    res.status(500).json({ error: error.message || 'Ask AI request failed' });
  }
});

async function main() {
  const PORT = 3000;

  // Mount Vite middleware for development
  const vite = await createViteServer({
    server: { middlewareMode: true, allowedHosts: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening at http://localhost:${PORT}`);
  });
}

main().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
