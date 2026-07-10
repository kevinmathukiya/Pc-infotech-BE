import { Document, Types } from 'mongoose';

export interface IAdmin extends Document {
  name: string;
  email: string;
  age?: number;
  mobileNumber?: string;
  password?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  passwordChangedAt?: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

export interface IRefreshToken extends Document {
  token: string;
  userId: Types.ObjectId;
  expiresAt: Date;
  isRevoked: boolean;
  replacedByToken?: string;
}
