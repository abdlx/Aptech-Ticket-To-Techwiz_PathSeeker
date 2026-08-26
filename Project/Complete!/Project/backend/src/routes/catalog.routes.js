import { Router } from 'express'
import * as catalogController from '../controllers/catalog.controller.js'

const router = Router()

// Career Bank is public browsing per the SRS ("students, graduates, and
// professionals" exploring careers) — personalization features (bookmarks,
// saved filters, comparisons, notes) require auth and live in their own
// routers added in a later milestone.
router.get('/domains', catalogController.getDomains)
router.get('/skills', catalogController.getSkills)
router.get('/search/suggestions', catalogController.getSearchSuggestions)
router.get('/careers', catalogController.getCareers)
router.get('/careers/:slug/related', catalogController.getRelatedCareers)
router.get('/careers/:slug/related-content', catalogController.getRelatedContent)
router.get('/careers/:slug', catalogController.getCareerBySlug)

export default router