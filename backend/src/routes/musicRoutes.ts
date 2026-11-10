import { Router } from 'express';
import { searchMusic, recommendMusic, getTrending } from '../controllers/musicController.js';

const router = Router();

router.get('/search', searchMusic);
router.post('/recommend', recommendMusic);
router.get('/trending', getTrending);

export default router;

