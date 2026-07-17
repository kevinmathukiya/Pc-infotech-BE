import { Product } from './product.model';
import { SparePartService } from '../sparePart/sparePart.service';
import { ApiFeatures } from '../../utils/apiFeatures';
import { AppError } from '../../utils/appError';
import { HttpStatus } from '../../constants/httpStatusCodes';
import { uploadToCloudinary, deleteFromCloudinary } from '../../helpers/cloudinary';
import { Category } from '../category/category.model';
import { slugify } from '../../utils/slugify';

export class ProductService {
  static async getAllProducts(queryObj: any) {
    const searchFields = ['name', 'modelNumber', 'sku', 'shortDescription'];

    // Default to 'product' if productType is not explicitly specified in the query
    if (!queryObj.productType) {
      queryObj.productType = 'product';
    }

    // Intercept query for spare parts to maintain backward compatibility
    if (queryObj.productType === 'spare_part') {
      const queryClean = { ...queryObj };
      delete queryClean.productType;
      const { spareParts, total } = await SparePartService.getAllSpareParts(queryClean);
      const products = spareParts.map((sp) => {
        const obj = sp.toObject();
        return {
          ...obj,
          productType: 'spare_part',
          stockQuantity: obj.stockQuantity ?? obj.stock,
          modelNumber: obj.modelNumber ?? obj.compatibleModels ?? '',
        };
      });
      return { products: products as any[], total };
    }

    const features = new ApiFeatures(
      Product.find().populate('category'),
      queryObj
    )
      .filter()
      .search(searchFields)
      .sort()
      .limitFields()
      .paginate();

    const products = await features.query;
    const total = await Product.countDocuments({
      ...features.getFilter(),
      isDeleted: false,
    });

    return { products, total };
  }

  static async getProductBySlug(slug: string) {
    let product = await Product.findOne({ slug, isDeleted: false })
      .populate('category');

    // Intercept query for spare parts to maintain backward compatibility
    if (!product) {
      try {
        const sparePart = await SparePartService.getSparePartByIdOrSlug(slug);
        if (sparePart) {
          const obj = sparePart.toObject();
          product = {
            ...obj,
            productType: 'spare_part',
            stockQuantity: obj.stockQuantity ?? obj.stock,
            modelNumber: obj.modelNumber ?? obj.compatibleModels ?? '',
          } as any;
        }
      } catch (err) {
        // Fall through to Product not found error if check fails
      }
    }

    if (!product) {
      throw new AppError('Product not found', HttpStatus.NOT_FOUND);
    }
    return product;
  }

  static async createProduct(
    body: any,
    files: {
      images: Buffer[];
    }
  ) {
    const category = await Category.findOne({ _id: body.category, isDeleted: false });
    if (!category) throw new AppError('Category not found', HttpStatus.NOT_FOUND);

    const slug = slugify(body.name);
    const existing = await Product.findOne({ slug });
    if (existing) {
      throw new AppError('Product with this name already exists.', HttpStatus.CONFLICT);
    }

    const imagesResults = [];
    for (const imageBuffer of files.images) {
      const res = await uploadToCloudinary(imageBuffer, 'products/images');
      imagesResults.push(res);
    }

    const product = await Product.create({
      ...body,
      slug,
      images: imagesResults,
    });

    return product;
  }

  static async updateProduct(
    id: string,
    body: any,
    files?: {
      images?: Buffer[];
    }
  ) {
    const product = await Product.findById(id);
    if (!product || product.isDeleted) {
      throw new AppError('Product not found', HttpStatus.NOT_FOUND);
    }

    if (body.brand) {
      product.brand = body.brand;
    }

    if (body.category) {
      const category = await Category.findOne({ _id: body.category, isDeleted: false });
      if (!category) throw new AppError('Category not found', HttpStatus.NOT_FOUND);
      product.category = category._id as any;
    }

    if (body.name && body.name !== product.name) {
      const slug = slugify(body.name);
      const existing = await Product.findOne({ slug, _id: { $ne: id } });
      if (existing) {
        throw new AppError('Product with this name already exists.', HttpStatus.CONFLICT);
      }
      product.name = body.name;
      product.slug = slug;
    }

    const primitiveFields = [
      'modelNumber',
      'sku',
      'shortDescription',
      'fullDescription',
      'specifications',
      'features',
      'warranty',
      'price',
      'discountPrice',
      'stockQuantity',
      'status',
      'isFeatured',
      'isNewArrival',
      'isBestSeller',
      'metaTitle',
      'metaDescription',
    ];

    primitiveFields.forEach((field) => {
      if (body[field] !== undefined) {
        (product as any)[field] = body[field];
      }
    });

    if (files?.images && files.images.length > 0) {
      for (const img of product.images) {
        await deleteFromCloudinary(img.publicId);
      }
      const newImages = [];
      for (const imgBuffer of files.images) {
        const res = await uploadToCloudinary(imgBuffer, 'products/images');
        newImages.push(res);
      }
      product.images = newImages;
    }

    await product.save();
    return product;
  }

  static async deleteProduct(id: string) {
    const product = await Product.findById(id);
    if (!product || product.isDeleted) {
      throw new AppError('Product not found', HttpStatus.NOT_FOUND);
    }
    product.isDeleted = true;
    await product.save();
  }
}
