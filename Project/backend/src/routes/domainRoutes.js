import { Router } from 'express'
import { listDomains } from '../controllers/domainController.js'

const router = Router()

router.get('/', listDomains)

export default router