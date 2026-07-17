import { Service } from './service.model';
import { ApiFeatures } from '../../utils/apiFeatures';
import { AppError } from '../../utils/appError';
import { HttpStatus } from '../../constants/httpStatusCodes';
import { uploadToCloudinary, deleteFromCloudinary } from '../../helpers/cloudinary';
import { slugify } from '../../utils/slugify';

export class ServiceService {
  static async getAllServices(queryObj: any) {
    const features = new ApiFeatures(Service.find(), queryObj)
      .filter().search(['name', 'serviceCategory', 'shortDescription'])
      .sort().limitFields().paginate();

    const services = await features.query;
    const total = await Service.countDocuments({
      ...features.getFilter(),
      isDeleted: false,
    });
    return { services, total };
  }

  static async getServiceBySlug(slug: string) {
    const service = await Service.findOne({ slug, isDeleted: false });
    if (!service) throw new AppError('Service not found', HttpStatus.NOT_FOUND);
    return service;
  }

  static async createService(
    body: any,
    imageBuffer: Buffer,
    galleryBuffers: Buffer[]
  ) {
    const slug = slugify(body.name);
    const existing = await Service.findOne({ slug });
    if (existing) throw new AppError('Service with this name already exists.', HttpStatus.CONFLICT);

    const imageResult = await uploadToCloudinary(imageBuffer, 'services/images');
    const galleryResults = [];
    for (const buf of galleryBuffers) {
      galleryResults.push(await uploadToCloudinary(buf, 'services/gallery'));
    }

    const service = await Service.create({
      ...body,
      slug,
      image: imageResult,
      gallery: galleryResults,
    });
    return service;
  }

  static async updateService(id: string, body: any, imageBuffer?: Buffer, galleryBuffers?: Buffer[]) {
    const service = await Service.findById(id);
    if (!service || service.isDeleted) throw new AppError('Service not found', HttpStatus.NOT_FOUND);

    if (body.name && body.name !== service.name) {
      const slug = slugify(body.name);
      const existing = await Service.findOne({ slug, _id: { $ne: id } });
      if (existing) throw new AppError('Service with this name already exists.', HttpStatus.CONFLICT);
      service.name = body.name;
      service.slug = slug;
    }

    const fields = ['brand', 'serviceCategory', 'shortDescription', 'fullDescription',
      'benefits', 'features', 'faq', 'status', 'metaTitle', 'metaDescription'];
    fields.forEach((f) => { if (body[f] !== undefined) (service as any)[f] = body[f]; });

    if (imageBuffer) {
      await deleteFromCloudinary(service.image.publicId);
      service.image = await uploadToCloudinary(imageBuffer, 'services/images');
    }

    if (galleryBuffers && galleryBuffers.length > 0) {
      for (const img of service.gallery) await deleteFromCloudinary(img.publicId);
      service.gallery = [];
      for (const buf of galleryBuffers) {
        service.gallery.push(await uploadToCloudinary(buf, 'services/gallery'));
      }
    }

    await service.save();
    return service;
  }

  static async deleteService(id: string) {
    const service = await Service.findById(id);
    if (!service || service.isDeleted) throw new AppError('Service not found', HttpStatus.NOT_FOUND);
    service.isDeleted = true;
    await service.save();
  }
}
