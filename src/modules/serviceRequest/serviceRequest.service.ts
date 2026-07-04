import { ServiceRequest } from './serviceRequest.model';
import { ApiFeatures } from '../../utils/apiFeatures';
import { AppError } from '../../utils/appError';
import { HttpStatus } from '../../constants/httpStatusCodes';

export class ServiceRequestService {
  static async createRequest(body: any) {
    const request = await ServiceRequest.create({
      ...body,
      preferredVisitDate: new Date(body.preferredVisitDate),
    });
    return request;
  }

  static async getAllRequests(queryObj: any) {
    const features = new ApiFeatures(ServiceRequest.find(), queryObj)
      .filter().search(['customerName', 'mobileNumber', 'email', 'brand'])
      .sort().limitFields().paginate();
    const requests = await features.query;
    const total = await ServiceRequest.countDocuments({ isDeleted: false });
    return { requests, total };
  }

  static async updateRequest(id: string, body: { status?: string; engineerRemarks?: string }) {
    const request = await ServiceRequest.findById(id);
    if (!request || request.isDeleted) throw new AppError('Service request not found', HttpStatus.NOT_FOUND);
    if (body.status) request.status = body.status as any;
    if (body.engineerRemarks !== undefined) request.engineerRemarks = body.engineerRemarks;
    await request.save();
    return request;
  }

  static async deleteRequest(id: string) {
    const request = await ServiceRequest.findById(id);
    if (!request || request.isDeleted) throw new AppError('Service request not found', HttpStatus.NOT_FOUND);
    request.isDeleted = true;
    await request.save();
  }
}
