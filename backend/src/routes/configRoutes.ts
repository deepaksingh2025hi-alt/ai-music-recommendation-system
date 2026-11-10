import { Router } from 'express';
import { getSystemStatus, updateKeys } from '../controllers/configController.js';

const router = Router();

router.get('/status', getSystemStatus);
router.post('/keys', updateKeys);

export default router;

