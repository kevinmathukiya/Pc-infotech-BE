import { Testimonial } from './testimonial.model';
import { ApiFeatures } from '../../utils/apiFeatures';
import { AppError } from '../../utils/appError';
import { HttpStatus } from '../../constants/httpStatusCodes';
import { uploadToCloudinary, deleteFromCloudinary } from '../../helpers/cloudinary';

export class TestimonialService {
  static async getAllTestimonials(queryObj: any) {
    const features = new ApiFeatures(Testimonial.find(), queryObj)
      .filter().sort().limitFields().paginate();
    const testimonials = await features.query;
    const total = await Testimonial.countDocuments({
      ...features.getFilter(),
      isDeleted: false,
    });
    return { testimonials, total };
  }

  static async createTestimonial(body: any, photoBuffer: Buffer) {
    const photoResult = await uploadToCloudinary(photoBuffer, 'testimonials');
    const testimonial = await Testimonial.create({ ...body, photo: photoResult });
    return testimonial;
  }

  static async updateTestimonial(id: string, body: any, photoBuffer?: Buffer) {
    const testimonial = await Testimonial.findById(id);
    if (!testimonial || testimonial.isDeleted) throw new AppError('Testimonial not found', HttpStatus.NOT_FOUND);

    const allowedFields = [
      'customerName',
      'company',
      'rating',
      'review',
      'status',
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        (testimonial as any)[field] = body[field];
      }
    });

    if (photoBuffer) {
      await deleteFromCloudinary(testimonial.photo.publicId);
      testimonial.photo = await uploadToCloudinary(photoBuffer, 'testimonials');
    }

    await testimonial.save();
    return testimonial;
  }

  static async deleteTestimonial(id: string) {
    const testimonial = await Testimonial.findById(id);
    if (!testimonial || testimonial.isDeleted) throw new AppError('Testimonial not found', HttpStatus.NOT_FOUND);
    testimonial.isDeleted = true;
    await testimonial.save();
  }
}
