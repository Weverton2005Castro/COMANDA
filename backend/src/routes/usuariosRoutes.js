import { Router } from 'express';
import { deleteUsuario, listUsuarios, updateUsuario } from '../controllers/usuariosController.js';
import { auth, permit } from '../middleware/auth.js';

const router = Router();

router.use(auth, permit('admin'));
router.get('/', listUsuarios);
router.put('/:id', updateUsuario);
router.delete('/:id', deleteUsuario);

export default router;
