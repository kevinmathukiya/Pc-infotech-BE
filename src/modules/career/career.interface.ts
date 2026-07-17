import { Document } from 'mongoose';

export interface ICareer extends Document {
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  experienceLevel: string;
  salaryRange?: string;
  description: string;
  requirements: string[];
  benefits?: string[];
  image?: {
    url: string;
    publicId: string;
  };
  status: 'active' | 'inactive';
  isDeleted: boolean;
}
