import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import { IAdmin, IRefreshToken } from './auth.interface';

const adminSchema = new Schema<IAdmin>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    age: { type: Number },
    mobileNumber: { type: String },
    password: { type: String, required: true, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    passwordChangedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
adminSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const bcryptHash = await bcrypt.hash((this as any).password, 12);
  (this as any).password = bcryptHash;
});

// Compare password helper
adminSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, (this as any).password);
};

export const Admin = model<IAdmin>('Admin', adminSchema);

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    token: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'Admin', required: true, index: true },
    expiresAt: { type: Date, required: true },
    isRevoked: { type: Boolean, default: false },
    replacedByToken: { type: String },
  },
  {
    timestamps: true,
  }
);

export const RefreshToken = model<IRefreshToken>('RefreshToken', refreshTokenSchema);
