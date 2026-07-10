import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import { IUser } from './user.interface';

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    mobileNumber: { type: String, required: true, trim: true },
    password: { type: String, required: true, select: false },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    passwordChangedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  const doc = this as any;
  if (!doc.isModified('password')) return;
  const bcryptHash = await bcrypt.hash(doc.password, 12);
  doc.password = bcryptHash;
});

// Compare password helper
userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, (this as any).password);
};

export const User = model<IUser>('User', userSchema);
