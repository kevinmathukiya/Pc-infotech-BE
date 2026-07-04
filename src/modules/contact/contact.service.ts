import { Contact } from './contact.model';
import { ApiFeatures } from '../../utils/apiFeatures';
import { AppError } from '../../utils/appError';
import { HttpStatus } from '../../constants/httpStatusCodes';

export class ContactService {
  static async submit(body: any) {
    const contact = await Contact.create(body);
    return contact;
  }

  static async getAllContacts(queryObj: any) {
    const features = new ApiFeatures(Contact.find(), queryObj)
      .filter().search(['name', 'email', 'subject']).sort().limitFields().paginate();
    const contacts = await features.query;
    const total = await Contact.countDocuments({ isDeleted: false });
    return { contacts, total };
  }

  static async markAsRead(id: string) {
    const contact = await Contact.findById(id);
    if (!contact || contact.isDeleted) throw new AppError('Inquiry not found', HttpStatus.NOT_FOUND);
    contact.isRead = true;
    await contact.save();
    return contact;
  }

  static async deleteContact(id: string) {
    const contact = await Contact.findById(id);
    if (!contact || contact.isDeleted) throw new AppError('Inquiry not found', HttpStatus.NOT_FOUND);
    contact.isDeleted = true;
    await contact.save();
  }
}
