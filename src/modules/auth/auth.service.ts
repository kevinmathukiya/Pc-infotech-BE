import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Admin, RefreshToken } from './auth.model';
import { config } from '../../config/index';
import { AppError } from '../../utils/appError';
import { HttpStatus } from '../../constants/httpStatusCodes';

export class AuthService {
  static generateAccessToken(adminId: string): string {
    return jwt.sign({ sub: adminId }, config.JWT_ACCESS_SECRET, {
      expiresIn: config.JWT_ACCESS_EXPIRY as any,
    });
  }

  static async generateRefreshToken(adminId: string): Promise<string> {
    const rawToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await RefreshToken.create({
      token: rawToken,
      userId: adminId,
      expiresAt,
    });

    return rawToken;
  }

  static async rotateRefreshToken(oldToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenDoc = await RefreshToken.findOne({ token: oldToken });

    if (!tokenDoc) {
      throw new AppError('Invalid refresh token.', HttpStatus.UNAUTHORIZED);
    }

    // Breach detection: If token is already revoked, it suggests someone else has used it!
    // Invalidate ALL tokens in this family (all tokens for this admin) for safety.
    if (tokenDoc.isRevoked) {
      await RefreshToken.updateMany({ userId: tokenDoc.userId }, { isRevoked: true });
      throw new AppError('Compromised session. Please login again.', HttpStatus.FORBIDDEN);
    }

    if (tokenDoc.expiresAt < new Date()) {
      tokenDoc.isRevoked = true;
      await tokenDoc.save();
      throw new AppError('Refresh token expired. Please login again.', HttpStatus.UNAUTHORIZED);
    }

    // Generate new token family member
    const newRawToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({
      token: newRawToken,
      userId: tokenDoc.userId,
      expiresAt,
    });

    // Revoke old token and map replacement
    tokenDoc.isRevoked = true;
    tokenDoc.replacedByToken = newRawToken;
    await tokenDoc.save();

    const accessToken = this.generateAccessToken(tokenDoc.userId.toString());

    return {
      accessToken,
      refreshToken: newRawToken,
    };
  }

  static async logout(token: string): Promise<void> {
    const tokenDoc = await RefreshToken.findOne({ token });
    if (tokenDoc) {
      tokenDoc.isRevoked = true;
      await tokenDoc.save();
    }
  }

  static async forgotPassword(email: string): Promise<string> {
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      throw new AppError('Admin with this email does not exist.', HttpStatus.NOT_FOUND);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    admin.passwordResetToken = hashedResetToken;
    admin.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    await admin.save();

    return resetToken;
  }

  static async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const admin = await Admin.findOne({
      passwordResetToken: hashedResetToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!admin) {
      throw new AppError('Reset token is invalid or has expired.', HttpStatus.BAD_REQUEST);
    }

    admin.password = newPassword;
    admin.passwordResetToken = undefined;
    admin.passwordResetExpires = undefined;
    admin.passwordChangedAt = new Date();
    await admin.save();

    // Revoke all refresh tokens on password reset for security
    await RefreshToken.updateMany({ userId: admin._id }, { isRevoked: true });
  }
}
