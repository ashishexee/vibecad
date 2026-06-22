import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { saveModelMetadata, getSavedModels, getSavedModel, deleteSavedModel } from '../services/db';
import { uploadTo0G, fetchFrom0G } from '../services/zgStorage';

export const router = express.Router();

router.post('/upload-to-0g', authMiddleware, async (req, res) => {
  try {
    const walletAddress = (req as any).walletAddress;
    const { chatSessionId, messageOrder, name, code, stlBase64, stepBase64, glbBase64, parameters, boundingBox } = req.body;

    if (!chatSessionId || messageOrder === undefined || !code) {
      res.status(400).json({ error: 'chatSessionId, messageOrder, and code are required' });
      return;
    }

    // Acknowledge receipt to avoid blocking frontend while async upload happens
    res.json({ success: true, message: 'Upload to 0G started in background' });

    // Background upload
    (async () => {
      try {
        console.log(`[0G] Starting background upload for session ${chatSessionId} message ${messageOrder}`);
        const [rootHashCode, rootHashStl, rootHashStep, rootHashGlb] = await Promise.all([
          uploadTo0G(code, false),
          stlBase64 ? uploadTo0G(stlBase64, true) : Promise.resolve(undefined),
          stepBase64 ? uploadTo0G(stepBase64, true) : Promise.resolve(undefined),
          glbBase64 ? uploadTo0G(glbBase64, true) : Promise.resolve(undefined),
        ]);

        console.log(`[0G] Upload complete. Saving metadata...`);
        await saveModelMetadata(walletAddress, {
          name: name || `Iteration ${messageOrder}`,
          rootHashCode,
          rootHashStl,
          rootHashStep,
          rootHashGlb,
          parameters,
          boundingBox,
          chatSessionId,
          messageOrder,
        });
        console.log(`[0G] Metadata saved for session ${chatSessionId} message ${messageOrder}`);
      } catch (err) {
        console.error(`[0G] Background upload failed:`, err);
      }
    })();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg });
  }
});

router.get('/fetch-from-0g/:rootHash', authMiddleware, async (req, res) => {
  try {
    const isBase64 = req.query.isBase64 === 'true';
    const dataStr = await fetchFrom0G(req.params.rootHash, isBase64);
    res.json({ success: true, data: dataStr });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg });
  }
});

router.post('/save', authMiddleware, async (req, res) => {
  try {
    const walletAddress = (req as any).walletAddress;
    const result = await saveModelMetadata(walletAddress, req.body);
    if (!result) {
      res.status(500).json({ error: 'Failed to save model' });
      return;
    }
    res.json({ success: true, ...result });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const walletAddress = (req as any).walletAddress;
    const models = await getSavedModels(walletAddress);
    res.json({ models });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const walletAddress = (req as any).walletAddress;
    const model = await getSavedModel(req.params.id, walletAddress);
    if (!model) {
      res.status(404).json({ error: 'Model not found' });
      return;
    }
    res.json({ model });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const walletAddress = (req as any).walletAddress;
    const ok = await deleteSavedModel(req.params.id, walletAddress);
    res.json({ success: ok });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg });
  }
});
