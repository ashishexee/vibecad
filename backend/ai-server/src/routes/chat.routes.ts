import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { saveChatSession, getChatSessions, getChatSession, supabase } from '../services/db';
import type { ChatMessageData } from '../services/db';
import { fetchFrom0G } from '../services/zgStorage';

export const router = express.Router();

router.post('/save', authMiddleware, async (req, res) => {
  try {
    const walletAddress = (req as any).walletAddress;
    const { sessionId, messages: rawMessages, parameters } = req.body as {
      sessionId?: string;
      messages?: ChatMessageData[];
      parameters?: { name: string; default: number; min?: number; max?: number; step?: number }[];
    };

    if (!rawMessages || rawMessages.length === 0) {
      res.status(400).json({ error: 'Messages are required' });
      return;
    }

    const id = await saveChatSession(walletAddress, rawMessages, parameters as any, sessionId);
    res.json({ success: !!id, sessionId: id });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg });
  }
});

router.get('/sessions', authMiddleware, async (req, res) => {
  try {
    const walletAddress = (req as any).walletAddress;
    const sessions = await getChatSessions(walletAddress);
    res.json({ sessions });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg });
  }
});

router.get('/history/:sessionId', authMiddleware, async (req, res) => {
  try {
    const walletAddress = (req as any).walletAddress;
    const result = await getChatSession(req.params.sessionId, walletAddress);
    if (!result) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const { data: models } = await supabase
      .from('saved_models')
      .select('root_hash_code, message_order')
      .eq('chat_session_id', req.params.sessionId)
      .eq('user_wallet', walletAddress)
      .order('message_order', { ascending: false })
      .limit(1);

    let code: string | undefined;
    if (models && models.length > 0 && models[0].root_hash_code) {
      try {
        code = await fetchFrom0G(models[0].root_hash_code);
      } catch (err) {
        console.error('[0G] Error fetching code:', err);
      }
    }

    // getChatSession already returned camelCase messages
    res.json({
      session: {
        ...result.session,
        messages: result.messages,
        code,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg });
  }
});
