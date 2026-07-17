import { Blog } from './blog.model';
import { ApiFeatures } from '../../utils/apiFeatures';
import { AppError } from '../../utils/appError';
import { HttpStatus } from '../../constants/httpStatusCodes';
import { uploadToCloudinary, deleteFromCloudinary } from '../../helpers/cloudinary';
import { slugify } from '../../utils/slugify';

export class BlogService {
  static async getAllBlogs(queryObj: any, adminView = false) {
    const baseFilter: any = { isDeleted: false };
    if (!adminView) baseFilter.status = 'published';

    const features = new ApiFeatures(Blog.find(baseFilter), queryObj)
      .search(['title', 'tags']).sort().limitFields().paginate();
    const blogs = await features.query;
    const total = await Blog.countDocuments({
      ...features.getFilter(),
      ...baseFilter,
    });
    return { blogs, total };
  }

  static async getBlogBySlug(slug: string) {
    const blog = await Blog.findOne({ slug, isDeleted: false, status: 'published' });
    if (!blog) throw new AppError('Blog post not found', HttpStatus.NOT_FOUND);
    return blog;
  }

  static async createBlog(body: any, imageBuffer: Buffer) {
    const slug = slugify(body.title);
    const existing = await Blog.findOne({ slug });
    if (existing) throw new AppError('A blog with this title already exists.', HttpStatus.CONFLICT);

    const imageResult = await uploadToCloudinary(imageBuffer, 'blogs/images');
    const blog = await Blog.create({
      ...body,
      slug,
      featuredImage: imageResult,
      publishedDate: body.publishedDate ? new Date(body.publishedDate) : new Date(),
    });
    return blog;
  }

  static async updateBlog(id: string, body: any, imageBuffer?: Buffer) {
    const blog = await Blog.findById(id);
    if (!blog || blog.isDeleted) throw new AppError('Blog not found', HttpStatus.NOT_FOUND);

    if (body.title && body.title !== blog.title) {
      const slug = slugify(body.title);
      const existing = await Blog.findOne({ slug, _id: { $ne: id } });
      if (existing) throw new AppError('A blog with this title already exists.', HttpStatus.CONFLICT);
      blog.title = body.title;
      blog.slug = slug;
    }

    const fields = ['description', 'tags', 'seo', 'status', 'publishedDate'];
    fields.forEach((f) => { if (body[f] !== undefined) (blog as any)[f] = body[f]; });

    if (imageBuffer) {
      await deleteFromCloudinary(blog.featuredImage.publicId);
      blog.featuredImage = await uploadToCloudinary(imageBuffer, 'blogs/images');
    }

    await blog.save();
    return blog;
  }

  static async deleteBlog(id: string) {
    const blog = await Blog.findById(id);
    if (!blog || blog.isDeleted) throw new AppError('Blog not found', HttpStatus.NOT_FOUND);
    blog.isDeleted = true;
    await blog.save();
  }
}
