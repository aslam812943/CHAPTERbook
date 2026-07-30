import { Schema, model, Document, Types } from "mongoose";
import { OrderStatus, PaymentStatus } from "../../../domain/entities/Order";
import { AddressSubdocument } from "./User.model";

export interface OrderItemSubdocument {
  bookId: Types.ObjectId;
  title: string;
  price: number;
  quantity: number;
}

export interface OrderDocument extends Document<Types.ObjectId> {
  orderRef: string;
  userId: Types.ObjectId;
  items: OrderItemSubdocument[];
  totalAmount: number;
  deliveryAddressSnapshot: AddressSubdocument;
  status: OrderStatus;
  whatsappMessage: string;
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<OrderItemSubdocument>(
  {
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const addressSnapshotSchema = new Schema<AddressSubdocument>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String },
    country: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema<OrderDocument>(
  {
    orderRef: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    deliveryAddressSnapshot: { type: addressSnapshotSchema, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    whatsappMessage: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed"],
      default: "unpaid",
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
  },
  { timestamps: true }
);

export const OrderModel = model<OrderDocument>("Order", orderSchema);
