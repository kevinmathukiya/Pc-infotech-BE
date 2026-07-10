import { Request, Response, NextFunction } from 'express';
import { ContactService } from './contact.service';
import { ApiResponse } from '../../utils/apiResponse';
import { HttpStatus } from '../../constants/httpStatusCodes';
import { getParam } from '../../utils/getParam';

export class ContactController {
  static async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const contact = await ContactService.submit(req.body);
      return ApiResponse.success(res, 'Inquiry submitted successfully', { contact }, HttpStatus.CREATED);
    } catch (error) { next(error); }
  }

  static async getAllContacts(req: Request, res: Response, next: NextFunction) {
    try {
      const { contacts, total } = await ContactService.getAllContacts(req.query);
      return ApiResponse.success(res, 'Inquiries retrieved', { contacts, total });
    } catch (error) { next(error); }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const contact = await ContactService.markAsRead(getParam(req.params.id));
      return ApiResponse.success(res, 'Marked as read', { contact });
    } catch (error) { next(error); }
  }

  static async deleteContact(req: Request, res: Response, next: NextFunction) {
    try {
      await ContactService.deleteContact(getParam(req.params.id));
      return ApiResponse.success(res, 'Inquiry deleted');
    } catch (error) { next(error); }
  }
}
