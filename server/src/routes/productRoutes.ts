import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  adjustStock,
  getStockLogs
} from '../controllers/productController';
import { authenticateToken } from '../middleware/auth';
import { requireRoles } from '../middleware/roles';

const router = Router();

router.use(authenticateToken);

router.get('/stock-logs', requireRoles(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']), getStockLogs);
router.get('/', requireRoles(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']), getProducts);
router.get('/:id', requireRoles(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']), getProductById);
router.post('/', requireRoles(['ADMIN', 'WAREHOUSE']), createProduct);
router.put('/:id', requireRoles(['ADMIN', 'WAREHOUSE']), updateProduct);
router.post('/:id/adjust-stock', requireRoles(['ADMIN', 'WAREHOUSE']), adjustStock);

export default router;
