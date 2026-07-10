import { Cms } from './cms.model';
import { uploadToCloudinary, deleteFromCloudinary } from '../../helpers/cloudinary';

export class CmsService {
  static async getCms() {
    let cms = await Cms.findOne().populate('featuredProducts');
    if (!cms) {
      // Auto-initialize on first access
      cms = await Cms.create({});
    }
    return cms;
  }

  static async updateCms(body: any) {
    let cms = await Cms.findOne();
    if (!cms) cms = await Cms.create({});

    const fields = ['whyChooseUs', 'featuredProducts', 'brandSectionTitle', 'servicesSectionTitle', 'testimonialsSectionTitle'];
    fields.forEach((f) => { if (body[f] !== undefined) (cms as any)[f] = body[f]; });

    await cms.save();
    return cms;
  }

  static async addHeroSlide(body: { title: string; subtitle?: string; link?: string; order?: number }, imageBuffer: Buffer) {
    const cms = await CmsService.getCms();
    const imageResult = await uploadToCloudinary(imageBuffer, 'cms/hero');
    cms.heroSlider.push({
      title: body.title,
      subtitle: body.subtitle,
      image: imageResult,
      link: body.link,
      order: body.order ?? cms.heroSlider.length,
    });
    await cms.save();
    return cms;
  }

  static async removeHeroSlide(slideId: string) {
    const cms = await CmsService.getCms();
    const slide = cms.heroSlider.find((s: any) => s._id.toString() === slideId);
    if (slide) {
      await deleteFromCloudinary(slide.image.publicId);
      cms.heroSlider = cms.heroSlider.filter((s: any) => s._id.toString() !== slideId);
      await cms.save();
    }
    return cms;
  }
}
