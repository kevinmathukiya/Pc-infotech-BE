import { Router } from 'express';
import { CategoryController } from './category.controller';
import { validate } from '../../middleware/validate';
import { authenticateAdmin } from '../../middleware/auth';
import { createCategorySchema, updateCategorySchema } from './category.validation';

const router = Router();

router.get('/', CategoryController.getAllCategories);

// Admin protected routes
router.post('/', authenticateAdmin, validate(createCategorySchema), CategoryController.createCategory);
router.put('/:id', authenticateAdmin, validate(updateCategorySchema), CategoryController.updateCategory);
router.delete('/:id', authenticateAdmin, CategoryController.deleteCategory);

export default router;
