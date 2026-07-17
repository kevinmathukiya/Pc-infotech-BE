import { JobApplication } from './jobApplication.model';
import { uploadToCloudinary, deleteFromCloudinary } from '../../helpers/cloudinary';
import { ApiFeatures } from '../../utils/apiFeatures';
import { AppError } from '../../utils/appError';
import { HttpStatus } from '../../constants/httpStatusCodes';

export class JobApplicationService {
  static async getAllApplications(queryObj: any) {
    const filterQueryObj = { ...queryObj, isDeleted: false };
    const features = new ApiFeatures(JobApplication.find().populate('career', 'title department location'), filterQueryObj)
      .filter().sort().limitFields().paginate();

    const applications = await features.query;
    const total = await JobApplication.countDocuments({
      ...features.getFilter(),
      isDeleted: false,
    });

    return { applications, total };
  }

  static async getApplicationById(id: string) {
    const application = await JobApplication.findById(id).populate('career', 'title department location');
    if (!application || application.isDeleted) {
      throw new AppError('Job application not found', HttpStatus.NOT_FOUND);
    }
    return application;
  }

  static async createApplication(body: any, file?: Express.Multer.File) {
    if (!file) {
      throw new AppError('Resume file is required', HttpStatus.BAD_REQUEST);
    }

    // Upload file to Cloudinary as raw resource type
    const uploadResult = await uploadToCloudinary(file.buffer, 'resumes', 'raw');

    const application = await JobApplication.create({
      ...body,
      resume: {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
      },
      status: 'pending',
      isDeleted: false,
    });

    return application;
  }

  static async updateApplicationStatus(id: string, status: 'pending' | 'reviewed' | 'accepted' | 'rejected') {
    const application = await JobApplication.findById(id);
    if (!application || application.isDeleted) {
      throw new AppError('Job application not found', HttpStatus.NOT_FOUND);
    }

    application.status = status;
    await application.save();
    return application;
  }

  // New method to count pending job applications
  static async getPendingCount() {
    const count = await JobApplication.countDocuments({ status: 'pending', isDeleted: false });
    return { total: count };
  }
  static async deleteApplication(id: string) {
    const application = await JobApplication.findById(id);
    if (!application || application.isDeleted) {
      throw new AppError('Job application not found', HttpStatus.NOT_FOUND);
    }

    // Delete resume from Cloudinary
    if (application.resume?.publicId) {
      await deleteFromCloudinary(application.resume.publicId, 'raw');
    }

    application.isDeleted = true;
    await application.save();
    return application;
  }
}
