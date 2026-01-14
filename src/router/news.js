import express from 'express';
import newsController from '../app/controllers/NewsController.js';

const router = express.Router()

router.get('/', newsController.index);
router.post('/', newsController.post);
router.put('/:id', newsController.put);
router.delete('/:id', newsController.delete);

export default router