import { Request, Response } from "express";
import { PaymentService } from "../../application/services/PaymentService";

export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  createOrder = async (req: Request, res: Response): Promise<void> => {
    const result = await this.paymentService.createRazorpayOrder(req.user!.sub, req.params.orderId);
    res.status(201).json(result);
  };

  verifyPayment = async (req: Request, res: Response): Promise<void> => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    await this.paymentService.verifyPayment(
      req.user!.sub,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );
    res.json({ success: true });
  };

  webhook = async (req: Request, res: Response): Promise<void> => {
    const signature = req.header("x-razorpay-signature");
    const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
    if (!rawBody) {
      res.status(400).json({ message: "Missing raw body" });
      return;
    }
    await this.paymentService.handleWebhook(rawBody, signature);
    res.status(200).json({ status: "ok" });
  };
}
