import express from 'express';
import newsController from '../app/controllers/NewsController.js';

import { ROOT_PATH, ID_PARAM } from "../app/constants/apiPaths.js";

const router = express.Router()

router.get(ROOT_PATH, newsController.index);
router.post(ROOT_PATH, newsController.post);
router.put(ID_PARAM, newsController.put);
router.delete(ID_PARAM, newsController.delete);

export default router