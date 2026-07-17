import { Feedback } from './feedback.model';
import { ApiFeatures } from '../../utils/apiFeatures';
import { AppError } from '../../utils/appError';
import { HttpStatus } from '../../constants/httpStatusCodes';

export class FeedbackService {
  static async getAllFeedbacks(queryObj: any) {
    // Only approved and non-deleted feedbacks for public
    const filterQueryObj = { ...queryObj, status: 'approved', isDeleted: false };
    const features = new ApiFeatures(Feedback.find().populate('user', 'name email'), filterQueryObj)
      .filter().sort().limitFields().paginate();
    const feedbacks = await features.query;
    const total = await Feedback.countDocuments({
      status: 'approved',
      isDeleted: false,
    });
    return { feedbacks, total };
  }

  static async getFeedbacksForAdmin(queryObj: any) {
    // Non-deleted feedbacks for admin
    const filterQueryObj = { ...queryObj, isDeleted: false };
    const features = new ApiFeatures(Feedback.find().populate('user', 'name email'), filterQueryObj)
      .filter().sort().limitFields().paginate();
    const feedbacks = await features.query;
    const total = await Feedback.countDocuments({
      ...features.getFilter(),
      isDeleted: false,
    });
    return { feedbacks, total };
  }

  static async createFeedback(body: any, userId?: string) {
    const feedback = await Feedback.create({
      ...body,
      user: userId || undefined,
      status: 'pending', // Starts as pending until approved by admin
    });
    return feedback;
  }

  static async updateFeedbackStatus(id: string, status: 'pending' | 'approved' | 'rejected') {
    const feedback = await Feedback.findById(id);
    if (!feedback || feedback.isDeleted) {
      throw new AppError('Feedback not found', HttpStatus.NOT_FOUND);
    }
    feedback.status = status;
    await feedback.save();
    return feedback;
  }

  static async deleteFeedback(id: string) {
    const feedback = await Feedback.findById(id);
    if (!feedback || feedback.isDeleted) {
      throw new AppError('Feedback not found', HttpStatus.NOT_FOUND);
    }
    feedback.isDeleted = true;
    await feedback.save();
    return feedback;
  }
}
