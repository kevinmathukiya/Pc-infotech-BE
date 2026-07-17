import { Category } from './category.model';
import { ApiFeatures } from '../../utils/apiFeatures';
import { AppError } from '../../utils/appError';
import { HttpStatus } from '../../constants/httpStatusCodes';
import { slugify } from '../../utils/slugify';

export class CategoryService {
  static async getAllCategories(queryObj: any) {
    const features = new ApiFeatures(Category.find(), queryObj)
      .filter()
      .search(['name', 'description'])
      .sort()
      .limitFields()
      .paginate();

    const categories = await features.query;
    const total = await Category.countDocuments({
      ...features.getFilter(),
      isDeleted: false,
    });

    return { categories, total };
  }

  static async createCategory(body: {
    brand: 'HP' | 'Canon';
    name: string;
    description?: string;
    status?: 'active' | 'inactive';
  }) {
    const slug = slugify(body.name);
    const existing = await Category.findOne({ slug });
    if (existing) {
      throw new AppError('Category with this name already exists.', HttpStatus.CONFLICT);
    }

    const category = await Category.create({
      ...body,
      slug,
    });

    return category;
  }

  static async updateCategory(
    id: string,
    body: { brand?: 'HP' | 'Canon'; name?: string; description?: string; status?: 'active' | 'inactive' }
  ) {
    const category = await Category.findById(id);
    if (!category || category.isDeleted) {
      throw new AppError('Category not found', HttpStatus.NOT_FOUND);
    }

    if (body.brand) {
      category.brand = body.brand;
    }

    if (body.name && body.name !== category.name) {
      const slug = slugify(body.name);
      const existing = await Category.findOne({ slug, _id: { $ne: id } });
      if (existing) {
        throw new AppError('Category with this name already exists.', HttpStatus.CONFLICT);
      }
      category.name = body.name;
      category.slug = slug;
    }

    if (body.description !== undefined) category.description = body.description;
    if (body.status) category.status = body.status;

    await category.save();
    return category;
  }

  static async deleteCategory(id: string) {
    const category = await Category.findById(id);
    if (!category || category.isDeleted) {
      throw new AppError('Category not found', HttpStatus.NOT_FOUND);
    }

    category.isDeleted = true;
    await category.save();
  }
}
