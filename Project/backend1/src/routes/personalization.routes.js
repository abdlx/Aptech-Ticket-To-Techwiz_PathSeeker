import { Router } from 'express'
import * as personalizationController from '../controllers/personalization.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

const router = Router()
router.use(requireAuth)

// Not yet in frontend/src/services/pathseekerApi.js endpoints map — added
// here because bookmarking is an explicit SRS requirement. See handover
// docs for the suggested endpoints.bookmarks entry to add on the frontend.
router.get('/bookmarks', personalizationController.getBookmarks)
router.post('/bookmarks', personalizationController.createBookmark)
router.patch('/bookmarks/:id', personalizationController.updateBookmark)
router.delete('/bookmarks/:id', personalizationController.deleteBookmark)

// Matches endpoints.recentlyViewed = '/users/me/recently-viewed'
router.get('/recently-viewed', personalizationController.getRecentlyViewed)
router.post('/recently-viewed', personalizationController.createRecentlyViewed)

// Matches endpoints.savedFilters = '/users/me/saved-filters'
router.get('/saved-filters', personalizationController.getSavedFilters)
router.post('/saved-filters', personalizationController.createSavedFilter)
router.delete('/saved-filters/:id', personalizationController.deleteSavedFilter)

// Matches endpoints.comparisons = '/users/me/comparisons'
router.get('/comparisons', personalizationController.getComparisons)
router.post('/comparisons', personalizationController.createComparison)
router.delete('/comparisons/:id', personalizationController.deleteComparison)

export default router