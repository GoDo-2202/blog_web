import express from 'express'
import searchController from '../app/controllers/SearchController.js'
import { ROOT_PATH } from "../app/constants/apiPaths.js";

const router = express.Router()

router.get(ROOT_PATH, searchController.index)
router.put(ROOT_PATH, searchController.put)
router.post(ROOT_PATH, searchController.post)
router.delete(ROOT_PATH, searchController.delete)

export default router