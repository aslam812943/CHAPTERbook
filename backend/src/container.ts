import { Router } from "express";
import { MongoUserRepository } from "./infrastructure/repositories/MongoUserRepository";
import { MongoBookRepository } from "./infrastructure/repositories/MongoBookRepository";
import { MongoCartRepository } from "./infrastructure/repositories/MongoCartRepository";
import { MongoWishlistRepository } from "./infrastructure/repositories/MongoWishlistRepository";
import { MongoReviewRepository } from "./infrastructure/repositories/MongoReviewRepository";
import { MongoBookRequestRepository } from "./infrastructure/repositories/MongoBookRequestRepository";
import { MongoOrderRepository } from "./infrastructure/repositories/MongoOrderRepository";
import { MongoCategoryRepository } from "./infrastructure/repositories/MongoCategoryRepository";
import { MongoAuthorRepository } from "./infrastructure/repositories/MongoAuthorRepository";
import { MongoOfferRepository } from "./infrastructure/repositories/MongoOfferRepository";
import { GoogleBooksProvider } from "./infrastructure/externalApis/GoogleBooksProvider";
import { OpenLibraryProvider } from "./infrastructure/externalApis/OpenLibraryProvider";
import { AuthService } from "./application/services/AuthService";
import { BookService } from "./application/services/BookService";
import { BookLookupService } from "./application/services/BookLookupService";
import { CartService } from "./application/services/CartService";
import { WishlistService } from "./application/services/WishlistService";
import { ReviewService } from "./application/services/ReviewService";
import { BookRequestService } from "./application/services/BookRequestService";
import { OrderService } from "./application/services/OrderService";
import { AdminOrderService } from "./application/services/AdminOrderService";
import { PaymentService } from "./application/services/PaymentService";
import { CategoryService } from "./application/services/CategoryService";
import { AuthorService } from "./application/services/AuthorService";
import { OfferService } from "./application/services/OfferService";
import { AuthController } from "./presentation/controllers/AuthController";
import { BookController } from "./presentation/controllers/BookController";
import { BookLookupController } from "./presentation/controllers/BookLookupController";
import { CartController } from "./presentation/controllers/CartController";
import { WishlistController } from "./presentation/controllers/WishlistController";
import { ReviewController } from "./presentation/controllers/ReviewController";
import { BookRequestController } from "./presentation/controllers/BookRequestController";
import { AdminBookRequestController } from "./presentation/controllers/AdminBookRequestController";
import { OrderController } from "./presentation/controllers/OrderController";
import { AdminOrderController } from "./presentation/controllers/AdminOrderController";
import { PaymentController } from "./presentation/controllers/PaymentController";
import { CategoryController } from "./presentation/controllers/CategoryController";
import { AuthorController } from "./presentation/controllers/AuthorController";
import { OfferController } from "./presentation/controllers/OfferController";
import { buildAuthRouter } from "./presentation/routes/auth.routes";
import { buildBookRouter } from "./presentation/routes/book.routes";
import { buildBookLookupRouter } from "./presentation/routes/bookLookup.routes";
import { buildCartRouter } from "./presentation/routes/cart.routes";
import { buildWishlistRouter } from "./presentation/routes/wishlist.routes";
import { buildReviewRouter } from "./presentation/routes/review.routes";
import { buildBookRequestRouter } from "./presentation/routes/bookRequest.routes";
import { buildAdminBookRequestRouter } from "./presentation/routes/adminBookRequest.routes";
import { buildOrderRouter } from "./presentation/routes/order.routes";
import { buildAdminOrderRouter } from "./presentation/routes/adminOrder.routes";
import { buildPaymentRouter } from "./presentation/routes/payment.routes";
import { buildCategoryRouter } from "./presentation/routes/category.routes";
import { buildAuthorRouter } from "./presentation/routes/author.routes";
import { buildOfferRouter } from "./presentation/routes/offer.routes";

// Composition root: wires concrete repositories into services, services into
// controllers, and controllers into routers. Services only ever depend on
// repository interfaces (domain/repositories/*) - this is the single place
// concrete Mongo implementations get bound to those interfaces.
function buildContainer() {
  const userRepository = new MongoUserRepository();
  const bookRepository = new MongoBookRepository();
  const cartRepository = new MongoCartRepository();
  const wishlistRepository = new MongoWishlistRepository();
  const reviewRepository = new MongoReviewRepository();
  const bookRequestRepository = new MongoBookRequestRepository();
  const orderRepository = new MongoOrderRepository();
  const categoryRepository = new MongoCategoryRepository();
  const authorRepository = new MongoAuthorRepository();
  const offerRepository = new MongoOfferRepository();

  const googleBooksProvider = new GoogleBooksProvider();
  const openLibraryProvider = new OpenLibraryProvider();

  const authService = new AuthService(userRepository);
  const authorService = new AuthorService(authorRepository);
  const bookService = new BookService(bookRepository, authorService, offerRepository);
  const bookLookupService = new BookLookupService([googleBooksProvider, openLibraryProvider]);
  const cartService = new CartService(cartRepository, bookRepository, offerRepository);
  const wishlistService = new WishlistService(wishlistRepository, bookRepository, offerRepository);
  const reviewService = new ReviewService(reviewRepository, bookRepository, userRepository);
  const bookRequestService = new BookRequestService(bookRequestRepository, userRepository, bookRepository);
  const orderService = new OrderService(orderRepository, cartRepository, cartService, bookRepository);
  const adminOrderService = new AdminOrderService(orderRepository, bookRepository);
  const paymentService = new PaymentService(orderRepository, bookRepository);
  const categoryService = new CategoryService(categoryRepository);
  const offerService = new OfferService(offerRepository);

  const authController = new AuthController(authService);
  const bookController = new BookController(bookService);
  const bookLookupController = new BookLookupController(bookLookupService);
  const cartController = new CartController(cartService);
  const wishlistController = new WishlistController(wishlistService);
  const reviewController = new ReviewController(reviewService);
  const bookRequestController = new BookRequestController(bookRequestService);
  const adminBookRequestController = new AdminBookRequestController(bookRequestService);
  const orderController = new OrderController(orderService);
  const adminOrderController = new AdminOrderController(adminOrderService);
  const paymentController = new PaymentController(paymentService);
  const categoryController = new CategoryController(categoryService);
  const authorController = new AuthorController(authorService);
  const offerController = new OfferController(offerService);

  return {
    authController,
    bookController,
    bookLookupController,
    cartController,
    wishlistController,
    reviewController,
    bookRequestController,
    adminBookRequestController,
    orderController,
    adminOrderController,
    paymentController,
    categoryController,
    authorController,
    offerController,
  };
}

export function buildApiRouter(): Router {
  const {
    authController,
    bookController,
    bookLookupController,
    cartController,
    wishlistController,
    reviewController,
    bookRequestController,
    adminBookRequestController,
    orderController,
    adminOrderController,
    paymentController,
    categoryController,
    authorController,
    offerController,
  } = buildContainer();

  const router = Router();
  router.use("/auth", buildAuthRouter(authController));
  router.use("/books", buildBookRouter(bookController));
  router.use("/admin", buildBookLookupRouter(bookLookupController));
  router.use("/admin", buildAdminOrderRouter(adminOrderController));
  router.use("/admin", buildAdminBookRequestRouter(adminBookRequestController));
  router.use("/cart", buildCartRouter(cartController));
  router.use("/wishlist", buildWishlistRouter(wishlistController));
  router.use("/reviews", buildReviewRouter(reviewController));
  router.use("/book-requests", buildBookRequestRouter(bookRequestController));
  router.use("/orders", buildOrderRouter(orderController));
  router.use("/payments", buildPaymentRouter(paymentController));
  router.use("/categories", buildCategoryRouter(categoryController));
  router.use("/authors", buildAuthorRouter(authorController));
  router.use("/offers", buildOfferRouter(offerController));

  return router;
}
