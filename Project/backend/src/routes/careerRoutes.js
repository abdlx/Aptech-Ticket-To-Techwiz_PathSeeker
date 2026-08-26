import { Router } from 'express'
import { body } from 'express-validator'
import { validateRequest } from '../middleware/validate.js'
import { requireAuth } from '../middleware/auth.js'
import {
  listCareers,
  searchCareerSuggestions,
  getCareerBySlug,
  listSavedSearches,
  createSavedSearch,
  deleteSavedSearch,
} from '../controllers/careerController.js'

const router = Router()

// IMPORTANT: specific routes must come before the '/:slug' catch-all route below.
router.get('/', listCareers)
router.get('/search', searchCareerSuggestions)

router.get('/saved-searches', requireAuth, listSavedSearches)
router.post(
  '/saved-searches',
  requireAuth,
  [body('label').trim().isLength({ min: 1, max: 100 }).withMessage('Label is required.')],
  validateRequest,
  createSavedSearch,
)
router.delete('/saved-searches/:id', requireAuth, deleteSavedSearch)

router.get('/:slug', getCareerBySlug)

export default router