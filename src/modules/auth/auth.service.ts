import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Admin, RefreshToken } from './auth.model';
import { User } from '../user/user.model';
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
    let account: any = await Admin.findOne({ email: email.toLowerCase() });
    let accountType: 'admin' | 'user' = 'admin';

    if (!account) {
      account = await User.findOne({ email: email.toLowerCase(), status: 'active' });
      accountType = 'user';
    }

    if (!account) {
      throw new AppError('Account with this email does not exist.', HttpStatus.NOT_FOUND);
    }

    // Generate a 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    account.passwordResetToken = hashedOtp;
    account.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    await account.save();

    // Send OTP email
    const { sendEmail } = await import('../../helpers/email');
    const emailSubject = 'PC INFOTECH - Password Reset OTP';
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #ff5e5b; text-align: center;">Password Reset Request</h2>
        <p>Hello ${account.name},</p>
        <p>We received a request to reset your PC INFOTECH account password.</p>
        <p>Please use the following 6-digit verification code to complete the reset process. This code is valid for <strong>10 minutes</strong>:</p>
        <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <span style="font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #0f172a;">${otp}</span>
        </div>
        <p style="font-size: 12px; color: #64748b; margin-top: 30px;">If you did not request a password reset, please ignore this email or contact support if you suspect unauthorized access.</p>
      </div>
    `;
    await sendEmail(account.email, emailSubject, emailHtml);

    return otp;
  }

  static async verifyOtp(email: string, otp: string): Promise<string> {
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    let account: any = await Admin.findOne({
      email: email.toLowerCase(),
      passwordResetToken: hashedOtp,
      passwordResetExpires: { $gt: new Date() },
    });
    let accountType: 'admin' | 'user' = 'admin';

    if (!account) {
      account = await User.findOne({
        email: email.toLowerCase(),
        passwordResetToken: hashedOtp,
        passwordResetExpires: { $gt: new Date() },
      });
      accountType = 'user';
    }

    if (!account) {
      throw new AppError('The verification code is invalid or has expired.', HttpStatus.BAD_REQUEST);
    }

    // Generate a short-lived reset token (JWT) valid for 5 minutes, containing role
    const resetToken = jwt.sign(
      { sub: account._id.toString(), email: account.email, role: accountType, reset: true },
      config.JWT_ACCESS_SECRET,
      { expiresIn: '5m' }
    );

    return resetToken;
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    let decoded: any;
    try {
      decoded = jwt.verify(token, config.JWT_ACCESS_SECRET);
    } catch (err) {
      throw new AppError('Reset token is invalid or has expired.', HttpStatus.BAD_REQUEST);
    }

    if (!decoded.reset || !decoded.sub || !decoded.role) {
      throw new AppError('Invalid reset token claims.', HttpStatus.BAD_REQUEST);
    }

    let account: any;
    if (decoded.role === 'admin') {
      account = await Admin.findById(decoded.sub);
    } else if (decoded.role === 'user') {
      account = await User.findById(decoded.sub);
    }

    if (!account) {
      throw new AppError('Account not found.', HttpStatus.NOT_FOUND);
    }

    account.password = newPassword;
    account.passwordResetToken = undefined;
    account.passwordResetExpires = undefined;
    account.passwordChangedAt = new Date();
    await account.save();

    // Revoke all refresh tokens on password reset for security
    if (decoded.role === 'admin') {
      await RefreshToken.updateMany({ userId: account._id }, { isRevoked: true });
    }
  }
}
