import { NextRequest, NextResponse } from 'next/server';

// Books data from EV CONTEXT.md
const books = [
  {
    _id: '1',
    title: 'Purple Hibiscus',
    author: 'Chimamanda Ngozi Adichie',
    coverImage: {
      url: '/images/purple-hibiscus.jpeg',
      alt: 'Purple Hibiscus book cover'
    },
    description: 'A powerful coming-of-age story about a young Nigerian girl navigating family, religion, and political upheaval.',
    category: 'Fiction',
    publishedYear: 2003,
    featured: true,
    tags: ['Fiction', 'Nigeria', 'Coming of Age', 'Family'],
    isbn: '978-0-06-056005-4',
    pages: 307,
    language: 'English',
    available: true
  },
  {
    _id: '2',
    title: 'The Sex Lives of African Women',
    author: 'Nana Darkoa Sekyiamah',
    coverImage: {
      url: '/images/The-sex-lives-of-african women.jpeg',
      alt: 'The Sex Lives of African Women book cover'
    },
    description: 'An intimate collection of stories about African women\'s sexual experiences, desires, and liberation.',
    category: 'Non-Fiction',
    publishedYear: 2021,
    featured: true,
    tags: ['Sexuality', 'African Women', 'Liberation', 'Personal Stories'],
    isbn: '978-1-913-620-00-0',
    pages: 256,
    language: 'English',
    available: true
  },
  {
    _id: '3',
    title: 'Feminism for The African Woman',
    author: 'Lyna Dommie Namasaka',
    coverImage: {
      url: '/images/books hero.jpeg',
      alt: 'Feminism for The African Woman book cover'
    },
    description: 'A comprehensive guide to feminist theory and practice specifically tailored for African women.',
    category: 'Non-Fiction',
    publishedYear: 2020,
    featured: false,
    tags: ['Feminism', 'African Women', 'Theory', 'Practice'],
    isbn: '978-1-234-567-89-0',
    pages: 180,
    language: 'English',
    available: true
  },
  {
    _id: '4',
    title: 'All About Love',
    author: 'Bell Hooks',
    coverImage: {
      url: '/images/all-about-love.jpeg',
      alt: 'All About Love book cover'
    },
    description: 'A revolutionary work that redefines love and its role in our personal and political lives.',
    category: 'Non-Fiction',
    publishedYear: 2000,
    featured: true,
    tags: ['Love', 'Relationships', 'Feminism', 'Personal Growth'],
    isbn: '978-0-06-095947-0',
    pages: 240,
    language: 'English',
    available: true
  },
  {
    _id: '5',
    title: 'Decolonization and Afrofeminism',
    author: 'Sylvia Tamale',
    coverImage: {
      url: '/images/Decolonization-and-afrofeminism.jpeg',
      alt: 'Decolonization and Afrofeminism book cover'
    },
    description: 'A critical examination of decolonization through an Afrofeminist lens, challenging Western feminist paradigms.',
    category: 'Non-Fiction',
    publishedYear: 2020,
    featured: true,
    tags: ['Decolonization', 'Afrofeminism', 'Theory', 'Critique'],
    isbn: '978-1-988-832-00-0',
    pages: 320,
    language: 'English',
    available: true
  },
  {
    _id: '6',
    title: 'Only Big Bumbum Matters Tomorrow',
    author: 'Damilare Kuku',
    coverImage: {
      url: '/images/books hero.jpeg',
      alt: 'Only Big Bumbum Matters Tomorrow book cover'
    },
    description: 'A collection of humorous and insightful essays about contemporary Nigerian life and culture.',
    category: 'Fiction',
    publishedYear: 2021,
    featured: false,
    tags: ['Humor', 'Nigeria', 'Contemporary', 'Essays'],
    isbn: '978-1-234-567-90-6',
    pages: 200,
    language: 'English',
    available: true
  },
  {
    _id: '7',
    title: 'The Body is Not an Apology',
    author: 'Sonya Renee Taylor',
    coverImage: {
      url: '/images/The-sex-lives-of-african women.jpeg',
      alt: 'The Body is Not an Apology book cover'
    },
    description: 'A radical self-love manifesto that challenges body shame and promotes radical self-acceptance.',
    category: 'Non-Fiction',
    publishedYear: 2018,
    featured: true,
    tags: ['Body Positivity', 'Self-Love', 'Activism', 'Mental Health'],
    isbn: '978-1-627-873-00-0',
    pages: 200,
    language: 'English',
    available: true
  },
  {
    _id: '8',
    title: 'Our Sister Killjoy',
    author: 'Ama Ata Aidoo',
    coverImage: {
      url: '/images/books hero.jpeg',
      alt: 'Our Sister Killjoy book cover'
    },
    description: 'A groundbreaking novel exploring themes of exile, identity, and the African diaspora experience.',
    category: 'Fiction',
    publishedYear: 1977,
    featured: false,
    tags: ['Diaspora', 'Identity', 'Exile', 'African Literature'],
    isbn: '978-0-435-910-00-0',
    pages: 120,
    language: 'English',
    available: true
  },
  {
    _id: '9',
    title: 'The Master\'s Tools Will Never Dismantle The Master\'s House',
    author: 'Audre Lorde',
    coverImage: {
      url: '/images/books hero.jpeg',
      alt: 'The Master\'s Tools Will Never Dismantle The Master\'s House book cover'
    },
    description: 'A collection of essays that challenge the limitations of mainstream feminism and advocate for intersectional approaches.',
    category: 'Non-Fiction',
    publishedYear: 1984,
    featured: true,
    tags: ['Intersectionality', 'Feminism', 'Activism', 'Theory'],
    isbn: '978-0-912-304-00-0',
    pages: 190,
    language: 'English',
    available: true
  },
  {
    _id: '10',
    title: 'Damu Nyeusi',
    author: 'Ken Walibora',
    coverImage: {
      url: '/images/books hero.jpeg',
      alt: 'Damu Nyeusi book cover'
    },
    description: 'A Swahili novel exploring themes of identity, culture, and social change in contemporary Kenya.',
    category: 'Fiction',
    publishedYear: 2010,
    featured: false,
    tags: ['Swahili Literature', 'Kenya', 'Identity', 'Culture'],
    isbn: '978-9-988-123-45-6',
    pages: 250,
    language: 'Swahili',
    available: true
  },
  {
    _id: '11',
    title: 'Becoming Cliterate',
    author: 'Laurie Mintz',
    coverImage: {
      url: '/images/books hero.jpeg',
      alt: 'Becoming Cliterate book cover'
    },
    description: 'A comprehensive guide to women\'s sexual pleasure and empowerment.',
    category: 'Non-Fiction',
    publishedYear: 2017,
    featured: false,
    tags: ['Sexuality', 'Women\'s Health', 'Empowerment', 'Education'],
    isbn: '978-0-062-640-00-0',
    pages: 320,
    language: 'English',
    available: true
  },
  {
    _id: '12',
    title: 'Kaburi Bila Msalaba',
    author: 'P.M. Kareithi',
    coverImage: {
      url: '/images/books hero.jpeg',
      alt: 'Kaburi Bila Msalaba book cover'
    },
    description: 'A Swahili novel about social justice and resistance in colonial Kenya.',
    category: 'Fiction',
    publishedYear: 1969,
    featured: false,
    tags: ['Swahili Literature', 'Colonialism', 'Resistance', 'Kenya'],
    isbn: '978-9-988-123-46-3',
    pages: 180,
    language: 'Swahili',
    available: true
  },
  {
    _id: '13',
    title: 'We Should All Be Feminists',
    author: 'Chimamanda Ngozi Adichie',
    coverImage: {
      url: '/images/books hero.jpeg',
      alt: 'We Should All Be Feminists book cover'
    },
    description: 'A powerful essay adapted from Adichie\'s TEDx talk, making a case for feminism in the 21st century.',
    category: 'Non-Fiction',
    publishedYear: 2014,
    featured: true,
    tags: ['Feminism', 'TED Talk', 'Modern Feminism', 'Accessible'],
    isbn: '978-0-307-962-00-0',
    pages: 64,
    language: 'English',
    available: true
  },
  {
    _id: '14',
    title: 'Notes on Grief',
    author: 'Chimamanda Ngozi Adichie',
    coverImage: {
      url: '/images/books hero.jpeg',
      alt: 'Notes on Grief book cover'
    },
    description: 'A deeply personal meditation on loss, grief, and the process of mourning.',
    category: 'Non-Fiction',
    publishedYear: 2021,
    featured: false,
    tags: ['Grief', 'Loss', 'Personal', 'Healing'],
    isbn: '978-0-525-520-00-0',
    pages: 80,
    language: 'English',
    available: true
  },
  {
    _id: '15',
    title: 'How Europe Underdeveloped Africa',
    author: 'Walter Rodney',
    coverImage: {
      url: '/images/books hero.jpeg',
      alt: 'How Europe Underdeveloped Africa book cover'
    },
    description: 'A seminal work analyzing the historical roots of Africa\'s underdevelopment through European colonialism.',
    category: 'Non-Fiction',
    publishedYear: 1972,
    featured: true,
    tags: ['History', 'Colonialism', 'Development', 'Africa'],
    isbn: '978-0-882-580-00-0',
    pages: 312,
    language: 'English',
    available: true
  },
  {
    _id: '16',
    title: 'Nearly All Men in Lagos Are Mad',
    author: 'Damilare Kuku',
    coverImage: {
      url: '/images/books hero.jpeg',
      alt: 'Nearly All Men in Lagos Are Mad book cover'
    },
    description: 'A humorous collection of stories about dating and relationships in modern Lagos.',
    category: 'Fiction',
    publishedYear: 2021,
    featured: false,
    tags: ['Humor', 'Dating', 'Lagos', 'Relationships'],
    isbn: '978-1-234-567-91-3',
    pages: 180,
    language: 'English',
    available: true
  },
  {
    _id: '17',
    title: 'The Looting Machine',
    author: 'Tom Burgis',
    coverImage: {
      url: '/images/books hero.jpeg',
      alt: 'The Looting Machine book cover'
    },
    description: 'An investigation into how Africa\'s natural resources are exploited by global corporations and corrupt elites.',
    category: 'Non-Fiction',
    publishedYear: 2015,
    featured: false,
    tags: ['Resource Extraction', 'Corruption', 'Global Economics', 'Africa'],
    isbn: '978-0-062-280-00-0',
    pages: 320,
    language: 'English',
    available: true
  },
  {
    _id: '18',
    title: 'The Confessions of African Women',
    author: 'Joan Thatiah',
    coverImage: {
      url: '/images/books hero.jpeg',
      alt: 'The Confessions of African Women book cover'
    },
    description: 'A collection of personal stories and confessions from African women across the continent.',
    category: 'Non-Fiction',
    publishedYear: 2019,
    featured: false,
    tags: ['Personal Stories', 'African Women', 'Confessions', 'Identity'],
    isbn: '978-1-234-567-92-0',
    pages: 240,
    language: 'English',
    available: true
  },
  {
    _id: '19',
    title: 'Dream Count',
    author: 'Chimamanda Ngozi Adichie',
    coverImage: {
      url: '/images/books hero.jpeg',
      alt: 'Dream Count book cover'
    },
    description: 'A collection of short stories exploring themes of love, loss, and the immigrant experience.',
    category: 'Fiction',
    publishedYear: 2018,
    featured: false,
    tags: ['Short Stories', 'Immigration', 'Love', 'Loss'],
    isbn: '978-1-234-567-93-7',
    pages: 150,
    language: 'English',
    available: true
  },
  {
    _id: '20',
    title: 'Half of a Yellow Sun',
    author: 'Chimamanda Ngozi Adichie',
    coverImage: {
      url: '/images/books hero.jpeg',
      alt: 'Half of a Yellow Sun book cover'
    },
    description: 'A powerful novel set during the Nigerian Civil War, exploring themes of love, loss, and national identity.',
    category: 'Fiction',
    publishedYear: 2006,
    featured: true,
    tags: ['Nigerian Civil War', 'Historical Fiction', 'Love', 'Identity'],
    isbn: '978-0-307-264-00-0',
    pages: 433,
    language: 'English',
    available: true
  },
  {
    _id: '21',
    title: 'Unbowed: One Woman\'s Story',
    author: 'Wangari Maathai',
    coverImage: {
      url: '/images/books hero.jpeg',
      alt: 'Unbowed: One Woman\'s Story book cover'
    },
    description: 'The autobiography of Nobel Peace Prize winner Wangari Maathai, founder of the Green Belt Movement.',
    category: 'Non-Fiction',
    publishedYear: 2006,
    featured: true,
    tags: ['Autobiography', 'Environment', 'Activism', 'Nobel Prize'],
    isbn: '978-0-307-263-00-0',
    pages: 314,
    language: 'English',
    available: true
  },
  {
    _id: '22',
    title: 'The Challenge for Africa',
    author: 'Wangari Maathai',
    coverImage: {
      url: '/images/books hero.jpeg',
      alt: 'The Challenge for Africa book cover'
    },
    description: 'A comprehensive analysis of Africa\'s challenges and opportunities in the 21st century.',
    category: 'Non-Fiction',
    publishedYear: 2009,
    featured: false,
    tags: ['Africa', 'Development', 'Environment', 'Politics'],
    isbn: '978-0-307-263-01-7',
    pages: 320,
    language: 'English',
    available: true
  },
  {
    _id: '23',
    title: 'Everyday Ubuntu: Living Together',
    author: 'Mungi Ngomane',
    coverImage: {
      url: '/images/books hero.jpeg',
      alt: 'Everyday Ubuntu: Living Together book cover'
    },
    description: 'A practical guide to living the Ubuntu philosophy of interconnectedness and community.',
    category: 'Non-Fiction',
    publishedYear: 2019,
    featured: false,
    tags: ['Ubuntu', 'Philosophy', 'Community', 'Interconnectedness'],
    isbn: '978-0-525-520-01-7',
    pages: 200,
    language: 'English',
    available: true
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const language = searchParams.get('language') || '';
    const sort = searchParams.get('sort') || 'title';

    let filteredBooks = [...books];

    // Filter by search term
    if (search) {
      filteredBooks = filteredBooks.filter(book =>
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase()) ||
        book.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Filter by category
    if (category && category !== 'All') {
      filteredBooks = filteredBooks.filter(book => book.category === category);
    }

    // Filter by language
    if (language && language !== 'All') {
      filteredBooks = filteredBooks.filter(book => book.language === language);
    }

    // Sort books
    switch (sort) {
      case 'title':
        filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'author':
        filteredBooks.sort((a, b) => a.author.localeCompare(b.author));
        break;
      case 'year':
        filteredBooks.sort((a, b) => b.publishedYear - a.publishedYear);
        break;
      case 'featured':
        filteredBooks.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      default:
        filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
    }

    return NextResponse.json({
      success: true,
      books: filteredBooks,
      total: filteredBooks.length
    });

  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}
