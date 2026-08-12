import { Router } from 'express';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  addFollowUp
} from '../controllers/customerController';
import { authenticateToken } from '../middleware/auth';
import { requireRoles } from '../middleware/roles';

const router = Router();

router.use(authenticateToken);

router.get('/', requireRoles(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']), getCustomers);
router.get('/:id', requireRoles(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']), getCustomerById);
router.post('/', requireRoles(['ADMIN', 'SALES']), createCustomer);
router.put('/:id', requireRoles(['ADMIN', 'SALES']), updateCustomer);
router.post('/:id/followups', requireRoles(['ADMIN', 'SALES']), addFollowUp);

export default router;
