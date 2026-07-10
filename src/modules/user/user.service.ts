import jwt from 'jsonwebtoken';
import { User } from './user.model';
import { config } from '../../config/index';
import { AppError } from '../../utils/appError';
import { HttpStatus } from '../../constants/httpStatusCodes';

export class UserService {
  static generateAccessToken(userId: string): string {
    // Generate JWT access token with role user
    return jwt.sign({ sub: userId, role: 'user' }, config.JWT_ACCESS_SECRET, {
      expiresIn: '30d', // Client users get longer-lived tokens (e.g. 30 days) for convenience
    });
  }

  static async signup(userData: { name: string; email: string; mobileNumber: string; password: string }) {
    const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
    if (existingUser) {
      throw new AppError('An account with this email address already exists.', HttpStatus.BAD_REQUEST);
    }

    const user = await User.create(userData);

    const userObj = user.toObject();
    delete userObj.password;

    const accessToken = this.generateAccessToken(user._id.toString());

    return { user: userObj, accessToken };
  }

  static async login(credentials: { email: string; password: string }) {
    const user = await User.findOne({ email: credentials.email.toLowerCase(), status: 'active' }).select('+password');
    if (!user || !(await user.comparePassword(credentials.password))) {
      throw new AppError('Invalid email or password.', HttpStatus.UNAUTHORIZED);
    }

    const userObj = user.toObject();
    delete userObj.password;

    const accessToken = this.generateAccessToken(user._id.toString());

    return { user: userObj, accessToken };
  }

  static async getUserById(userId: string) {
    const user = await User.findById(userId);
    if (!user || user.status !== 'active') {
      throw new AppError('User account not found or deactivated.', HttpStatus.NOT_FOUND);
    }
    return user;
  }
}
