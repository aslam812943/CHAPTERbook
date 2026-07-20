import { Schema, model, Document, Types } from "mongoose";

export interface CartItemSubdocument {
  bookId: Types.ObjectId;
  quantity: number;
}

export interface CartDocument extends Document<Types.ObjectId> {
  userId: Types.ObjectId;
  items: CartItemSubdocument[];
  updatedAt: Date;
}

const cartItemSchema = new Schema<CartItemSubdocument>(
  {
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const cartSchema = new Schema<CartDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true }
);

export const CartModel = model<CartDocument>("Cart", cartSchema);
