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
  { title: "MOTHER MARY COMES TO ME", author: "ARUNDHATI ROY" },
  { title: "AADAM NEE EVIDE AKUNNU", author: "V D SATHEESAN" },
  { title: "DAIVATHINTE CHAARANMAAR", author: "JOSEPH ANNAMKUTTY JOSE" },
  { title: "SANTHOSHATHINTE SAMAVAKYANGAL", author: "ASWATHY SREEKANTH" },
  { title: "NARAMUNDO KHELA", author: "NIZAR ILTH" },
  { title: "ORU POLICE SURGEONTE ORMAKKURIPPUKAL", author: "B UMADATHAN" },
  { title: "SNEHAM KAMAM BHRANTH", author: "JOSEPH ANNAMKUTTY JOSE" },
  { title: "AVAR THOTTU NEE THALODI", author: "P M A GAFOOR" },
  { title: "NEERMATHALAM POOTHAKALAM", author: "MADHAVIKKUTTY" },
  { title: "RICH DAD POOR DAD", author: "ROBERT KIYOSAKI" },
  { title: "DAIVATHINTE ATHMAKATHA", author: "LENAA" },
  { title: "WOMEN O PAUSE", author: "LENAA" },
  { title: "IKIGAI JEEVITHAM ANANDAKARAMAKKAN ORU JAPANESE RAHASYAM", author: "HECTOR GARCIA" },
  { title: "IKIGAI DHEERKHAVUM SANTHOSHAKARAVUMAYA JEEVITHATHINULLA JAPANESE RAHASYAM", author: "HECTOR GARCIA" },
  { title: "AVALKKOPPAM", author: "R ROSHIPAL" },
  { title: "ENTE KATHA", author: "MADHAVIKKUTTY" },
  { title: "AGNICHIRAKUKAL", author: "A P J ABDUL KALAM" },
  { title: "NINGALUTE UPABODHAMANASINTE SAKTHI", author: "JOSEPH MURPHY" },
  { title: "KAPALAM", author: "DR. B UMADATHAN" },
  { title: "ATTUPOKATHA ORMAKAL", author: "T J JOSEPH" },
  { title: "DANTHASIMHASANAM", author: "MANU S PILLAI" }
];

async function seedNonFictionBooks() {
  await connectDatabase();

  const categoryRepo = new MongoCategoryRepository();
  const bookRepo = new MongoBookRepository();
  const authorRepo = new MongoAuthorRepository();
  const offerRepo = new MongoOfferRepository();
  
  const authorService = new AuthorService(authorRepo);
  const bookService = new BookService(bookRepo, authorService, offerRepo);
  const googleProvider = new GoogleBooksProvider();

  let nonFictionCategory = await categoryRepo.findBySlug("non-fiction");
  if (!nonFictionCategory) {
    nonFictionCategory = await categoryRepo.create({
      name: "Non-Fiction",
      slug: "non-fiction",
      description: "Non-fictional literature and real-world stories"
    });
    console.log("[seed] Created 'Non-Fiction' category.");
  }

  const categoryId = nonFictionCategory.id;
  
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
    
    let description = "Malayalam Non-Fiction Book.";
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

seedNonFictionBooks().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
