import { Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  mobileNumber: string;
  password?: string;
  status: 'active' | 'inactive';
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  passwordChangedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword(candidate: string): Promise<boolean>;
}
