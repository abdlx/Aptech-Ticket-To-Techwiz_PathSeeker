import { Router } from 'express'
import * as catalogController from '../controllers/catalog.controller.js'

const router = Router()

router.get('/domains', catalogController.getDomains)
router.get('/skills', catalogController.getSkills)
router.get('/search/suggestions', catalogController.getSearchSuggestions)
router.get('/careers', catalogController.getCareers)
router.get('/careers/:slug/related', catalogController.getRelatedCareers)
router.get('/careers/:slug/related-content', catalogController.getRelatedContent)
router.get('/careers/:slug', catalogController.getCareerBySlug)

export default router