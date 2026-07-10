import { Types } from 'mongoose';
import { SparePart } from './sparePart.model';
import { Brand } from '../brand/brand.model';
import { Category } from '../category/category.model';
import { Product } from '../product/product.model';
import { ApiFeatures } from '../../utils/apiFeatures';
import { AppError } from '../../utils/appError';
import { HttpStatus } from '../../constants/httpStatusCodes';
import { uploadToCloudinary, deleteFromCloudinary } from '../../helpers/cloudinary';

const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');

export class SparePartService {
  static async createSparePart(
    body: any,
    files: {
      thumbnail: Buffer;
      images: Buffer[];
    },
    adminId: string
  ) {
    // Validate referenced Brand
    const brand = await Brand.findOne({ _id: body.brand, isDeleted: false });
    if (!brand) throw new AppError('Brand not found', HttpStatus.NOT_FOUND);

    // Validate referenced Category
    const category = await Category.findOne({ _id: body.category, isDeleted: false });
    if (!category) throw new AppError('Category not found', HttpStatus.NOT_FOUND);

    // Validate referenced Product
    const product = await Product.findOne({ _id: body.product, isDeleted: false });
    if (!product) throw new AppError('Parent Product model not found', HttpStatus.NOT_FOUND);

    // Setup fields for backward compatibility
    if (body.stock === undefined && body.stockQuantity !== undefined) {
      body.stock = Number(body.stockQuantity);
    }
    if (body.stockQuantity === undefined && body.stock !== undefined) {
      body.stockQuantity = Number(body.stock);
    }
    if (body.compatibleModels === undefined && body.modelNumber !== undefined) {
      body.compatibleModels = body.modelNumber;
    }
    if (body.modelNumber === undefined && body.compatibleModels !== undefined) {
      body.modelNumber = body.compatibleModels;
    }

    const slug = slugify(body.name);
    const existing = await SparePart.findOne({ slug });
    if (existing) {
      throw new AppError('Spare part with this name already exists.', HttpStatus.CONFLICT);
    }

    // Upload thumbnail
    const thumbnailResult = await uploadToCloudinary(files.thumbnail, 'spare-parts/thumbnails');

    // Upload gallery images
    const imagesResults = [];
    for (const imageBuffer of files.images) {
      const res = await uploadToCloudinary(imageBuffer, 'spare-parts/images');
      imagesResults.push(res);
    }

    const sparePart = await SparePart.create({
      ...body,
      slug,
      thumbnail: thumbnailResult,
      images: imagesResults,
      createdBy: adminId,
    });

    return sparePart;
  }

  static async getAllSpareParts(queryObj: any) {
    const searchFields = ['name', 'sku', 'compatibleModels', 'modelNumber'];

    const features = new ApiFeatures(
      SparePart.find().populate('brand').populate('category').populate('product'),
      queryObj
    )
      .filter()
      .search(searchFields)
      .sort()
      .limitFields()
      .paginate();

    const spareParts = await features.query;
    const total = await SparePart.countDocuments({
      ...features.filter().query.getFilter(),
      isDeleted: false,
    });

    return { spareParts, total };
  }

  static async getSparePartByIdOrSlug(idOrSlug: string) {
    const query = Types.ObjectId.isValid(idOrSlug)
      ? { _id: idOrSlug, isDeleted: false }
      : { slug: idOrSlug, isDeleted: false };

    const sparePart = await SparePart.findOne(query)
      .populate('brand')
      .populate('category')
      .populate('product');

    if (!sparePart) {
      throw new AppError('Spare part not found', HttpStatus.NOT_FOUND);
    }

    return sparePart;
  }

  static async updateSparePart(
    idOrSlug: string,
    body: any,
    files?: {
      thumbnail?: Buffer;
      images?: Buffer[];
    }
  ) {
    const query = Types.ObjectId.isValid(idOrSlug)
      ? { _id: idOrSlug, isDeleted: false }
      : { slug: idOrSlug, isDeleted: false };

    const sparePart = await SparePart.findOne(query);
    if (!sparePart) {
      throw new AppError('Spare part not found', HttpStatus.NOT_FOUND);
    }

    // Validate referenced Brand if updated
    if (body.brand) {
      const brand = await Brand.findOne({ _id: body.brand, isDeleted: false });
      if (!brand) throw new AppError('Brand not found', HttpStatus.NOT_FOUND);
      sparePart.brand = brand._id as any;
    }

    // Validate referenced Category if updated
    if (body.category) {
      const category = await Category.findOne({ _id: body.category, isDeleted: false });
      if (!category) throw new AppError('Category not found', HttpStatus.NOT_FOUND);
      sparePart.category = category._id as any;
    }

    // Validate referenced Product if updated
    if (body.product) {
      const product = await Product.findOne({ _id: body.product, isDeleted: false });
      if (!product) throw new AppError('Parent Product model not found', HttpStatus.NOT_FOUND);
      sparePart.product = product._id as any;
    }

    // Name / Slug update
    if (body.name && body.name !== sparePart.name) {
      const slug = slugify(body.name);
      const existing = await SparePart.findOne({ slug, _id: { $ne: sparePart._id } });
      if (existing) {
        throw new AppError('Spare part with this name already exists.', HttpStatus.CONFLICT);
      }
      sparePart.name = body.name;
      sparePart.slug = slug;
    }

    // Sync stock fields
    if (body.stock !== undefined && body.stockQuantity === undefined) {
      body.stockQuantity = Number(body.stock);
    } else if (body.stockQuantity !== undefined && body.stock === undefined) {
      body.stock = Number(body.stockQuantity);
    }

    // Sync compatibility fields
    if (body.compatibleModels !== undefined && body.modelNumber === undefined) {
      body.modelNumber = body.compatibleModels;
    } else if (body.modelNumber !== undefined && body.compatibleModels === undefined) {
      body.compatibleModels = body.modelNumber;
    }

    // List of updateable fields
    const primitiveFields = [
      'sku',
      'description',
      'shortDescription',
      'fullDescription',
      'specifications',
      'compatibleModels',
      'modelNumber',
      'price',
      'discountPrice',
      'stock',
      'stockQuantity',
      'warranty',
      'featured',
      'status',
    ];

    primitiveFields.forEach((field) => {
      if (body[field] !== undefined) {
        (sparePart as any)[field] = body[field];
      }
    });

    // Upload new thumbnail if provided
    if (files?.thumbnail) {
      await deleteFromCloudinary(sparePart.thumbnail.publicId);
      sparePart.thumbnail = await uploadToCloudinary(files.thumbnail, 'spare-parts/thumbnails');
    }

    // Upload new gallery images if provided
    if (files?.images && files.images.length > 0) {
      for (const img of sparePart.images) {
        await deleteFromCloudinary(img.publicId);
      }
      const newImages = [];
      for (const imgBuffer of files.images) {
        const res = await uploadToCloudinary(imgBuffer, 'spare-parts/images');
        newImages.push(res);
      }
      sparePart.images = newImages;
    }

    await sparePart.save();

    // Return populated spare part
    return await SparePart.findById(sparePart._id)
      .populate('brand')
      .populate('category')
      .populate('product');
  }

  static async deleteSparePart(idOrSlug: string) {
    const query = Types.ObjectId.isValid(idOrSlug)
      ? { _id: idOrSlug, isDeleted: false }
      : { slug: idOrSlug, isDeleted: false };

    const sparePart = await SparePart.findOne(query);
    if (!sparePart) {
      throw new AppError('Spare part not found', HttpStatus.NOT_FOUND);
    }

    sparePart.isDeleted = true;
    await sparePart.save();
  }

  static async getSparePartsByProductId(productId: string) {
    const product = await Product.findOne({ _id: productId, isDeleted: false });
    if (!product) throw new AppError('Product not found', HttpStatus.NOT_FOUND);

    const spareParts = await SparePart.find({ product: productId, isDeleted: false })
      .populate('brand')
      .populate('category')
      .populate('product');

    return spareParts;
  }

  static async searchSpareParts(queryObj: any) {
    const searchVal = queryObj.search || '';
    if (!searchVal) {
      return this.getAllSpareParts(queryObj);
    }

    // Find products whose name matches the search string
    const matchingProducts = await Product.find({
      name: { $regex: searchVal, $options: 'i' },
      isDeleted: false,
    }).select('_id');

    const matchingProductIds = matchingProducts.map((p) => p._id);

    // Search conditions for Spare Parts
    const searchConditions = [
      { name: { $regex: searchVal, $options: 'i' } },
      { sku: { $regex: searchVal, $options: 'i' } },
      { product: { $in: matchingProductIds } },
    ];

    // Combine custom search with any other query filters
    const queryObjCopy = { ...queryObj };
    delete queryObjCopy.search; // Remove default search field to prevent ApiFeatures.search collision

    const features = new ApiFeatures(
      SparePart.find({ $or: searchConditions } as any).populate('brand').populate('category').populate('product'),
      queryObjCopy
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const spareParts = await features.query;
    const total = await SparePart.countDocuments({
      ...features.filter().query.getFilter(),
      $or: searchConditions,
      isDeleted: false,
    });

    return { spareParts, total };
  }
}
