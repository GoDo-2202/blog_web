import express from 'express'
import searchController from '../app/controllers/SearchController.js'

const router = express.Router()

router.get('/', searchController.index)
router.put('/', searchController.put)
router.post('/', searchController.post)
router.delete('/', searchController.delete)

export default router