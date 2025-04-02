import { Document, Schema, model } from 'mongoose';

interface ISubtitle {
  language: string;
  url: string;
}

interface IVideoPlayback {
  maxQuality: '480p' | '720p' | '1080p' | '4K';
  aspectRatio: string;
}

interface IVideoContent extends Document {
  url: string;
  thumbnail?: string;
  duration: number;
  subtitles: ISubtitle[];
  playbackInfo?: IVideoPlayback;
}

const VideoSchema = new Schema<IVideoContent>({
  url: { type: String, required: true, unique: true, index: true },
  thumbnail: String,
  duration: { type: Number, required: true, min: 1 }, // Prevents invalid durations
  subtitles: [{
    language: { type: String, required: true },
    url: { type: String, required: true }
  }],
  playbackInfo: {
    maxQuality: { type: String, enum: ['480p', '720p', '1080p', '4K'] },
    aspectRatio: { 
      type: String,
      validate: {
        validator: (v: string) => /^\d+:\d+$/.test(v), // Ensures format like "16:9"
        message: 'Invalid aspect ratio format'
      }
    }
  }
}, { timestamps: true });

export const VideoModel = model<IVideoContent>('Video', VideoSchema);
