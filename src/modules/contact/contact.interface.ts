import { Document } from 'mongoose';
export interface IContact extends Document {
  name: string;
  mobile: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  isDeleted: boolean;
}
