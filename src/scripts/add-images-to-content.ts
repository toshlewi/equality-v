import { connectDB } from '../lib/mongodb';
import Book from '../models/Book';
import Publication from '../models/Publication';

// Book cover images
const bookCovers = [
  '/images/book cover1.jpg',
  '/images/book cover2.jpg',
  '/images/book cover3.jpg',
  '/images/book cover4.jpg',
];

// Publication images
const pubImages = [
  '/images/pub-image1.jpg',
  '/images/pub-image2.jpg',
  '/images/pub-image3.jpg',
];

async function addImages() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Get all books
    const books = await Book.find({});
    console.log(`Found ${books.length} books`);

    // Update each book with a cover image
    for (let i = 0; i < books.length; i++) {
      const book = books[i];
      const coverIndex = i % bookCovers.length;
      
      book.coverUrl = bookCovers[coverIndex];
      await book.save();
      
      console.log(`Updated book ${i + 1}: ${book.title} with ${bookCovers[coverIndex]}`);
    }

    console.log(`\nUpdated ${books.length} books with cover images\n`);

    // Get all publications
    const publications = await Publication.find({});
    console.log(`Found ${publications.length} publications`);

    // Update each publication with a featured image
    for (let i = 0; i < publications.length; i++) {
      const pub = publications[i];
      const imageIndex = i % pubImages.length;
      
      pub.featuredImage = pubImages[imageIndex];
      await pub.save();
      
      console.log(`Updated publication ${i + 1}: ${pub.title} with ${pubImages[imageIndex]}`);
    }

    console.log(`\nUpdated ${publications.length} publications with featured images\n`);
    console.log('✅ Done! All content now has images.');

    process.exit(0);
  } catch (error) {
    console.error('Error adding images:', error);
    process.exit(1);
  }
}

addImages();
