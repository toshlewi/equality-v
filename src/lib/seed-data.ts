import { connectDB } from './mongodb';
import Book from './models/Book';
import Publication from './models/Publication';

// Books data from EV CONTEXT.md
const booksData = [
  // Books Covered (featured books)
  {
    title: "Purple Hibiscus",
    author: "Chimamanda Ngozi Adichie",
    year: 2003,
    genre: "Fiction",
    shortDescription: "A powerful coming-of-age story that explores themes of family, religion, and political upheaval in Nigeria.",
    matriarchiveCategory: "Covered",
    category: "Fiction",
    coverImage: "/image/books/purple-hibiscus.jpg",
    featured: true,
    status: "approved"
  },
  {
    title: "The Sex Lives of African Women",
    author: "Nana Darkoa Sekyiamah",
    year: 2021,
    genre: "Non-Fiction",
    shortDescription: "An intimate collection of stories about African women's sexual experiences and relationships.",
    matriarchiveCategory: "Covered",
    category: "Non-Fiction",
    coverImage: "/image/books/sex-lives-african-women.jpg",
    featured: true,
    status: "approved"
  },
  {
    title: "Decolonization and Afrofeminism",
    author: "Dr. Sylvia Tamale",
    year: 2020,
    genre: "Academic",
    shortDescription: "A critical examination of decolonial feminist thought and its application in African contexts.",
    matriarchiveCategory: "Covered",
    category: "Academic",
    coverImage: "/image/books/decolonization-afrofeminism.jpg",
    featured: true,
    status: "approved"
  },
  {
    title: "All About Love",
    author: "Bell Hooks",
    year: 2000,
    genre: "Non-Fiction",
    shortDescription: "A transformative exploration of love in all its forms and its role in creating a just society.",
    matriarchiveCategory: "Covered",
    category: "Non-Fiction",
    coverImage: "/image/books/all-about-love.jpg",
    featured: true,
    status: "approved"
  },
  // Library Books
  {
    title: "Feminism for The African Woman",
    author: "Lyna Dommie Namasaka",
    year: 2019,
    genre: "Non-Fiction",
    shortDescription: "A comprehensive guide to feminist principles tailored for African women's experiences.",
    matriarchiveCategory: "Library",
    category: "Non-Fiction",
    coverImage: "/image/books/feminism-african-woman.jpg",
    status: "approved"
  },
  {
    title: "Only Big Bumbum Matters Tomorrow",
    author: "Damilare Kuku",
    year: 2021,
    genre: "Fiction",
    shortDescription: "A satirical collection of short stories exploring contemporary Nigerian society.",
    matriarchiveCategory: "Library",
    category: "Fiction",
    coverImage: "/image/books/big-bumbum.jpg",
    status: "approved"
  },
  {
    title: "The Body is Not an Apology",
    author: "Sonya Renee Taylor",
    year: 2018,
    genre: "Non-Fiction",
    shortDescription: "A radical self-love manifesto that challenges body shame and promotes body liberation.",
    matriarchiveCategory: "Library",
    category: "Non-Fiction",
    coverImage: "/image/books/body-not-apology.jpg",
    status: "approved"
  },
  {
    title: "Our Sister Killjoy",
    author: "Ama Ata Aidoo",
    year: 1977,
    genre: "Fiction",
    shortDescription: "A groundbreaking novel exploring African women's experiences and diaspora identity.",
    matriarchiveCategory: "Library",
    category: "Fiction",
    coverImage: "/image/books/sister-killjoy.jpg",
    status: "approved"
  },
  {
    title: "The Master's Tools Will Never Dismantle The Master's House",
    author: "Audre Lorde",
    year: 1984,
    genre: "Non-Fiction",
    shortDescription: "A seminal essay collection on intersectionality, feminism, and social justice.",
    matriarchiveCategory: "Library",
    category: "Non-Fiction",
    coverImage: "/image/books/masters-tools.jpg",
    status: "approved"
  },
  {
    title: "We Should All Be Feminists",
    author: "Chimamanda Ngozi Adichie",
    year: 2014,
    genre: "Non-Fiction",
    shortDescription: "A powerful essay adapted from her TEDx talk on modern feminism.",
    matriarchiveCategory: "Library",
    category: "Non-Fiction",
    coverImage: "/image/books/we-should-all-be-feminists.jpg",
    status: "approved"
  }
];

// Publications data from EV CONTEXT.md
const publicationsData = [
  {
    title: "Digital Health Rights in Africa",
    author: "Dr. Sarah Mwangi",
    type: "Article",
    description: "Exploring the intersection of digital technology and health rights for African women.",
    content: "Full article content about digital health rights...",
    coverImage: "/image/publications/digital-health-rights.jpg",
    publishedAt: new Date("2024-12-15"),
    status: "published",
    featured: true
  },
  {
    title: "Economic Justice & Women's Labor",
    author: "Prof. Aisha Hassan",
    type: "Report",
    description: "A comprehensive analysis of women's economic participation and labor rights in Africa.",
    content: "Full report content about economic justice...",
    coverImage: "/image/publications/economic-justice.jpg",
    publishedAt: new Date("2024-12-10"),
    status: "published",
    featured: true
  },
  {
    title: "SRHR Policy Framework 2024",
    author: "Equality Vanguard Research Team",
    type: "Report",
    description: "A policy framework for advancing sexual and reproductive health and rights across Africa.",
    content: "Full policy framework content...",
    coverImage: "/image/publications/srhr-framework.jpg",
    publishedAt: new Date("2024-12-05"),
    status: "published",
    featured: true
  },
  {
    title: "Digital Inclusion for Women",
    author: "Tech Feminist Collective",
    type: "Blog",
    description: "Breaking down barriers to digital access and participation for women in tech.",
    content: "Full blog content about digital inclusion...",
    coverImage: "/image/publications/digital-inclusion.jpg",
    publishedAt: new Date("2024-11-28"),
    status: "published"
  },
  {
    title: "Femicide in Kenya: A Silent Crisis",
    author: "Justice for Women Initiative",
    type: "Article",
    description: "An in-depth investigation into femicide cases and the justice system's response.",
    content: "Full article content about femicide...",
    coverImage: "/image/publications/femicide-kenya.jpg",
    publishedAt: new Date("2024-11-20"),
    status: "published"
  }
];

export async function seedDatabase() {
  try {
    await connectDB();
    
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data
    await Book.deleteMany({});
    await Publication.deleteMany({});
    
    // Seed books
    const books = await Book.insertMany(booksData);
    console.log(`✅ Seeded ${books.length} books`);
    
    // Seed publications
    const publications = await Publication.insertMany(publicationsData);
    console.log(`✅ Seeded ${publications.length} publications`);
    
    console.log('🎉 Database seeding completed successfully!');
    
    return { books, publications };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Export for use in API routes
export default seedDatabase;
