import { Router } from 'express';
import {
  getChallans,
  getChallanById,
  createChallan,
  updateChallanStatus,
  downloadChallanPDF
} from '../controllers/challanController';
import { authenticateToken } from '../middleware/auth';
import { requireRoles } from '../middleware/roles';

const router = Router();

router.use(authenticateToken);

router.get('/', requireRoles(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']), getChallans);
router.get('/:id', requireRoles(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']), getChallanById);
router.get('/:id/pdf', requireRoles(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']), downloadChallanPDF);
router.post('/', requireRoles(['ADMIN', 'SALES']), createChallan);
router.put('/:id/status', requireRoles(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']), updateChallanStatus);

export default router;
