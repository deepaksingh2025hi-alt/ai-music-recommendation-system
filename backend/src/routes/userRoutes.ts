import { Router } from 'express';
import {
  getFavourites,
  addFavourite,
  removeFavourite,
  getHistory,
  addHistory,
  getUserProfile,
  updateUserProfile,
} from '../controllers/userController.js';

const router = Router();

// Favourites
router.get('/favourites', getFavourites);
router.post('/favourites', addFavourite);
router.delete('/favourites/:videoId', removeFavourite);

// History
router.get('/history', getHistory);
router.post('/history', addHistory);

// User profile & preferences
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

export default router;

