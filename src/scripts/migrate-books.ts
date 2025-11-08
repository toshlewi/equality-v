// import { connectDB } from '@/lib/mongodb'; // Unused for now
import Book from '@/models/Book';
import { slugify } from '@/lib/utils';

// Books data from EV CONTEXT.md - ALKAH Library
const booksData = [
  {
    title: "We Should All Be Feminists",
    author: "Chimamanda Ngozi Adichie",
    isbn: "978-0-307-96212-2",
    description: "A personal and powerful essay from Chimamanda Ngozi Adichie, based on her 2012 TEDx talk of the same name. This essay explores what it means to be a feminist in the 21st century, addressing the ways in which both men and women are harmed by restrictive gender roles.",
    shortDescription: "A powerful essay on modern feminism and gender equality, based on Adichie's famous TEDx talk.",
    year: 2014,
    publisher: "Anchor Books",
    language: "English",
    pages: 64,
    category: "essays",
    tags: ["feminism", "gender-equality", "african-literature", "essays"],
    coverImage: "/images/books/we-should-all-be-feminists.jpg",
    isFeatured: true,
    isBookClubSelection: true,
    bookClubDate: "2024-03-15T18:00:00Z"
  },
  {
    title: "Half of a Yellow Sun",
    author: "Chimamanda Ngozi Adichie",
    isbn: "978-0-307-38709-5",
    description: "A masterful, haunting novel about the Biafran War in Nigeria. Through the eyes of five characters, Adichie tells the story of a country torn apart by civil war, exploring themes of love, loss, and the human cost of conflict.",
    shortDescription: "A haunting novel about the Biafran War in Nigeria, exploring love, loss, and the human cost of conflict.",
    year: 2006,
    publisher: "Knopf",
    language: "English",
    pages: 433,
    category: "fiction",
    tags: ["african-literature", "historical-fiction", "war", "nigeria"],
    coverImage: "/images/books/half-of-a-yellow-sun.jpg",
    isFeatured: true,
    isBookClubSelection: true,
    bookClubDate: "2024-04-20T18:00:00Z"
  },
  {
    title: "The Color Purple",
    author: "Alice Walker",
    isbn: "978-0-15-119153-6",
    description: "A powerful novel about the lives of African American women in the early 20th century. Through the story of Celie, Walker explores themes of racism, sexism, and the power of sisterhood and self-discovery.",
    shortDescription: "A powerful novel about African American women's lives, exploring racism, sexism, and the power of sisterhood.",
    year: 1982,
    publisher: "Harcourt Brace Jovanovich",
    language: "English",
    pages: 288,
    category: "fiction",
    tags: ["african-american-literature", "feminism", "racism", "sisterhood"],
    coverImage: "/images/books/the-color-purple.jpg",
    isFeatured: true,
    isBookClubSelection: true,
    bookClubDate: "2024-05-18T18:00:00Z"
  },
  {
    title: "Bad Feminist",
    author: "Roxane Gay",
    isbn: "978-0-06-228271-2",
    description: "A collection of essays that explores what it means to be a feminist in today's world. Gay writes with humor and insight about pop culture, politics, and the complexities of modern feminism.",
    shortDescription: "A witty and insightful collection of essays on modern feminism, pop culture, and politics.",
    year: 2014,
    publisher: "Harper Perennial",
    language: "English",
    pages: 320,
    category: "essays",
    tags: ["feminism", "essays", "pop-culture", "politics"],
    coverImage: "/images/books/bad-feminist.jpg",
    isBookClubSelection: true,
    bookClubDate: "2024-06-15T18:00:00Z"
  },
  {
    title: "The Handmaid's Tale",
    author: "Margaret Atwood",
    isbn: "978-0-385-49081-8",
    description: "A dystopian novel set in the Republic of Gilead, where women are subjugated and used for reproduction. This powerful work explores themes of power, control, and resistance in a totalitarian society.",
    shortDescription: "A dystopian novel about women's subjugation in a totalitarian society, exploring power and resistance.",
    year: 1985,
    publisher: "McClelland and Stewart",
    language: "English",
    pages: 311,
    category: "fiction",
    tags: ["dystopian", "feminism", "totalitarianism", "reproduction-rights"],
    coverImage: "/images/books/the-handmaids-tale.jpg",
    isFeatured: true,
    isBookClubSelection: true,
    bookClubDate: "2024-07-20T18:00:00Z"
  },
  {
    title: "Sister Outsider",
    author: "Audre Lorde",
    isbn: "978-1-58091-186-3",
    description: "A collection of essays and speeches by Audre Lorde, a self-described 'black, lesbian, mother, warrior, poet.' This powerful work explores intersectionality, identity, and the importance of speaking truth to power.",
    shortDescription: "A powerful collection of essays exploring intersectionality, identity, and speaking truth to power.",
    year: 1984,
    publisher: "Crossing Press",
    language: "English",
    pages: 192,
    category: "essays",
    tags: ["intersectionality", "identity", "activism", "poetry"],
    coverImage: "/images/books/sister-outsider.jpg",
    isBookClubSelection: true,
    bookClubDate: "2024-08-17T18:00:00Z"
  },
  {
    title: "The Second Sex",
    author: "Simone de Beauvoir",
    isbn: "978-0-307-27778-7",
    description: "A foundational work of feminist philosophy that examines the construction of womanhood and the ways in which women have been historically oppressed. This influential text remains relevant today.",
    shortDescription: "A foundational work of feminist philosophy examining the construction of womanhood and women's oppression.",
    year: 1949,
    publisher: "Gallimard",
    language: "English",
    pages: 822,
    category: "academic",
    tags: ["feminist-philosophy", "existentialism", "gender-construction", "oppression"],
    coverImage: "/images/books/the-second-sex.jpg",
    isFeatured: true
  },
  {
    title: "A Room of One's Own",
    author: "Virginia Woolf",
    isbn: "978-0-15-678733-8",
    description: "An extended essay that explores the relationship between women and fiction. Woolf argues that women need financial independence and a space of their own to write, making this a foundational text of feminist literary criticism.",
    shortDescription: "A foundational essay on women and fiction, arguing for women's financial independence and creative space.",
    year: 1929,
    publisher: "Harcourt Brace",
    language: "English",
    pages: 112,
    category: "essays",
    tags: ["feminist-literary-criticism", "women-writers", "independence", "creativity"],
    coverImage: "/images/books/a-room-of-ones-own.jpg",
    isBookClubSelection: true,
    bookClubDate: "2024-09-21T18:00:00Z"
  },
  {
    title: "The Feminine Mystique",
    author: "Betty Friedan",
    isbn: "978-0-393-32257-6",
    description: "A groundbreaking book that helped launch the second wave of feminism. Friedan examines the 'problem that has no name' - the dissatisfaction of American housewives in the 1950s and 1960s.",
    shortDescription: "A groundbreaking book that launched second-wave feminism, examining the dissatisfaction of American housewives.",
    year: 1963,
    publisher: "W.W. Norton",
    language: "English",
    pages: 239,
    category: "non-fiction",
    tags: ["second-wave-feminism", "housewives", "dissatisfaction", "liberation"],
    coverImage: "/images/books/the-feminine-mystique.jpg",
    isFeatured: true
  },
  {
    title: "This Bridge Called My Back",
    author: "Cherríe Moraga and Gloria Anzaldúa",
    isbn: "978-0-914950-89-7",
    description: "A groundbreaking anthology that centers the voices of women of color in feminist discourse. This collection explores intersectionality, identity, and the importance of inclusive feminism.",
    shortDescription: "A groundbreaking anthology centering women of color in feminist discourse, exploring intersectionality and identity.",
    year: 1981,
    publisher: "Kitchen Table Press",
    language: "English",
    pages: 261,
    category: "essays",
    tags: ["women-of-color", "intersectionality", "feminism", "anthology"],
    coverImage: "/images/books/this-bridge-called-my-back.jpg",
    isBookClubSelection: true,
    bookClubDate: "2024-10-19T18:00:00Z"
  },
  {
    title: "The Beauty Myth",
    author: "Naomi Wolf",
    isbn: "978-0-06-051218-7",
    description: "An examination of how beauty standards are used to control and oppress women. Wolf argues that the beauty myth is a political weapon that keeps women from achieving equality.",
    shortDescription: "An examination of how beauty standards control and oppress women, arguing beauty is a political weapon.",
    year: 1990,
    publisher: "William Morrow",
    language: "English",
    pages: 348,
    category: "non-fiction",
    tags: ["beauty-standards", "oppression", "feminism", "body-image"],
    coverImage: "/images/books/the-beauty-myth.jpg",
    isBookClubSelection: true,
    bookClubDate: "2024-11-16T18:00:00Z"
  },
  {
    title: "Women, Race & Class",
    author: "Angela Davis",
    isbn: "978-0-394-71351-9",
    description: "A powerful analysis of the intersection of race, class, and gender in the women's movement. Davis examines the historical struggles of women of color and the importance of intersectional feminism.",
    shortDescription: "A powerful analysis of race, class, and gender intersection in the women's movement and historical struggles.",
    year: 1981,
    publisher: "Random House",
    language: "English",
    pages: 271,
    category: "academic",
    tags: ["intersectionality", "race", "class", "gender", "activism"],
    coverImage: "/images/books/women-race-class.jpg",
    isFeatured: true
  },
  {
    title: "The Vagina Monologues",
    author: "Eve Ensler",
    isbn: "978-0-375-75052-6",
    description: "A groundbreaking play that gives voice to women's experiences with their bodies, sexuality, and relationships. This powerful work has been performed worldwide and has sparked important conversations about women's rights.",
    shortDescription: "A groundbreaking play giving voice to women's experiences with their bodies, sexuality, and relationships.",
    year: 1996,
    publisher: "Villard",
    language: "English",
    pages: 192,
    category: "drama",
    tags: ["sexuality", "body-positivity", "women's-rights", "performance"],
    coverImage: "/images/books/the-vagina-monologues.jpg",
    isBookClubSelection: true,
    bookClubDate: "2024-12-21T18:00:00Z"
  },
  {
    title: "The Argonauts",
    author: "Maggie Nelson",
    isbn: "978-1-55597-735-1",
    description: "A genre-bending memoir that explores love, family, and identity. Nelson writes about her relationship with her gender-fluid partner and their journey to parenthood, challenging traditional notions of family and gender.",
    shortDescription: "A genre-bending memoir exploring love, family, and identity through a gender-fluid relationship and parenthood.",
    year: 2015,
    publisher: "Graywolf Press",
    language: "English",
    pages: 160,
    category: "memoir",
    tags: ["memoir", "gender-fluidity", "family", "love", "identity"],
    coverImage: "/images/books/the-argonauts.jpg",
    isBookClubSelection: true,
    bookClubDate: "2025-01-18T18:00:00Z"
  },
  {
    title: "Redefining Realness",
    author: "Janet Mock",
    isbn: "978-1-4767-4345-4",
    description: "A powerful memoir by transgender activist Janet Mock about her journey to self-acceptance and authenticity. This book provides important insights into the transgender experience and the importance of representation.",
    shortDescription: "A powerful memoir about transgender activist Janet Mock's journey to self-acceptance and authenticity.",
    year: 2014,
    publisher: "Atria Books",
    language: "English",
    pages: 263,
    category: "memoir",
    tags: ["transgender", "memoir", "activism", "identity", "representation"],
    coverImage: "/images/books/redefining-realness.jpg",
    isFeatured: true
  },
  {
    title: "The Immortal Life of Henrietta Lacks",
    author: "Rebecca Skloot",
    isbn: "978-1-4000-5217-2",
    description: "The story of Henrietta Lacks, whose cells were taken without her knowledge and used for medical research. This book explores issues of medical ethics, race, and the intersection of science and human rights.",
    shortDescription: "The story of Henrietta Lacks and her unknowing contribution to medical research, exploring ethics and race.",
    year: 2010,
    publisher: "Crown",
    language: "English",
    pages: 381,
    category: "non-fiction",
    tags: ["medical-ethics", "race", "science", "human-rights", "biography"],
    coverImage: "/images/books/henrietta-lacks.jpg",
    isBookClubSelection: true,
    bookClubDate: "2025-02-15T18:00:00Z"
  },
  {
    title: "The Warmth of Other Suns",
    author: "Isabel Wilkerson",
    isbn: "978-0-679-60407-5",
    description: "A comprehensive history of the Great Migration of African Americans from the South to the North and West. This book tells the stories of three individuals who made this journey, exploring themes of hope, resilience, and the search for freedom.",
    shortDescription: "A comprehensive history of the Great Migration, telling personal stories of hope, resilience, and freedom.",
    year: 2010,
    publisher: "Random House",
    language: "English",
    pages: 622,
    category: "non-fiction",
    tags: ["african-american-history", "migration", "resilience", "freedom"],
    coverImage: "/images/books/the-warmth-of-other-suns.jpg",
    isFeatured: true
  },
  {
    title: "Between the World and Me",
    author: "Ta-Nehisi Coates",
    isbn: "978-0-8129-9354-7",
    description: "A powerful letter from father to son about being black in America. Coates explores the history of racism, the fear and violence that shape black life, and the importance of understanding this history.",
    shortDescription: "A powerful letter about being black in America, exploring racism, fear, and the importance of understanding history.",
    year: 2015,
    publisher: "Spiegel & Grau",
    language: "English",
    pages: 152,
    category: "essays",
    tags: ["racism", "african-american-experience", "fatherhood", "history"],
    coverImage: "/images/books/between-the-world-and-me.jpg",
    isBookClubSelection: true,
    bookClubDate: "2025-03-15T18:00:00Z"
  },
  {
    title: "The New Jim Crow",
    author: "Michelle Alexander",
    isbn: "978-1-59558-643-8",
    description: "A groundbreaking analysis of mass incarceration in the United States and its role as a new form of racial control. Alexander argues that the war on drugs has created a new caste system that disproportionately affects African Americans.",
    shortDescription: "A groundbreaking analysis of mass incarceration as a new form of racial control in the United States.",
    year: 2010,
    publisher: "The New Press",
    language: "English",
    pages: 312,
    category: "academic",
    tags: ["mass-incarceration", "racism", "criminal-justice", "systemic-oppression"],
    coverImage: "/images/books/the-new-jim-crow.jpg",
    isFeatured: true
  },
  {
    title: "Sister Citizen",
    author: "Melissa Harris-Perry",
    isbn: "978-0-300-16541-5",
    description: "An examination of how African American women navigate the intersection of race and gender in American politics. Harris-Perry explores the unique challenges and opportunities faced by black women in public life.",
    shortDescription: "An examination of how African American women navigate race and gender in American politics.",
    year: 2011,
    publisher: "Yale University Press",
    language: "English",
    pages: 378,
    category: "academic",
    tags: ["african-american-women", "politics", "intersectionality", "public-life"],
    coverImage: "/images/books/sister-citizen.jpg",
    isBookClubSelection: true,
    bookClubDate: "2025-04-19T18:00:00Z"
  },
  {
    title: "The Fire Next Time",
    author: "James Baldwin",
    isbn: "978-0-679-74472-6",
    description: "A powerful collection of two essays that explore race relations in America. Baldwin writes with passion and insight about the African American experience and the urgent need for racial justice.",
    shortDescription: "A powerful collection of essays exploring race relations and the African American experience in America.",
    year: 1963,
    publisher: "Dial Press",
    language: "English",
    pages: 106,
    category: "essays",
    tags: ["race-relations", "african-american-experience", "justice", "civil-rights"],
    coverImage: "/images/books/the-fire-next-time.jpg",
    isFeatured: true
  },
  {
    title: "I Know Why the Caged Bird Sings",
    author: "Maya Angelou",
    isbn: "978-0-345-44761-7",
    description: "The first volume of Maya Angelou's autobiography, telling the story of her childhood and early adulthood. This powerful work explores themes of racism, trauma, resilience, and the power of literature and education.",
    shortDescription: "Maya Angelou's powerful autobiography exploring racism, trauma, resilience, and the power of education.",
    year: 1969,
    publisher: "Random House",
    language: "English",
    pages: 289,
    category: "memoir",
    tags: ["autobiography", "racism", "resilience", "education", "literature"],
    coverImage: "/images/books/i-know-why-the-caged-bird-sings.jpg",
    isBookClubSelection: true,
    bookClubDate: "2025-05-17T18:00:00Z"
  }
];

export async function migrateBooks() {
  try {
    console.log('📖 Starting books migration...');
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const bookData of booksData) {
      try {
        // Check if book already exists
        const existingBook = await Book.findOne({ title: bookData.title });
        if (existingBook) {
          console.log(`⏭️  Skipping existing book: ${bookData.title}`);
          skippedCount++;
          continue;
        }
        
        // Create book
        const book = new Book({
          ...bookData,
          slug: slugify(bookData.title),
          status: 'active',
          viewCount: Math.floor(Math.random() * 500), // Random view count for demo
          rating: Math.floor(Math.random() * 5) + 1, // Random rating 1-5
          reviewCount: Math.floor(Math.random() * 50) // Random review count
        });
        
        await book.save();
        console.log(`✅ Migrated: ${bookData.title}`);
        migratedCount++;
        
      } catch (error) {
        console.error(`❌ Error migrating book "${bookData.title}":`, error);
      }
    }
    
    console.log(`\n📊 Books migration summary:`);
    console.log(`   ✅ Migrated: ${migratedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   📚 Total: ${booksData.length}`);
    
  } catch (error) {
    console.error('❌ Error in books migration:', error);
    throw error;
  }
}
