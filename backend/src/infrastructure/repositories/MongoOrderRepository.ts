import { IOrderRepository } from "../../domain/repositories/IOrderRepository";
import { CreateOrderInput, Order, OrderStatus, PaginatedResult, Pagination } from "../../domain/entities/Order";
import { OrderDocument, OrderItemSubdocument, OrderModel } from "../database/models/Order.model";

function toDomain(doc: OrderDocument): Order {
  return {
    id: doc._id.toString(),
    orderRef: doc.orderRef,
    userId: doc.userId.toString(),
    items: doc.items.map((item: OrderItemSubdocument) => ({
      bookId: item.bookId.toString(),
      title: item.title,
      price: item.price,
      quantity: item.quantity,
    })),
    totalAmount: doc.totalAmount,
    deliveryAddressSnapshot: {
      fullName: doc.deliveryAddressSnapshot.fullName,
      phone: doc.deliveryAddressSnapshot.phone,
      addressLine: doc.deliveryAddressSnapshot.addressLine,
      city: doc.deliveryAddressSnapshot.city,
      postalCode: doc.deliveryAddressSnapshot.postalCode,
      country: doc.deliveryAddressSnapshot.country,
    },
    status: doc.status,
    whatsappMessage: doc.whatsappMessage,
    paymentStatus: doc.paymentStatus,
    razorpayOrderId: doc.razorpayOrderId,
    razorpayPaymentId: doc.razorpayPaymentId,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class MongoOrderRepository implements IOrderRepository {
  async create(input: CreateOrderInput): Promise<Order> {
    const doc = await OrderModel.create(input);
    return toDomain(doc);
  }

  async findById(id: string): Promise<Order | null> {
    const doc = await OrderModel.findById(id);
    return doc ? toDomain(doc) : null;
  }

  async findByUserId(userId: string): Promise<Order[]> {
    const docs = await OrderModel.find({ userId }).sort({ createdAt: -1 });
    return docs.map(toDomain);
  }

  async findRecentByUserAndTotal(userId: string, totalAmount: number, withinMs: number): Promise<Order | null> {
    const since = new Date(Date.now() - withinMs);
    const doc = await OrderModel.findOne({
      userId,
      totalAmount,
      createdAt: { $gte: since },
    }).sort({ createdAt: -1 });
    return doc ? toDomain(doc) : null;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const doc = await OrderModel.findByIdAndUpdate(id, { status }, { new: true });
    return doc ? toDomain(doc) : null;
  }

  async setRazorpayOrderId(id: string, razorpayOrderId: string): Promise<Order | null> {
    const doc = await OrderModel.findByIdAndUpdate(id, { razorpayOrderId }, { new: true });
    return doc ? toDomain(doc) : null;
  }

  async findByRazorpayOrderId(razorpayOrderId: string): Promise<Order | null> {
    const doc = await OrderModel.findOne({ razorpayOrderId });
    return doc ? toDomain(doc) : null;
  }

  async markPaid(id: string, razorpayPaymentId: string): Promise<Order | null> {
    const doc = await OrderModel.findByIdAndUpdate(
      id,
      { paymentStatus: "paid", razorpayPaymentId },
      { new: true }
    );
    return doc ? toDomain(doc) : null;
  }

  async findAll(pagination: Pagination): Promise<PaginatedResult<Order>> {
    const skip = (pagination.page - 1) * pagination.limit;
    const [docs, total] = await Promise.all([
      OrderModel.find().sort({ createdAt: -1 }).skip(skip).limit(pagination.limit),
      OrderModel.countDocuments(),
    ]);

    return {
      items: docs.map(toDomain),
      total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }
}
