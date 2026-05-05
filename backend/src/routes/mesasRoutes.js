import { Router } from 'express';
import { createMesa, deleteMesa, listMesas, updateMesa } from '../controllers/mesasController.js';
import { auth, permit } from '../middleware/auth.js';

const router = Router();

router.use(auth);
router.get('/', listMesas);
router.post('/', permit('admin'), createMesa);
router.put('/:id', permit('admin'), updateMesa);
router.delete('/:id', permit('admin'), deleteMesa);

export default router;
