import { Router } from 'express';
import { BranchController } from './branch.controller';
import { validate } from '../../middleware/validate';
import { authenticateAdmin } from '../../middleware/auth';
import { createBranchSchema, updateBranchSchema } from './branch.validation';

const router = Router();

router.get('/', BranchController.getAllBranches);
router.post('/', authenticateAdmin, validate(createBranchSchema), BranchController.createBranch);
router.put('/:id', authenticateAdmin, validate(updateBranchSchema), BranchController.updateBranch);
router.delete('/:id', authenticateAdmin, BranchController.deleteBranch);

export default router;
