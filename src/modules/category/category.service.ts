import { Category } from './category.model';
import { ApiFeatures } from '../../utils/apiFeatures';
import { AppError } from '../../utils/appError';
import { HttpStatus } from '../../constants/httpStatusCodes';
import { Brand } from '../brand/brand.model';

const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');

export class CategoryService {
  static async getAllCategories(queryObj: any) {
    const features = new ApiFeatures(Category.find().populate('brand'), queryObj)
      .filter()
      .search(['name', 'description'])
      .sort()
      .limitFields()
      .paginate();

    const categories = await features.query;
    const total = await Category.countDocuments({
      ...features.filter().query.getFilter(),
      isDeleted: false,
    });

    return { categories, total };
  }

  static async createCategory(body: {
    brand: string;
    name: string;
    description?: string;
    status?: 'active' | 'inactive';
  }) {
    const brand = await Brand.findOne({ _id: body.brand, isDeleted: false });
    if (!brand) {
      throw new AppError('Associated Brand not found', HttpStatus.NOT_FOUND);
    }

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
    body: { brand?: string; name?: string; description?: string; status?: 'active' | 'inactive' }
  ) {
    const category = await Category.findById(id);
    if (!category || category.isDeleted) {
      throw new AppError('Category not found', HttpStatus.NOT_FOUND);
    }

    if (body.brand) {
      const brand = await Brand.findOne({ _id: body.brand, isDeleted: false });
      if (!brand) {
        throw new AppError('Associated Brand not found', HttpStatus.NOT_FOUND);
      }
      category.brand = brand._id as any;
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
