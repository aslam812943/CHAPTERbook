import { Request, Response } from "express";
import { WishlistService } from "../../application/services/WishlistService";

export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  getWishlist = async (req: Request, res: Response): Promise<void> => {
    const wishlist = await this.wishlistService.getWishlist(req.user!.sub);
    res.json({ wishlist });
  };

  addItem = async (req: Request, res: Response): Promise<void> => {
    const { bookId } = req.body;
    const wishlist = await this.wishlistService.addBook(req.user!.sub, bookId);
    res.status(201).json({ wishlist });
  };

  removeItem = async (req: Request, res: Response): Promise<void> => {
    const wishlist = await this.wishlistService.removeBook(req.user!.sub, req.params.bookId);
    res.json({ wishlist });
  };
}
