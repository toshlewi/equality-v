import { connectDB } from '@/lib/mongodb';
import Publication from '@/models/Publication';
import Book from '@/models/Book';
import Category from '@/models/Category';

// Publication data mapping PDFs to titles
const publicationsData = [
  {
    title: "Digital Health Rights",
    slug: "digital-health-rights",
    author: "Equality Vanguard Research Team",
    description: "An exploration of digital health rights and the intersection of technology and health equity.",
    excerpt: "This comprehensive article examines how digital health technologies can both enhance and threaten individual rights, particularly for marginalized communities.",
    category: "article",
    tags: ["digital-rights", "health", "technology", "rights"],
    pdfUrl: "/files/publications/DIGITAL HEALTH AND RIGHTS.pdf",
    featuredImage: "",
    status: "published",
    isFeatured: true
  },
  {
    title: "Digital Inclusion for Women",
    slug: "digital-inclusion-for-women",
    author: "Equality Vanguard Research Team",
    description: "Addressing the digital divide and ensuring women's participation in digital spaces.",
    excerpt: "This report investigates barriers to digital inclusion for women and proposes solutions for equitable access to digital resources.",
    category: "report",
    tags: ["digital-inclusion", "women", "technology", "equity"],
    pdfUrl: "/files/publications/DIGITAL INCLUSION FOR WOMEN.pdf",
    featuredImage: "",
    status: "published",
    isFeatured: true
  },
  {
    title: "Femicide Piece",
    slug: "femicide-piece",
    author: "Equality Vanguard Research Team",
    description: "An in-depth analysis of femicide and its devastating impact on women's lives.",
    excerpt: "This critical piece examines the systemic nature of femicide and the urgent need for comprehensive solutions.",
    category: "article",
    tags: ["femicide", "violence", "women", "advocacy"],
    pdfUrl: "/files/publications/FEMICIDE PIECE NEW (1).pdf",
    featuredImage: "",
    status: "published",
    isFeatured: false
  },
  {
    title: "Grooming in Kenyan High Schools",
    slug: "grooming-kenyan-high-schools",
    author: "Equality Vanguard Research Team",
    description: "Addressing the critical issue of grooming and sexual exploitation in educational settings.",
    excerpt: "This investigation exposes grooming practices in Kenyan high schools and calls for urgent interventions.",
    category: "report",
    tags: ["grooming", "education", "safety", "kenya"],
    pdfUrl: "/files/publications/GROOMING IN KENYAN HIGH SCHOOLS.pdf",
    featuredImage: "",
    status: "published",
    isFeatured: true
  },
  {
    title: "International Women's Month",
    slug: "international-womens-month",
    author: "Equality Vanguard Editorial Team",
    description: "Celebrating women's achievements and continued struggle for equality worldwide.",
    excerpt: "A reflection on International Women's Month and the ongoing fight for women's rights globally.",
    category: "article",
    tags: ["international-womens-day", "equality", "celebration", "activism"],
    pdfUrl: "/files/publications/INTERNATIONAL WOMENS MONTH.pdf",
    featuredImage: "",
    status: "published",
    isFeatured: false
  },
  {
    title: "Kiherehere: Proudly Claiming the Label",
    slug: "kiherehere-proudly-claiming-label",
    author: "Equality Vanguard Editorial Team",
    description: "Exploring identity, label reclamation, and empowerment through feminist perspectives.",
    excerpt: "This piece examines the power of proudly claiming labels and identities in the feminist movement.",
    category: "article",
    tags: ["identity", "empowerment", "feminism", "self-expression"],
    pdfUrl: "/files/publications/KIHEREHERE PROUDLY CLAIMING THE LABEL.pdf",
    featuredImage: "",
    status: "published",
    isFeatured: false
  },
  {
    title: "Layers of Oppression",
    slug: "layers-of-oppression",
    author: "Equality Vanguard Research Team",
    description: "An intersectional analysis of the multiple layers of oppression affecting women.",
    excerpt: "This comprehensive article unpacks the complex layers of oppression that impact different women differently.",
    category: "article",
    tags: ["intersectionality", "oppression", "analysis", "feminism"],
    pdfUrl: "/files/publications/LAYERS OF OPPRESSION.pdf",
    featuredImage: "",
    status: "published",
    isFeatured: true
  },
  {
    title: "Misogynistic Humour",
    slug: "misogynistic-humour",
    author: "Equality Vanguard Research Team",
    description: "Examining the impact of misogynistic humor and its normalization in society.",
    excerpt: "This analysis explores how misogynistic humor perpetuates harmful stereotypes and contributes to gender inequality.",
    category: "article",
    tags: ["misogyny", "humor", "gender", "culture"],
    pdfUrl: "/files/publications/MISOGYNISTIC HUMOUR.pdf",
    featuredImage: "",
    status: "published",
    isFeatured: false
  },
  {
    title: "My Body is Not an Apology",
    slug: "my-body-not-apology",
    author: "Equality Vanguard Editorial Team",
    description: "Celebrating body autonomy and rejecting shame around women's bodies.",
    excerpt: "A powerful piece advocating for body autonomy and challenging societal expectations of women's bodies.",
    category: "article",
    tags: ["body-autonomy", "self-acceptance", "health", "empowerment"],
    pdfUrl: "/files/publications/My Body Is Not An Apology .pdf",
    featuredImage: "",
    status: "published",
    isFeatured: true
  },
  {
    title: "My Mother's Hurt",
    slug: "my-mothers-hurt",
    author: "Equality Vanguard Editorial Team",
    description: "A personal reflection on intergenerational trauma and healing.",
    excerpt: "This poignant piece explores the ways in which trauma is passed down and how healing can begin.",
    category: "article",
    tags: ["trauma", "healing", "motherhood", "personal"],
    pdfUrl: "/files/publications/MY MOTHERS HURT.pdf",
    featuredImage: "",
    status: "published",
    isFeatured: false
  },
  {
    title: "Period Poverty",
    slug: "period-poverty",
    author: "Equality Vanguard Research Team",
    description: "Addressing the critical issue of period poverty and menstrual health accessibility.",
    excerpt: "This research highlights the intersection of poverty, gender, and menstrual health rights.",
    category: "report",
    tags: ["period-poverty", "health", "poverty", "menstrual-rights"],
    pdfUrl: "/files/publications/PERIOD POVERTY.pdf",
    featuredImage: "",
    status: "published",
    isFeatured: true
  },
  {
    title: "Pixelated Power: Reclaiming Our Digital Space for Feminist Futures",
    slug: "pixelated-power-reclaiming-digital-space",
    author: "Equality Vanguard Research Team",
    description: "Exploring feminist activism in digital spaces and online empowerment.",
    excerpt: "This forward-looking piece examines how feminists are reclaiming digital spaces and building online communities of resistance.",
    category: "article",
    tags: ["digital-activism", "feminism", "online", "empowerment"],
    pdfUrl: "/files/publications/Pixelated Power Reclaiming Our Digital Space for Feminist Futures.pdf",
    featuredImage: "",
    status: "published",
    isFeatured: true
  },
  {
    title: "Rainbow Resistance",
    slug: "rainbow-resistance",
    author: "Equality Vanguard Editorial Team",
    description: "Celebrating LGBTQ+ resistance and resilience in the face of oppression.",
    excerpt: "A tribute to the powerful resistance and resilience of the LGBTQ+ community.",
    category: "article",
    tags: ["lgbtq", "resistance", "activism", "diversity"],
    pdfUrl: "/files/publications/RAINBOW RESISTANCE.pdf",
    featuredImage: "",
    status: "published",
    isFeatured: false
  },
  {
    title: "Reimagining Humanity Through SRHR",
    slug: "reimagining-humanity-srhr",
    author: "Equality Vanguard Research Team",
    description: "Exploring sexual and reproductive health and rights as fundamental human rights.",
    excerpt: "This comprehensive analysis positions SRHR as central to reimagining a more just and equitable humanity.",
    category: "report",
    tags: ["srhr", "rights", "health", "humanity"],
    pdfUrl: "/files/publications/REIMAGINING HUMANITY THROUGH SRHR.pdf",
    featuredImage: "",
    status: "published",
    isFeatured: true
  },
  {
    title: "Sex, Shame, and the White Coat",
    slug: "sex-shame-white-coat",
    author: "Equality Vanguard Editorial Team",
    description: "Exposing shame in healthcare and advocating for dignity in medical settings.",
    excerpt: "This critical piece examines how shame and stigma affect women's experiences in healthcare settings.",
    category: "article",
    tags: ["healthcare", "shame", "women", "medical"],
    pdfUrl: "/files/publications/Sex, Shame, and the White Coat.pdf",
    featuredImage: "",
    status: "published",
    isFeatured: false
  },
  {
    title: "Sexual Assault Awareness Month",
    slug: "sexual-assault-awareness-month",
    author: "Equality Vanguard Editorial Team",
    description: "Raising awareness about sexual assault and supporting survivors.",
    excerpt: "This important piece highlights the need for ongoing awareness and support for survivors of sexual assault.",
    category: "article",
    tags: ["sexual-assault", "awareness", "support", "survivors"],
    pdfUrl: "/files/publications/SEXUAL ASSAULT AWARENESS MONTH.pdf",
    featuredImage: "",
    status: "published",
    isFeatured: true
  },
  {
    title: "Silencing the Truth: How News Media Shields Perpetrators of Femicide",
    slug: "silencing-truth-news-media-femicide",
    author: "Equality Vanguard Research Team",
    description: "Examining media complicity in normalizing femicide and protecting perpetrators.",
    excerpt: "This investigative piece reveals how news media often shields perpetrators of femicide through biased reporting.",
    category: "article",
    tags: ["femicide", "media", "accountability", "journalism"],
    pdfUrl: "/files/publications/SILENCING THE TRUTH HOW NEWS MEDIA SHIELDS PERPETRATORS OF FEMICIDE.pdf",
    featuredImage: "",
    status: "published",
    isFeatured: true
  },
  {
    title: "Since We Last Spoke",
    slug: "since-we-last-spoke",
    author: "Equality Vanguard Editorial Team",
    description: "A reflection on conversations, connections, and continued resistance.",
    excerpt: "This thoughtful piece explores the power of dialogue and collective voice in feminist organizing.",
    category: "article",
    tags: ["dialogue", "connection", "community", "reflection"],
    pdfUrl: "/files/publications/SINCE WE LAST SPOKE (1).pdf",
    featuredImage: "",
    status: "published",
    isFeatured: false
  },
  {
    title: "SRHR in Africa: Wins and Challenges in 2024",
    slug: "srhr-africa-wins-challenges-2024",
    author: "Equality Vanguard Research Team",
    description: "A comprehensive analysis of SRHR progress and challenges across Africa in 2024.",
    excerpt: "This report tracks significant wins and ongoing challenges in sexual and reproductive health and rights across Africa.",
    category: "report",
    tags: ["srhr", "africa", "2024", "challenges"],
    pdfUrl: "/files/publications/SRHR IN AFRICA WINS AND CHALLENGES IN 2024.pdf",
    featuredImage: "",
    status: "published",
    isFeatured: true
  },
  {
    title: "Standing on Kimberle Crenshaw's Shoulders",
    slug: "standing-kimberle-crenshaw-shoulders",
    author: "Equality Vanguard Editorial Team",
    description: "Celebrating Kimberle Crenshaw's foundational work on intersectionality.",
    excerpt: "This tribute honors Kimberle Crenshaw's groundbreaking work on intersectionality and its continued relevance today.",
    category: "article",
    tags: ["intersectionality", "kimberle-crenshaw", "scholarship", "feminism"],
    pdfUrl: "/files/publications/STANDING ON KIMBERLE CRENSHAW SHOULDERS.pdf",
    featuredImage: "",
    status: "published",
    isFeatured: true
  },
  {
    title: "The Grip of Extremism",
    slug: "grip-extremism",
    author: "Equality Vanguard Research Team",
    description: "Analyzing the rise of extremism and its impact on women's rights.",
    excerpt: "This critical analysis examines how rising extremism threatens women's rights and feminist progress.",
    category: "article",
    tags: ["extremism", "women-rights", "threats", "analysis"],
    pdfUrl: "/files/publications/THE GRIP OF EXTREMISM.pdf",
    featuredImage: "",
    status: "published",
    isFeatured: false
  },
  {
    title: "The Hidden Economy of Women's Unpaid Labour",
    slug: "hidden-economy-women-unpaid-labour",
    author: "Equality Vanguard Research Team",
    description: "Exposing the economic value of women's unpaid labor and its systemic undervaluation.",
    excerpt: "This groundbreaking research quantifies the hidden economic value of women's unpaid labor and calls for recognition and compensation.",
    category: "report",
    tags: ["unpaid-labor", "economics", "gender", "value"],
    pdfUrl: "/files/publications/THE HIDDEN ECONOMY OF WOMEN'S UNPAID LABOUR.pdf",
    featuredImage: "",
    status: "published",
    isFeatured: true
  },
  {
    title: "Why Femicide Marches Matter",
    slug: "why-femicide-marches-matter",
    author: "Equality Vanguard Editorial Team",
    description: "The importance of public demonstrations against femicide and gender-based violence.",
    excerpt: "This powerful piece explains why taking to the streets matters in the fight against femicide and gender-based violence.",
    category: "article",
    tags: ["femicide", "marches", "activism", "protest"],
    pdfUrl: "/files/publications/WHY FEMICIDE MARCHES MATTER.pdf",
    featuredImage: "",
    status: "published",
    isFeatured: false
  }
];

// Books data
const booksData = [
  { title: "Purple Hibiscus", author: "Chimamanda Ngozi Adichie", isbn: "978-1-250-00458-7", genre: "Fiction", category: "fiction", tags: ["feminism", "africa", "coming-of-age", "family"] },
  { title: "The Sex Lives of African Women", author: "Nana Darkoa Sekyiamah", isbn: "978-0-385-54832-4", genre: "Non-Fiction", category: "non-fiction", tags: ["sexuality", "africa", "women", "empowerment"] },
  { title: "Feminism for The African Woman", author: "Lyna Dommie Namasaka", isbn: "978-0-00-847639-2", genre: "Non-Fiction", category: "non-fiction", tags: ["feminism", "africa", "women", "theory"] },
  { title: "All About Love", author: "bell hooks", isbn: "978-0-06-095947-0", genre: "Non-Fiction", category: "non-fiction", tags: ["love", "feminism", "relationships", "philosophy"] },
  { title: "Decolonization and Afrofeminism", author: "Sylvia Tamale", isbn: "978-1-77259-156-0", genre: "Academic", category: "academic", tags: ["decolonization", "afrofeminism", "africa", "academic"] },
  { title: "Only Big Bumbum Matters Tomorrow", author: "Damilare Kuku", isbn: "978-0-241-58961-6", genre: "Fiction", category: "fiction", tags: ["nigeria", "women", "comedy", "contemporary"] },
  { title: "The Body is Not an Apology", author: "Sonya Renee Taylor", isbn: "978-1-5235-0638-9", genre: "Non-Fiction", category: "non-fiction", tags: ["body-positivity", "self-love", "empowerment", "activism"] },
  { title: "Our Sister Killjoy", author: "Ama Ata Aidoo", isbn: "978-0-435-90920-1", genre: "Fiction", category: "fiction", tags: ["africa", "diaspora", "women", "migration"] },
  { title: "The Master's Tools Will Never Dismantle The Master's House", author: "Audre Lorde", isbn: "978-0-14-119027-5", genre: "Essays", category: "other", tags: ["feminism", "racism", "activism", "essays"] },
  { title: "Damu Nyeusi", author: "Ken Walibora", isbn: "978-9966-46-597-3", genre: "Fiction", category: "fiction", tags: ["kenya", "literature", "culture", "identity"] },
  { title: "Becoming Cliterate", author: "Laurie Mintz", isbn: "978-0-06-234223-2", genre: "Non-Fiction", category: "non-fiction", tags: ["sexuality", "women", "health", "empowerment"] },
  { title: "Kaburi Bila Msalaba", author: "P.M. Kareithi", isbn: "978-9966-21-900-6", genre: "Fiction", category: "fiction", tags: ["kenya", "literature", "historical", "drama"] },
  { title: "We Should All Be Feminists", author: "Chimamanda Ngozi Adichie", isbn: "978-0-307-96212-2", genre: "Essays", category: "other", tags: ["feminism", "gender", "essays", "equality"] },
  { title: "Notes on Grief", author: "Chimamanda Ngozi Adichie", isbn: "978-0-00-847839-6", genre: "Non-Fiction", category: "non-fiction", tags: ["grief", "loss", "memoir", "personal"] },
  { title: "How Europe Underdeveloped Africa", author: "Walter Rodney", isbn: "978-0-914478-36-2", genre: "Academic", category: "academic", tags: ["history", "africa", "imperialism", "economics"] },
  { title: "Nearly All Men in Lagos Are Mad", author: "Damilare Kuku", isbn: "978-0-241-58960-9", genre: "Fiction", category: "fiction", tags: ["nigeria", "comedy", "relationships", "contemporary"] },
  { title: "The Looting Machine", author: "Tom Burgis", isbn: "978-1-61219-292-5", genre: "Non-Fiction", category: "non-fiction", tags: ["economics", "africa", "corruption", "investigative"] },
  { title: "The Confessions of African Women", author: "Joan Thatiah", isbn: "978-0-9969656-0-8", genre: "Non-Fiction", category: "non-fiction", tags: ["women", "africa", "personal", "stories"] },
  { title: "Dream Count", author: "Chimamanda Ngozi Adichie", isbn: "978-0-06-331839-9", genre: "Fiction", category: "fiction", tags: ["fiction", "contemporary", "literature", "accomplishment"] },
  { title: "Half of a Yellow Sun", author: "Chimamanda Ngozi Adichie", isbn: "978-0-00-733218-8", genre: "Fiction", category: "fiction", tags: ["nigeria", "biafra", "war", "historical"] },
  { title: "Unbowed: One Woman's Story", author: "Wangari Maathai", isbn: "978-0-307-26629-4", genre: "Memoir", category: "biography", tags: ["environment", "kenya", "activism", "nobel"] },
  { title: "The Challenge for Africa", author: "Wangari Maathai", isbn: "978-0-307-47406-0", genre: "Non-Fiction", category: "non-fiction", tags: ["africa", "development", "environment", "policy"] },
  { title: "Everyday Ubuntu: Living Together", author: "Mungi Ngomane", isbn: "978-0-06-279698-9", genre: "Non-Fiction", category: "non-fiction", tags: ["ubuntu", "philosophy", "community", "humanity"] }
];

async function clearAndImport() {
  try {
    console.log('🗑️  Clearing existing data...');
    await connectDB();
    
    // Delete all existing publications and books
    await Publication.deleteMany({});
    await Book.deleteMany({});
    
    console.log('✅ Existing data cleared');
    
    console.log('\n📚 Importing publications...');
    const publications = publicationsData.map(pub => ({
      ...pub,
      content: `<div class="publication-content"><p>${pub.excerpt}</p><p>Full content available as PDF. Click the download button above to access the complete publication.</p></div>`,
      images: [], // Empty array for now, will be populated when PDF is processed
      type: 'pdf',
      status: 'pending', // Start as pending for review
      publishedAt: new Date()
    }));
    
    await Publication.insertMany(publications);
    console.log(`✅ Imported ${publications.length} publications`);
    
    console.log('\n📖 Importing books...');
    const categoryMap: Record<string, string> = {
      'fiction': 'fiction',
      'non-fiction': 'non-fiction', 
      'academic': 'academic',
      'biography': 'other',
      'memoir': 'memoir',
      'essays': 'essays',
      'poetry': 'poetry',
      'other': 'other'
    };
    
    const books = booksData.map(book => ({
      ...book,
      description: `A compelling work by ${book.author}.`,
      shortDescription: `${book.title} by ${book.author}`,
      slug: book.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
      status: 'pending', // Start as pending for review
      category: categoryMap[book.category] || 'other',
      isFeatured: Math.random() > 0.5,
      coverUrl: '', // Will be populated when cover images are uploaded
      year: new Date().getFullYear() - Math.floor(Math.random() * 25)
    }));
    
    await Book.insertMany(books);
    console.log(`✅ Imported ${books.length} books`);
    
    console.log('\n🎉 Import completed successfully!');
    
    // Show summary
    const [pubCount, bookCount] = await Promise.all([
      Publication.countDocuments(),
      Book.countDocuments()
    ]);

    console.log('\n📊 Final Counts:');
    console.log(`- Publications: ${pubCount}`);
    console.log(`- Books: ${bookCount}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    process.exit(0);
  }
}

clearAndImport();
