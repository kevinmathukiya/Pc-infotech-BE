import { Branch } from './branch.model';
import { ApiFeatures } from '../../utils/apiFeatures';
import { AppError } from '../../utils/appError';
import { HttpStatus } from '../../constants/httpStatusCodes';
import { geocodeAddress } from '../../helpers/geocoding';

export class BranchService {
  static async getAllBranches(queryObj: any) {
    const features = new ApiFeatures(Branch.find(), queryObj)
      .filter()
      .search(['name', 'city', 'state', 'region', 'branchType'])
      .sort()
      .limitFields()
      .paginate();
    const branches = await features.query;
    const total = await Branch.countDocuments({
      ...features.getFilter(),
      isDeleted: false,
    });
    return { branches, total };
  }

  static async createBranch(body: any) {
    const { latitude, longitude } = await geocodeAddress(
      body.address,
      body.city,
      body.state,
      body.pincode
    );

    const branch = await Branch.create({
      ...body,
      latitude,
      longitude,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude], // [longitude, latitude] for GeoJSON
      },
    });
    return branch;
  }

  static async updateBranch(id: string, body: any) {
    const branch = await Branch.findById(id);
    if (!branch || branch.isDeleted) throw new AppError('Branch not found', HttpStatus.NOT_FOUND);

    const addressChanged =
      (body.address && body.address !== branch.address) ||
      (body.city && body.city !== branch.city) ||
      (body.state && body.state !== branch.state) ||
      (body.pincode && body.pincode !== branch.pincode);

    if (addressChanged) {
      const { latitude, longitude } = await geocodeAddress(
        body.address || branch.address,
        body.city || branch.city,
        body.state || branch.state,
        body.pincode || branch.pincode
      );
      body.latitude = latitude;
      body.longitude = longitude;
      body.location = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };
    }

    const allowedFields = [
      'name',
      'branchType',
      'address',
      'city',
      'state',
      'pincode',
      'region',
      'phoneNumber',
      'email',
      'googleMapUrl',
      'workingHours',
      'supportScope',
      'status',
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        (branch as any)[field] = body[field];
      }
    });

    if (body.latitude !== undefined) branch.latitude = body.latitude;
    if (body.longitude !== undefined) branch.longitude = body.longitude;
    if (body.location !== undefined) branch.location = body.location;

    await branch.save();
    return branch;
  }

  static async deleteBranch(id: string) {
    const branch = await Branch.findById(id);
    if (!branch || branch.isDeleted) throw new AppError('Branch not found', HttpStatus.NOT_FOUND);
    branch.isDeleted = true;
    await branch.save();
  }
}
