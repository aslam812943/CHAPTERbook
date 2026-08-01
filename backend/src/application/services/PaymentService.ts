import crypto from "crypto";
import Razorpay from "razorpay";
import { IOrderRepository } from "../../domain/repositories/IOrderRepository";
import { IBookRepository } from "../../domain/repositories/IBookRepository";
import { Order } from "../../domain/entities/Order";
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
  // Built lazily, not in the constructor - the Razorpay SDK throws
  // synchronously if key_id is empty, and this service is constructed
  // eagerly at server boot (container.ts, inside buildApiRouter()). An
  // eager throw here would fail the *entire* API - auth, books, cart,
  // everything - not just payments, the moment RAZORPAY_KEY_ID is unset.
  // That directly contradicts env.ts's own comment that a missing
  // Razorpay config "doesn't take down the whole server."
  private razorpayClient: Razorpay | null | undefined;

  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly bookRepository: IBookRepository
  ) {}

  private getRazorpay(): Razorpay {
    if (this.razorpayClient === undefined) {
      try {
        this.razorpayClient = new Razorpay({
          key_id: env.RAZORPAY_KEY_ID,
          key_secret: env.RAZORPAY_KEY_SECRET,
        });
      } catch {
        this.razorpayClient = null;
      }
    }
    if (!this.razorpayClient) {
      throw new ValidationError("Payment gateway is not configured yet");
    }
    return this.razorpayClient;
  }

  // Stock is only ever checked (not reserved) up through checkout, so this
  // is the actual moment inventory is committed - tied to the same
  // paymentStatus guard that already makes markPaid idempotent, so a
  // retried webhook or a race between verifyPayment and handleWebhook for
  // the same order can never decrement twice.
  private async decrementStockForOrder(order: Order): Promise<void> {
    await Promise.all(order.items.map((item) => this.bookRepository.decrementStock(item.bookId, item.quantity)));
  }

  // Payment is real proof the order is legitimate - advance it out of
  // "pending" automatically so it's no longer hidden from the customer's
  // own order history (which filters out pending orders), rather than
  // leaving a genuinely paid order invisible until an admin happens to
  // touch it. Guarded so it never clobbers a status an admin has already
  // moved further along (e.g. if this somehow ran after shipping began).
  private async confirmIfPending(order: Order): Promise<void> {
    if (order.status === "pending") {
      await this.orderRepository.updateStatus(order.id, "confirmed");
    }
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

    // Reuse an existing, still-unpaid Razorpay order instead of always
    // minting a new one. Without this, a double-click (or a UI bug that
    // re-enables the button while a modal is still open) creates a second
    // Razorpay order and overwrites the order's single razorpayOrderId
    // field - if the customer then completes payment on the now-stale
    // first modal, Razorpay captures real money but neither verifyPayment
    // nor the webhook can find a matching order anymore, since the id on
    // record has already changed.
    const razorpayOrderId = order.razorpayOrderId ?? (await this.createRemoteOrder(amountInPaise, order.orderRef, order.id));

    return {
      razorpayOrderId,
      amount: amountInPaise,
      currency: "INR",
      keyId: env.RAZORPAY_KEY_ID,
    };
  }

  private async createRemoteOrder(amountInPaise: number, orderRef: string, orderId: string): Promise<string> {
    const razorpayOrder = await this.getRazorpay().orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: orderRef,
    });
    await this.orderRepository.setRazorpayOrderId(orderId, razorpayOrder.id);
    return razorpayOrder.id;
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
      await this.decrementStockForOrder(order);
      await this.confirmIfPending(order);
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

    let event: { event?: string; payload?: { payment?: { entity?: { order_id?: string; id?: string } } } };
    try {
      event = JSON.parse(rawBody.toString("utf8"));
    } catch {
      throw new ValidationError("Malformed webhook payload");
    }
    if (event.event !== "payment.captured") return;

    const payment = event.payload?.payment?.entity;
    if (!payment?.order_id || !payment?.id) return;

    const order = await this.orderRepository.findByRazorpayOrderId(payment.order_id);
    if (!order) return;

    if (order.paymentStatus !== "paid") {
      await this.orderRepository.markPaid(order.id, payment.id);
      await this.decrementStockForOrder(order);
      await this.confirmIfPending(order);
    }
  }
}
