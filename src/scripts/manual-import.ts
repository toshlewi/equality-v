import { connectDB } from '@/lib/mongodb';
import Publication from '@/models/Publication';
import Book from '@/models/Book';
import Toolkit from '@/models/Toolkit';
// import fs from 'fs/promises'; // Unused for now
// import path from 'path'; // Unused for now

// Sample data for manual import - you can modify this based on your actual files
const publicationsData = [
  {
    title: "Digital Rights and Privacy in Kenya",
    author: "Equality Vanguard Research Team",
    description: "A comprehensive analysis of digital rights and privacy issues in Kenya, covering legal frameworks, challenges, and recommendations.",
    category: "report",
    tags: ["digital-rights", "privacy", "kenya", "legal"],
    pdfUrl: "/files/publications/digital-rights-privacy-kenya.pdf",
    status: "published",
    isFeatured: true
  },
  {
    title: "Economic Justice for Women in East Africa",
    author: "Dr. Sarah Mwangi",
    description: "Exploring economic barriers and opportunities for women in East Africa, with policy recommendations.",
    category: "article",
    tags: ["economic-justice", "women", "east-africa", "policy"],
    pdfUrl: "/files/publications/economic-justice-women-east-africa.pdf",
    status: "published",
    isFeatured: true
  },
  {
    title: "Mental Health Advocacy Toolkit",
    author: "Equality Vanguard Mental Health Team",
    description: "A practical guide for mental health advocacy, including resources and strategies for community engagement.",
    category: "report",
    tags: ["mental-health", "advocacy", "toolkit", "community"],
    pdfUrl: "/files/publications/mental-health-advocacy-toolkit.pdf",
    status: "published",
    isFeatured: false
  },
  {
    title: "SRHR Rights in Kenya: Legal Framework",
    author: "Legal Vanguard Team",
    description: "Comprehensive analysis of Sexual and Reproductive Health Rights legal framework in Kenya.",
    category: "report",
    tags: ["srhr", "legal", "kenya", "reproductive-rights"],
    pdfUrl: "/files/publications/srhr-rights-kenya-legal-framework.pdf",
    status: "published",
    isFeatured: true
  },
  {
    title: "Community Organizing for Social Change",
    author: "Community Engagement Team",
    description: "A guide to effective community organizing strategies for social change and advocacy.",
    category: "article",
    tags: ["community-organizing", "social-change", "advocacy", "strategy"],
    pdfUrl: "/files/publications/community-organizing-social-change.pdf",
    status: "published",
    isFeatured: false
  }
];

const booksData = [
  {
    title: "We Should All Be Feminists",
    author: "Chimamanda Ngozi Adichie",
    description: "A powerful essay on feminism and gender equality, adapted from the author's TEDx talk.",
    isbn: "978-0-307-96212-2",
    genre: "Feminism",
    tags: ["feminism", "gender-equality", "essay"],
    coverImage: "/files/books/we-should-all-be-feminists.jpg",
    status: "published",
    isFeatured: true,
    bookClubStatus: "current"
  },
  {
    title: "The Second Sex",
    author: "Simone de Beauvoir",
    description: "A foundational work of feminist philosophy examining women's oppression and liberation.",
    isbn: "978-0-307-96212-3",
    genre: "Philosophy",
    tags: ["feminism", "philosophy", "existentialism", "women"],
    coverImage: "/files/books/the-second-sex.jpg",
    status: "published",
    isFeatured: true,
    bookClubStatus: "completed"
  },
  {
    title: "Bad Feminist",
    author: "Roxane Gay",
    description: "A collection of essays exploring modern feminism, pop culture, and social issues.",
    isbn: "978-0-06-228271-2",
    genre: "Essays",
    tags: ["feminism", "essays", "pop-culture", "social-issues"],
    coverImage: "/files/books/bad-feminist.jpg",
    status: "published",
    isFeatured: false,
    bookClubStatus: "upcoming"
  },
  {
    title: "Sister Outsider",
    author: "Audre Lorde",
    description: "A collection of essays and speeches by the influential Black feminist writer and activist.",
    isbn: "978-0-89594-142-8",
    genre: "Essays",
    tags: ["feminism", "black-feminism", "activism", "intersectionality"],
    coverImage: "/files/books/sister-outsider.jpg",
    status: "published",
    isFeatured: true,
    bookClubStatus: "completed"
  },
  {
    title: "The Color Purple",
    author: "Alice Walker",
    description: "A powerful novel about the lives of African American women in the early 20th century.",
    isbn: "978-0-15-119154-3",
    genre: "Fiction",
    tags: ["fiction", "african-american", "women", "literature"],
    coverImage: "/files/books/the-color-purple.jpg",
    status: "published",
    isFeatured: true,
    bookClubStatus: "current"
  }
];

const toolkitsData = [
  {
    title: "Digital Rights Advocacy Toolkit",
    description: "A comprehensive guide for advocating digital rights and internet freedom in Africa.",
    shortDescription: "Guide for digital rights advocacy",
    category: "advocacy",
    subcategory: "digital-rights",
    tags: ["digital-rights", "advocacy", "internet-freedom", "africa"],
    files: [
      {
        name: "Digital Rights Advocacy Guide.pdf",
        url: "/files/toolkits/digital-rights-advocacy-guide.pdf",
        type: "pdf",
        size: 2048000,
        description: "Main advocacy guide",
        isPrimary: true
      }
    ],
    status: "published",
    isFeatured: true,
    accessLevel: "public",
    difficultyLevel: "intermediate",
    estimatedTime: "2-3 hours"
  },
  {
    title: "Community Organizing Handbook",
    description: "Practical strategies and tools for effective community organizing and mobilization.",
    shortDescription: "Handbook for community organizing",
    category: "community",
    subcategory: "organizing",
    tags: ["community-organizing", "mobilization", "strategy", "grassroots"],
    files: [
      {
        name: "Community Organizing Handbook.pdf",
        url: "/files/toolkits/community-organizing-handbook.pdf",
        type: "pdf",
        size: 1536000,
        description: "Complete organizing handbook",
        isPrimary: true
      }
    ],
    status: "published",
    isFeatured: false,
    accessLevel: "public",
    difficultyLevel: "beginner",
    estimatedTime: "1-2 hours"
  },
  {
    title: "Legal Advocacy Resource Kit",
    description: "Resources and templates for legal advocacy and human rights work.",
    shortDescription: "Legal advocacy resources",
    category: "legal",
    subcategory: "advocacy",
    tags: ["legal-advocacy", "human-rights", "templates", "resources"],
    files: [
      {
        name: "Legal Advocacy Kit.pdf",
        url: "/files/toolkits/legal-advocacy-kit.pdf",
        type: "pdf",
        size: 3072000,
        description: "Legal advocacy resource kit",
        isPrimary: true
      }
    ],
    status: "published",
    isFeatured: true,
    accessLevel: "member",
    difficultyLevel: "advanced",
    estimatedTime: "3-4 hours"
  }
];

// Helper function to generate slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function importPublications() {
  console.log('📚 Importing publications...');
  
  for (const pubData of publicationsData) {
    try {
      // Check if publication already exists
      const existing = await Publication.findOne({ title: pubData.title });
      if (existing) {
        console.log(`⚠️  Publication "${pubData.title}" already exists, skipping...`);
        continue;
      }

      // Create publication
      const publication = new Publication({
        ...pubData,
        slug: generateSlug(pubData.title),
        publishedAt: new Date(),
        viewCount: 0,
        excerpt: pubData.description.substring(0, 200) + '...'
      });

      await publication.save();
      console.log(`✅ Imported publication: "${pubData.title}"`);
    } catch (error) {
      console.error(`❌ Error importing publication "${pubData.title}":`, error);
    }
  }
}

async function importBooks() {
  console.log('📖 Importing books...');
  
  for (const bookData of booksData) {
    try {
      // Check if book already exists
      const existing = await Book.findOne({ title: bookData.title });
      if (existing) {
        console.log(`⚠️  Book "${bookData.title}" already exists, skipping...`);
        continue;
      }

      // Create book
      const book = new Book({
        ...bookData,
        slug: generateSlug(bookData.title),
        publicationDate: new Date(),
        viewCount: 0,
        downloadCount: 0
      });

      await book.save();
      console.log(`✅ Imported book: "${bookData.title}"`);
    } catch (error) {
      console.error(`❌ Error importing book "${bookData.title}":`, error);
    }
  }
}

async function importToolkits() {
  console.log('🛠️  Importing toolkits...');
  
  for (const toolkitData of toolkitsData) {
    try {
      // Check if toolkit already exists
      const existing = await Toolkit.findOne({ title: toolkitData.title });
      if (existing) {
        console.log(`⚠️  Toolkit "${toolkitData.title}" already exists, skipping...`);
        continue;
      }

      // Create toolkit
      const toolkit = new Toolkit({
        ...toolkitData,
        slug: generateSlug(toolkitData.title),
        viewCount: 0,
        downloadCount: 0,
        rating: 0,
        reviewCount: 0
      });

      await toolkit.save();
      console.log(`✅ Imported toolkit: "${toolkitData.title}"`);
    } catch (error) {
      console.error(`❌ Error importing toolkit "${toolkitData.title}":`, error);
    }
  }
}

async function main() {
  try {
    console.log('🚀 Starting manual data import...');
    
    await connectDB();
    console.log('✅ Connected to database');

    await importPublications();
    await importBooks();
    await importToolkits();

    console.log('🎉 Manual import completed successfully!');
    
    // Show summary
    const [pubCount, bookCount, toolkitCount] = await Promise.all([
      Publication.countDocuments(),
      Book.countDocuments(),
      Toolkit.countDocuments()
    ]);

    console.log('\n📊 Import Summary:');
    console.log(`- Publications: ${pubCount}`);
    console.log(`- Books: ${bookCount}`);
    console.log(`- Toolkits: ${toolkitCount}`);

  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run the import
main();

