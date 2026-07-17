import { Router } from 'express';
import { BlogController } from './blog.controller';
import { validate } from '../../middleware/validate';
import { authenticateAdmin } from '../../middleware/auth';
import { upload } from '../../middleware/upload';
import { createBlogSchema, updateBlogSchema } from './blog.validation';

const router = Router();

// Admin
router.get('/admin/all', authenticateAdmin, BlogController.getAllBlogsAdmin);

// Public
router.get('/', BlogController.getAllBlogs);
router.get('/:slug', BlogController.getBlogBySlug);
router.post(
  '/',
  authenticateAdmin,
  upload.fields([{ name: 'featuredImage', maxCount: 1 }]),
  validate(createBlogSchema),
  BlogController.createBlog
);
router.put(
  '/:id',
  authenticateAdmin,
  upload.fields([{ name: 'featuredImage', maxCount: 1 }]),
  validate(updateBlogSchema),
  BlogController.updateBlog
);
router.delete('/:id', authenticateAdmin, BlogController.deleteBlog);

export default router;
