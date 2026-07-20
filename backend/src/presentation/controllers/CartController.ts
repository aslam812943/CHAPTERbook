import { Request, Response } from "express";
import { CartService } from "../../application/services/CartService";

export class CartController {
  constructor(private readonly cartService: CartService) {}

  getCart = async (req: Request, res: Response): Promise<void> => {
    const cart = await this.cartService.getCart(req.user!.sub);
    res.json({ cart });
  };

  addItem = async (req: Request, res: Response): Promise<void> => {
    const { bookId, quantity } = req.body;
    const cart = await this.cartService.addItem(req.user!.sub, bookId, quantity);
    res.status(201).json({ cart });
  };

  updateItem = async (req: Request, res: Response): Promise<void> => {
    const cart = await this.cartService.updateItemQuantity(req.user!.sub, req.params.bookId, req.body.quantity);
    res.json({ cart });
  };

  removeItem = async (req: Request, res: Response): Promise<void> => {
    const cart = await this.cartService.removeItem(req.user!.sub, req.params.bookId);
    res.json({ cart });
  };

  clear = async (req: Request, res: Response): Promise<void> => {
    await this.cartService.clear(req.user!.sub);
    res.status(204).send();
  };
}
