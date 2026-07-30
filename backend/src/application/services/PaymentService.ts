import crypto from "crypto";
import Razorpay from "razorpay";
import { IOrderRepository } from "../../domain/repositories/IOrderRepository";
import { NotFoundError, ValidationError } from "../../shared/errors/AppError";
import { env } from "../../config/env";

export interface CreateRazorpayOrderResult {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

// Constant-time comparison - a plain `===`/`!==` string compare leaks how
// many leading bytes matched via response timing, which is a real (if slow)
// side channel for guessing a signature byte-by-byte. Buffer.length must
// match before calling timingSafeEqual, which throws on mismatched lengths.
function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export class PaymentService {
  private readonly razorpay: Razorpay;

  constructor(private readonly orderRepository: IOrderRepository) {
    this.razorpay = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }

  async createRazorpayOrder(userId: string, orderId: string): Promise<CreateRazorpayOrderResult> {
    const order = await this.orderRepository.findById(orderId);
    if (!order || order.userId !== userId) {
      throw new NotFoundError("Order not found");
    }
    if (order.paymentStatus === "paid") {
      throw new ValidationError("This order has already been paid");
    }

    const amountInPaise = Math.round(order.totalAmount * 100);
    const razorpayOrder = await this.razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: order.orderRef,
    });

    await this.orderRepository.setRazorpayOrderId(order.id, razorpayOrder.id);

    return {
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: "INR",
      keyId: env.RAZORPAY_KEY_ID,
    };
  }

  // This is the fast-path confirmation triggered by the browser right after
  // the Razorpay modal reports success - it's real proof (an HMAC over the
  // order+payment IDs that only someone holding the key secret could
  // produce), not just trusting the client's word. But the browser can also
  // vanish (closed tab, dropped connection) right after a real payment
  // succeeds without ever making this call, which is exactly the gap
  // handleWebhook below exists to close - this endpoint is a UX
  // accelerant, not the only path to `paymentStatus: "paid"`.
  async verifyPayment(
    userId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<void> {
    const order = await this.orderRepository.findByRazorpayOrderId(razorpayOrderId);
    if (!order || order.userId !== userId) {
      throw new NotFoundError("Order not found");
    }

    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (!safeCompare(expectedSignature, razorpaySignature)) {
      throw new ValidationError("Payment verification failed");
    }

    if (order.paymentStatus !== "paid") {
      await this.orderRepository.markPaid(order.id, razorpayPaymentId);
    }
  }

  // The authoritative confirmation path - Razorpay calls this server-to-
  // server once a payment actually captures, independent of whatever the
  // customer's browser does afterward. Razorpay retries delivery if this
  // doesn't return 2xx, so the same event can arrive more than once; the
  // paymentStatus check makes re-processing a harmless no-op instead of a
  // duplicate side effect.
  async handleWebhook(rawBody: Buffer, signature: string | undefined): Promise<void> {
    if (!env.RAZORPAY_WEBHOOK_SECRET) {
      throw new ValidationError("Webhook not configured");
    }
    if (!signature) {
      throw new ValidationError("Missing webhook signature");
    }

    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (!safeCompare(expectedSignature, signature)) {
      throw new ValidationError("Invalid webhook signature");
    }

    const event = JSON.parse(rawBody.toString("utf8"));
    if (event.event !== "payment.captured") return;

    const payment = event.payload?.payment?.entity;
    if (!payment?.order_id || !payment?.id) return;

    const order = await this.orderRepository.findByRazorpayOrderId(payment.order_id);
    if (!order) return;

    if (order.paymentStatus !== "paid") {
      await this.orderRepository.markPaid(order.id, payment.id);
    }
  }
}
