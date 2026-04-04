/**
 * api/test-chat.ts
 * Vercel serverless — TestMode chat with Claude.
 * Replaces geminiService.ts client-side Gemini call.
 *
 * POST /api/test-chat
 * Body: { agentId?, systemPrompt, messages: [{role, content}] }
 * Response: { reply: string }
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { systemPrompt, messages, agentName } = req.body || {};

  if (!messages?.length) {
    return res.status(400).json({ error: 'messages required' });
  }

  try {
    const system = systemPrompt?.trim() ||
      `Eres ${agentName || 'un asistente virtual'} útil y profesional.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system,
      messages: messages.slice(-10).map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
    });

    const reply = message.content
      .filter((c: any) => c.type === 'text')
      .map((c: any) => c.text)
      .join('');

    return res.status(200).json({ reply });
  } catch (err: any) {
    console.error('[test-chat] Error:', err);
    return res.status(500).json({ error: 'Generation failed', detail: err.message });
  }
}
