import { Router } from 'express';
import {
  addItens,
  createComanda,
  deleteItem,
  financeiroDia,
  getComandaAtivaByMesa,
  listComandas,
  pagarComanda,
  updateStatus
} from '../controllers/comandasController.js';
import { auth, permit } from '../middleware/auth.js';

const router = Router();

router.use(auth);
router.get('/financeiro/dia', permit('gestor', 'admin'), financeiroDia);
router.get('/mesa/:mesaId/ativa', getComandaAtivaByMesa);
router.get('/', permit('gestor', 'admin'), listComandas);
router.post('/', permit('garcom', 'admin'), createComanda);
router.post('/:id/itens', permit('garcom', 'admin'), addItens);
router.delete('/:id/itens/:itemId', permit('garcom', 'admin'), deleteItem);
router.put('/:id/status', permit('gestor', 'admin'), updateStatus);
router.post('/:id/pagar', permit('garcom', 'gestor', 'admin'), pagarComanda);

export default router;
