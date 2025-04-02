import { Document, Schema, model } from 'mongoose';

// 1. Type Definitions
export enum PaymentProvider {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  RAZORPAY = 'razorpay'
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum PaymentType {
  ONE_TIME = 'one_time',
  SUBSCRIPTION = 'subscription'
}

interface IPaymentItem {
  courseId: Schema.Types.ObjectId;
  amount: number;
  currency: string;
}

interface IRefund {
  amount: number;
  reason?: string;
  processedAt: Date;
}

// 2. Main Interface
export interface IPayment extends Document {
  userId: Schema.Types.ObjectId;
  items: IPaymentItem[];
  totalAmount: number;
  currency: string;
  provider: PaymentProvider;
  paymentIntentId: string;
  status: PaymentStatus;
  type: PaymentType;
  refunds?: IRefund[];
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

// 3. Schema Definition
const PaymentSchema = new Schema<IPayment>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  items: [{
    courseId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Course', 
      required: true 
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { 
      type: String, 
      default: 'USD',
      uppercase: true // Ensures consistent currency format
    }
  }],
  totalAmount: { type: Number, required: true, min: 0 },
  currency: { 
    type: String, 
    default: 'USD',
    uppercase: true 
  },
  provider: { 
    type: String, 
    enum: Object.values(PaymentProvider), 
    required: true 
  },
  paymentIntentId: { type: String, required: true, unique: true, index: true },
  status: { 
    type: String, 
    enum: Object.values(PaymentStatus), 
    default: PaymentStatus.PENDING 
  },
  type: { 
    type: String, 
    enum: Object.values(PaymentType), 
    required: true 
  },
  refunds: [{
    amount: { type: Number, required: true, min: 0 },
    reason: String,
    processedAt: { type: Date, default: Date.now }
  }],
  metadata: Schema.Types.Mixed,
  expiresAt: { type: Date, index: { sparse: true } } // Only indexed if present
}, { timestamps: true });

// 4. Indexes
PaymentSchema.index({ userId: 1, createdAt: -1 }); // Speeds up user payment history queries
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ 'items.courseId': 1 });

// 5. Model Export
export const PaymentModel = model<IPayment>('Payment', PaymentSchema);
