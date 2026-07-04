import { Brand } from './brand.model';
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

export class BrandService {
  static async getAllBrands(queryObj: any) {
    const features = new ApiFeatures(Brand.find(), queryObj)
      .filter()
      .search(['name', 'description'])
      .sort()
      .limitFields()
      .paginate();

    const brands = await features.query;
    const total = await Brand.countDocuments({
      ...features.filter().query.getFilter(),
      isDeleted: false,
    });

    return { brands, total };
  }

  static async getBrandBySlug(slug: string) {
    const brand = await Brand.findOne({ slug, isDeleted: false });
    if (!brand) {
      throw new AppError('Brand not found', HttpStatus.NOT_FOUND);
    }
    return brand;
  }

  static async createBrand(
    body: { name: string; description: string; status?: 'active' | 'inactive' },
    logoBuffer: Buffer,
    bannerBuffer: Buffer
  ) {
    const slug = slugify(body.name);

    const existing = await Brand.findOne({ slug });
    if (existing) {
      throw new AppError('A brand with this name already exists.', HttpStatus.CONFLICT);
    }

    const logoResult = await uploadToCloudinary(logoBuffer, 'brands/logos');
    const bannerResult = await uploadToCloudinary(bannerBuffer, 'brands/banners');

    const brand = await Brand.create({
      ...body,
      slug,
      logo: logoResult,
      banner: bannerResult,
    });

    return brand;
  }

  static async updateBrand(
    id: string,
    body: { name?: string; description?: string; status?: 'active' | 'inactive' },
    logoBuffer?: Buffer,
    bannerBuffer?: Buffer
  ) {
    const brand = await Brand.findById(id);
    if (!brand || brand.isDeleted) {
      throw new AppError('Brand not found', HttpStatus.NOT_FOUND);
    }

    if (body.name && body.name !== brand.name) {
      const slug = slugify(body.name);
      const existing = await Brand.findOne({ slug, _id: { $ne: id } });
      if (existing) {
        throw new AppError('A brand with this name already exists.', HttpStatus.CONFLICT);
      }
      brand.name = body.name;
      brand.slug = slug;
    }

    if (body.description) brand.description = body.description;
    if (body.status) brand.status = body.status;

    if (logoBuffer) {
      await deleteFromCloudinary(brand.logo.publicId);
      brand.logo = await uploadToCloudinary(logoBuffer, 'brands/logos');
    }

    if (bannerBuffer) {
      await deleteFromCloudinary(brand.banner.publicId);
      brand.banner = await uploadToCloudinary(bannerBuffer, 'brands/banners');
    }

    await brand.save();
    return brand;
  }

  static async deleteBrand(id: string) {
    const brand = await Brand.findById(id);
    if (!brand || brand.isDeleted) {
      throw new AppError('Brand not found', HttpStatus.NOT_FOUND);
    }

    brand.isDeleted = true;
    await brand.save();
  }
}
