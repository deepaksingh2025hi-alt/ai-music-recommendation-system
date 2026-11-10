import { Router } from 'express';
import { analyzePrompt, chatWithAi } from '../controllers/aiController.js';

const router = Router();

router.post('/analyze', analyzePrompt);
router.post('/chat', chatWithAi);

export default router;
