import { Document, Schema, model } from 'mongoose';

interface IPdfContent extends Document {
  url: string;
  pageCount: number;
  fileSize?: number;
  fileType?: string;
}

const PdfSchema = new Schema<IPdfContent>({
  url: { type: String, required: true, unique: true, index: true }, 
  pageCount: { type: Number, required: true, min: 1 }, 
  fileSize: { type: Number, min: 0 }, // Ensures fileSize is non-negative
  fileType: { type: String, default: 'pdf' } // Could be extended for other formats
}, { timestamps: true });

export const PdfModel = model<IPdfContent>('Pdf', PdfSchema);
// Indexes for faster lookups