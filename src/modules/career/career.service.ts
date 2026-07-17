import { Career } from './career.model';
import { ApiFeatures } from '../../utils/apiFeatures';
import { AppError } from '../../utils/appError';
import { HttpStatus } from '../../constants/httpStatusCodes';

export class CareerService {
  static async getAllCareers(queryObj: any, forAdmin = false) {
    const filterQueryObj = { ...queryObj, isDeleted: false };
    if (!forAdmin) {
      filterQueryObj.status = 'active';
    }

    const features = new ApiFeatures(Career.find(), filterQueryObj)
      .filter().sort().limitFields().paginate();

    const careers = await features.query;
    
    // Build counts
    const countQuery = forAdmin ? { isDeleted: false } : { status: 'active', isDeleted: false };
    const total = await Career.countDocuments({
      ...features.getFilter(),
      ...countQuery,
    } as any);

    return { careers, total };
  }

  static async getCareerById(id: string) {
    const career = await Career.findById(id);
    if (!career || career.isDeleted) {
      throw new AppError('Career posting not found', HttpStatus.NOT_FOUND);
    }
    return career;
  }

  static async createCareer(body: any, imageBuffer?: Buffer) {
    let imageResult;
    if (imageBuffer) {
      const { uploadToCloudinary } = await import('../../helpers/cloudinary');
      imageResult = await uploadToCloudinary(imageBuffer, 'careers/images');
    }

    const career = await Career.create({
      ...body,
      image: imageResult,
      isDeleted: false,
    });
    return career;
  }

  static async updateCareer(id: string, body: any, imageBuffer?: Buffer) {
    const career = await Career.findById(id);
    if (!career || career.isDeleted) {
      throw new AppError('Career posting not found', HttpStatus.NOT_FOUND);
    }

    if (imageBuffer) {
      const { uploadToCloudinary, deleteFromCloudinary } = await import('../../helpers/cloudinary');
      if (career.image?.publicId) {
        await deleteFromCloudinary(career.image.publicId);
      }
      career.image = await uploadToCloudinary(imageBuffer, 'careers/images');
    }

    const updateData = { ...body };
    delete updateData.image;

    Object.assign(career, updateData);
    await career.save();
    return career;
  }

  static async deleteCareer(id: string) {
    const career = await Career.findById(id);
    if (!career || career.isDeleted) {
      throw new AppError('Career posting not found', HttpStatus.NOT_FOUND);
    }

    career.isDeleted = true;
    await career.save();
    return career;
  }
}
