import { connectDatabase, disconnectDatabase } from "../infrastructure/database/connect";
import { MongoCategoryRepository } from "../infrastructure/repositories/MongoCategoryRepository";
import { MongoBookRepository } from "../infrastructure/repositories/MongoBookRepository";
import { MongoAuthorRepository } from "../infrastructure/repositories/MongoAuthorRepository";
import { MongoOfferRepository } from "../infrastructure/repositories/MongoOfferRepository";
import { BookService } from "../application/services/BookService";
import { AuthorService } from "../application/services/AuthorService";
import { GoogleBooksProvider } from "../infrastructure/externalApis/GoogleBooksProvider";
import { BookModel } from "../infrastructure/database/models/Book.model";

const booksData = [
  { title: "VISHAPPU,PRANAYAM,UNMADHAM", author: "MUHAMMED ABBAS" },
  { title: "ATHREYAKAM", author: "RAJASREE" },
  { title: "MARANAVAMSHAM", author: "P V SHAJIKUMAR" },
  { title: "REST IN PIECE", author: "LAJO JOSE" },
  { title: "HYDRENJIA", author: "LAJO JOSE" },
  { title: "ORANJUTHOTTATHILE ADITHI", author: "LAJO JOSE" },
  { title: "COFFE HOUSE", author: "LAJO JOSE" },
  { title: "KAMBILIKANDATHE KALBHARANIKAL", author: "BABU ABRAHAM" },
  { title: "Kanthamalacharitham - Chapter 2 - Arolakkaadinte Rahasyam", author: "VISHNU M C" },
  { title: "Kanthamala Charitham: Yudhakandam", author: "VISHNU M C" },
  { title: "Kanthamala Charitham Akhinathante Nidhi", author: "VISHNU M C" },
  { title: "KARUTHACHAN", author: "S K HARINATH" },
  { title: "URAKKAPPISHACHU", author: "S P SARATH" },
  { title: "VARATHUPOKKU", author: "S P SARATH" },
  { title: "PARAKAYAM", author: "MUHAMMED ASIF" }
];

async function seedFictionBooks() {
  await connectDatabase();

  const categoryRepo = new MongoCategoryRepository();
  const bookRepo = new MongoBookRepository();
  const authorRepo = new MongoAuthorRepository();
  const offerRepo = new MongoOfferRepository();
  
  const authorService = new AuthorService(authorRepo);
  const bookService = new BookService(bookRepo, authorService, offerRepo);
  const googleProvider = new GoogleBooksProvider();

  let fictionCategory = await categoryRepo.findBySlug("fiction");
  if (!fictionCategory) {
    fictionCategory = await categoryRepo.create({
      name: "Fiction",
      slug: "fiction",
      description: "Fictional literature"
    });
    console.log("[seed] Created 'Fiction' category.");
  }

  const categoryId = fictionCategory.id;
  
  let addedCount = 0;
  let pendingCount = 0;

  for (const { title, author } of booksData) {
    console.log(`\nProcessing: "${title}" by ${author}`);
    
    // Check if book already exists
    const existingBook = await BookModel.findOne({ title: { $regex: new RegExp(`^${title}$`, "i") } });
    if (existingBook) {
      console.log(`  -> Book already exists in database. Skipping.`);
      pendingCount++;
      continue;
    }
    
    const results = await googleProvider.search(`${title} ${author}`);
    
    let description = "Malayalam Fiction Book.";
    let coverImageUrl: string | undefined;
    let pageCount: number | undefined;
    let isbn10: string | undefined;
    let isbn13: string | undefined;
    let publisher: string | undefined;

    if (results && results.length > 0) {
      const bestMatch = results[0];
      description = bestMatch.description || description;
      coverImageUrl = bestMatch.thumbnail;
      pageCount = bestMatch.pageCount;
      isbn10 = bestMatch.isbn10;
      isbn13 = bestMatch.isbn13;
      publisher = bestMatch.publisher;
      console.log(`  -> Found via Google Books: ${bestMatch.title}`);
    } else {
      console.log(`  -> No exact match found on Google Books, using default details.`);
    }

    try {
      const book = await bookService.create({
        title,
        authors: [author],
        description,
        price: 250,
        stock: 10,
        categoryIds: [categoryId],
        source: "google",
        coverImageUrl,
        pageCount,
        isbn10,
        isbn13,
        publisher
      });
      console.log(`  -> Successfully created book: ${book.id}`);
      addedCount++;
    } catch (err: any) {
      console.error(`  -> Failed to create book:`, err.message);
      pendingCount++;
    }
  }

  console.log(`\n--- Seeding Summary ---`);
  console.log(`Total Books Processed: ${booksData.length}`);
  console.log(`Added Successfully: ${addedCount}`);
  console.log(`Pending/Skipped: ${pendingCount}`);
  
  await disconnectDatabase();
}

seedFictionBooks().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
