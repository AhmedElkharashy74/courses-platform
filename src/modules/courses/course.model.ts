import { Document, Schema, model } from 'mongoose';
import slugify from 'slugify';

interface ICourse extends Document {
  title: string;
  slug: string;
  description: string;
  instructorId: Schema.Types.ObjectId;
  price: number;
  discountPrice?: number;
  currency: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  thumbnail?: string;
  isPublished: boolean;
  publishedAt?: Date;
  categories: string[];
  publish: () => Promise<ICourse>;
}

const CourseSchema = new Schema<ICourse>({
  title: { type: String, required: true, text: true },
  slug: { type: String, unique: true },
  description: { type: String, text: true },
  instructorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  price: { type: Number, min: 0, default: 0 },
  discountPrice: { 
    type: Number, 
    min: 0,
    validate: {
      validator: function(this: ICourse, value: number) {
        return value <= this.price;
      },
      message: 'Discount price must be less than or equal to the original price.'
    }
  },
  currency: { type: String, default: 'USD' },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  thumbnail: String,
  isPublished: { type: Boolean, default: false, index: true },
  publishedAt: Date,
  categories: [{ type: String, index: true }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Auto-generate slug before saving
CourseSchema.pre<ICourse>('save', function (next) {
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});


// Virtual fields
CourseSchema.virtual('formattedPrice').get(function () {
  return `${this.currency} ${this.price.toFixed(2)}`;
});

CourseSchema.virtual('isFree').get(function () {
  return this.price === 0;
});

// Indexes for optimized queries
CourseSchema.index({ title: 'text', description: 'text' });
CourseSchema.index({ slug: 1 }, { unique: true });
CourseSchema.index({ instructorId: 1 });
CourseSchema.index({ isPublished: 1 });
CourseSchema.index({ categories: 1 });

export const CourseModel = model<ICourse>('Course', CourseSchema);
