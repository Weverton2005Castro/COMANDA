import { Router } from 'express';
import { createProduto, deleteProduto, listCardapioPublico, listProdutos, updateProduto } from '../controllers/produtosController.js';
import { auth, permit } from '../middleware/auth.js';

const router = Router();

router.get('/publico/:restauranteId', listCardapioPublico);
router.use(auth);
router.get('/', listProdutos);
router.post('/', permit('admin'), createProduto);
router.put('/:id', permit('admin'), updateProduto);
router.delete('/:id', permit('admin'), deleteProduto);

export default router;
