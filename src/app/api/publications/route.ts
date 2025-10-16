import { NextRequest, NextResponse } from 'next/server';

// Publications data from EV CONTEXT.md
const publications = [
  {
    _id: '1',
    title: 'Digital health rights article',
    author: 'Equality Vanguard Team',
    coverImage: {
      url: '/images/legal hero.jpeg',
      alt: 'Digital health rights article cover'
    },
    description: 'Exploring the intersection of digital technology and health rights for women and marginalized communities.',
    category: 'Article',
    publishedAt: '2024-01-15',
    tags: ['Digital Rights', 'Health', 'Technology', 'Women\'s Rights'],
    pdfUrl: '/files/publications/digital-health-rights.pdf',
    featured: true,
    readTime: '8 min read',
    viewCount: 1250,
    downloadCount: 340
  },
  {
    _id: '2',
    title: 'Digital inclusion for women',
    author: 'Celine Mumbi',
    coverImage: {
      url: '/images/legal hero.jpeg',
      alt: 'Digital inclusion for women cover'
    },
    description: 'A comprehensive analysis of barriers to digital inclusion faced by women in Africa and strategies for improvement.',
    category: 'Report',
    publishedAt: '2024-01-10',
    tags: ['Digital Inclusion', 'Women', 'Technology', 'Access'],
    pdfUrl: '/files/publications/digital-inclusion-women.pdf',
    featured: true,
    readTime: '12 min read',
    viewCount: 980,
    downloadCount: 280
  },
  {
    _id: '3',
    title: 'Femicide piece new',
    author: 'Purity Buyanzi',
    coverImage: {
      url: '/images/legal hero.jpeg',
      alt: 'Femicide piece new cover'
    },
    description: 'A critical examination of femicide in Kenya and the urgent need for legal and social reforms.',
    category: 'Article',
    publishedAt: '2024-01-05',
    tags: ['Femicide', 'Gender-Based Violence', 'Legal Reform', 'Kenya'],
    pdfUrl: '/files/publications/femicide-piece.pdf',
    featured: true,
    readTime: '10 min read',
    viewCount: 2100,
    downloadCount: 450
  },
  {
    _id: '4',
    title: 'Grooming in Kenya high schools',
    author: 'Melvin Bosibori',
    coverImage: {
      url: '/images/legal hero.jpeg',
      alt: 'Grooming in Kenya high schools cover'
    },
    description: 'Investigating the prevalence of grooming and sexual exploitation in Kenyan high schools and prevention strategies.',
    category: 'Research',
    publishedAt: '2023-12-20',
    tags: ['Grooming', 'Sexual Exploitation', 'Education', 'Youth'],
    pdfUrl: '/files/publications/grooming-kenya-schools.pdf',
    featured: false,
    readTime: '15 min read',
    viewCount: 750,
    downloadCount: 190
  },
  {
    _id: '5',
    title: 'International women month',
    author: 'Equality Vanguard Team',
    coverImage: {
      url: '/images/legal hero.jpeg',
      alt: 'International women month cover'
    },
    description: 'Reflections on International Women\'s Month and the ongoing struggle for gender equality in Africa.',
    category: 'Blog',
    publishedAt: '2024-03-08',
    tags: ['International Women\'s Day', 'Gender Equality', 'Reflection', 'Activism'],
    pdfUrl: '/files/publications/international-women-month.pdf',
    featured: false,
    readTime: '6 min read',
    viewCount: 890,
    downloadCount: 220
  },
  {
    _id: '6',
    title: 'Kiherere proudly claiming the label',
    author: 'Mutheu Mutuku',
    coverImage: {
      url: '/images/legal hero.jpeg',
      alt: 'Kiherere proudly claiming the label cover'
    },
    description: 'A personal essay on embracing feminist identity and the power of claiming labels in African contexts.',
    category: 'Personal Essay',
    publishedAt: '2023-11-15',
    tags: ['Feminist Identity', 'Personal Story', 'Labels', 'Empowerment'],
    pdfUrl: '/files/publications/kiherere-claiming-label.pdf',
    featured: true,
    readTime: '7 min read',
    viewCount: 1200,
    downloadCount: 310
  },
  {
    _id: '7',
    title: 'Layers of oppression',
    author: 'Nadia Mujisa',
    coverImage: {
      url: '/images/legal hero.jpeg',
      alt: 'Layers of oppression cover'
    },
    description: 'An intersectional analysis of how different forms of oppression intersect and compound in women\'s lives.',
    category: 'Analysis',
    publishedAt: '2023-10-30',
    tags: ['Intersectionality', 'Oppression', 'Analysis', 'Feminism'],
    pdfUrl: '/files/publications/layers-oppression.pdf',
    featured: false,
    readTime: '11 min read',
    viewCount: 680,
    downloadCount: 180
  },
  {
    _id: '8',
    title: 'Misogynistic humour',
    author: 'Celine Mumbi',
    coverImage: {
      url: '/images/legal hero.jpeg',
      alt: 'Misogynistic humour cover'
    },
    description: 'Examining the role of misogynistic humor in perpetuating gender stereotypes and normalizing sexism.',
    category: 'Article',
    publishedAt: '2023-10-15',
    tags: ['Misogyny', 'Humor', 'Gender Stereotypes', 'Social Commentary'],
    pdfUrl: '/files/publications/misogynistic-humour.pdf',
    featured: false,
    readTime: '9 min read',
    viewCount: 950,
    downloadCount: 240
  },
  {
    _id: '9',
    title: 'My body is not an apology',
    author: 'Purity Buyanzi',
    coverImage: {
      url: '/images/legal hero.jpeg',
      alt: 'My body is not an apology cover'
    },
    description: 'A powerful piece on body positivity, self-acceptance, and rejecting societal beauty standards.',
    category: 'Personal Essay',
    publishedAt: '2023-09-28',
    tags: ['Body Positivity', 'Self-Acceptance', 'Beauty Standards', 'Empowerment'],
    pdfUrl: '/files/publications/my-body-not-apology.pdf',
    featured: true,
    readTime: '8 min read',
    viewCount: 1500,
    downloadCount: 380
  },
  {
    _id: '10',
    title: 'My mothers hurt',
    author: 'Anonymous',
    coverImage: {
      url: '/images/legal hero.jpeg',
      alt: 'My mothers hurt cover'
    },
    description: 'A deeply personal story about intergenerational trauma and the healing journey of African women.',
    category: 'Personal Story',
    publishedAt: '2023-09-10',
    tags: ['Intergenerational Trauma', 'Healing', 'Personal Story', 'Women'],
    pdfUrl: '/files/publications/my-mothers-hurt.pdf',
    featured: false,
    readTime: '6 min read',
    viewCount: 1100,
    downloadCount: 290
  },
  {
    _id: '11',
    title: 'Period poverty',
    author: 'Equality Vanguard Team',
    coverImage: {
      url: '/images/legal hero.jpeg',
      alt: 'Period poverty cover'
    },
    description: 'Addressing the critical issue of period poverty and its impact on girls\' education and dignity.',
    category: 'Report',
    publishedAt: '2023-08-25',
    tags: ['Period Poverty', 'Education', 'Dignity', 'Health'],
    pdfUrl: '/files/publications/period-poverty.pdf',
    featured: true,
    readTime: '13 min read',
    viewCount: 1800,
    downloadCount: 420
  },
  {
    _id: '12',
    title: 'Pixelated power of reclaiming our digital space for feminist futures',
    author: 'Celine Mumbi',
    coverImage: {
      url: '/images/legal hero.jpeg',
      alt: 'Pixelated power of reclaiming our digital space for feminist futures cover'
    },
    description: 'Exploring how digital spaces can be reclaimed and transformed for feminist activism and community building.',
    category: 'Article',
    publishedAt: '2023-08-10',
    tags: ['Digital Activism', 'Feminist Futures', 'Online Spaces', 'Community'],
    pdfUrl: '/files/publications/pixelated-power-digital-space.pdf',
    featured: false,
    readTime: '14 min read',
    viewCount: 720,
    downloadCount: 200
  },
  {
    _id: '13',
    title: 'Rainbow resistance',
    author: 'Equality Vanguard Team',
    coverImage: {
      url: '/images/legal hero.jpeg',
      alt: 'Rainbow resistance cover'
    },
    description: 'Celebrating LGBTQ+ resistance and resilience in Africa and the ongoing fight for rights and recognition.',
    category: 'Article',
    publishedAt: '2023-07-20',
    tags: ['LGBTQ+', 'Resistance', 'Rights', 'Africa'],
    pdfUrl: '/files/publications/rainbow-resistance.pdf',
    featured: true,
    readTime: '10 min read',
    viewCount: 1300,
    downloadCount: 350
  },
  {
    _id: '14',
    title: 'Reimagining humanity through SRHR',
    author: 'Purity Buyanzi',
    coverImage: {
      url: '/images/legal hero.jpeg',
      alt: 'Reimagining humanity through SRHR cover'
    },
    description: 'A comprehensive look at Sexual and Reproductive Health and Rights as fundamental to human dignity.',
    category: 'Research',
    publishedAt: '2023-07-05',
    tags: ['SRHR', 'Human Rights', 'Dignity', 'Health'],
    pdfUrl: '/files/publications/reimagining-humanity-srhr.pdf',
    featured: false,
    readTime: '16 min read',
    viewCount: 850,
    downloadCount: 220
  },
  {
    _id: '15',
    title: 'Sex shame and the white coat',
    author: 'Melvin Bosibori',
    coverImage: {
      url: '/images/legal hero.jpeg',
      alt: 'Sex shame and the white coat cover'
    },
    description: 'Examining how medical professionals perpetuate sexual shame and the need for sex-positive healthcare.',
    category: 'Article',
    publishedAt: '2023-06-18',
    tags: ['Sexual Shame', 'Healthcare', 'Medical Professionals', 'Sex Positivity'],
    pdfUrl: '/files/publications/sex-shame-white-coat.pdf',
    featured: false,
    readTime: '12 min read',
    viewCount: 600,
    downloadCount: 160
  },
  {
    _id: '16',
    title: 'Sexual assault awareness month',
    author: 'Equality Vanguard Team',
    coverImage: {
      url: '/images/legal hero.jpeg',
      alt: 'Sexual assault awareness month cover'
    },
    description: 'Raising awareness about sexual assault and the importance of survivor support and prevention.',
    category: 'Awareness',
    publishedAt: '2024-04-01',
    tags: ['Sexual Assault', 'Awareness', 'Survivor Support', 'Prevention'],
    pdfUrl: '/files/publications/sexual-assault-awareness.pdf',
    featured: true,
    readTime: '9 min read',
    viewCount: 1600,
    downloadCount: 400
  },
  {
    _id: '17',
    title: 'Silencing the truth how news media shield perpetrators of femicide',
    author: 'Purity Buyanzi',
    coverImage: {
      url: '/images/legal hero.jpeg',
      alt: 'Silencing the truth how news media shield perpetrators of femicide cover'
    },
    description: 'A critical analysis of how media coverage of femicide often protects perpetrators and silences victims.',
    category: 'Media Analysis',
    publishedAt: '2023-05-30',
    tags: ['Media Analysis', 'Femicide', 'Journalism', 'Victim Blaming'],
    pdfUrl: '/files/publications/silencing-truth-media-femicide.pdf',
    featured: true,
    readTime: '15 min read',
    viewCount: 1900,
    downloadCount: 480
  },
  {
    _id: '18',
    title: 'Since we last spoke',
    author: 'Mutheu Mutuku',
    coverImage: {
      url: '/images/legal hero.jpeg',
      alt: 'Since we last spoke cover'
    },
    description: 'A personal reflection on the changes and challenges in the feminist movement since the last major gathering.',
    category: 'Reflection',
    publishedAt: '2023-05-15',
    tags: ['Reflection', 'Feminist Movement', 'Change', 'Challenges'],
    pdfUrl: '/files/publications/since-we-last-spoke.pdf',
    featured: false,
    readTime: '7 min read',
    viewCount: 800,
    downloadCount: 210
  },
  {
    _id: '19',
    title: 'SRHR in Africa wins and challenges in 2024',
    author: 'Equality Vanguard Team',
    coverImage: {
      url: '/images/legal hero.jpeg',
      alt: 'SRHR in Africa wins and challenges in 2024 cover'
    },
    description: 'A comprehensive review of Sexual and Reproductive Health and Rights progress and challenges across Africa.',
    category: 'Report',
    publishedAt: '2024-01-01',
    tags: ['SRHR', 'Africa', 'Progress', 'Challenges'],
    pdfUrl: '/files/publications/srhr-africa-2024.pdf',
    featured: true,
    readTime: '18 min read',
    viewCount: 2200,
    downloadCount: 550
  },
  {
    _id: '20',
    title: 'Standing on Kimberle Crenshaw shoulders',
    author: 'Nadia Mujisa',
    coverImage: {
      url: '/images/legal hero.jpeg',
      alt: 'Standing on Kimberle Crenshaw shoulders cover'
    },
    description: 'Honoring the legacy of Kimberlé Crenshaw and the impact of intersectionality on contemporary feminist thought.',
    category: 'Tribute',
    publishedAt: '2023-04-20',
    tags: ['Kimberlé Crenshaw', 'Intersectionality', 'Legacy', 'Feminist Theory'],
    pdfUrl: '/files/publications/standing-kimberle-crenshaw.pdf',
    featured: false,
    readTime: '11 min read',
    viewCount: 700,
    downloadCount: 190
  },
  {
    _id: '21',
    title: 'The grip of extremism',
    author: 'Melvin Bosibori',
    coverImage: {
      url: '/images/legal hero.jpeg',
      alt: 'The grip of extremism cover'
    },
    description: 'Analyzing the rise of religious and political extremism and its impact on women\'s rights in Africa.',
    category: 'Analysis',
    publishedAt: '2023-04-05',
    tags: ['Extremism', 'Religion', 'Politics', 'Women\'s Rights'],
    pdfUrl: '/files/publications/grip-extremism.pdf',
    featured: false,
    readTime: '13 min read',
    viewCount: 550,
    downloadCount: 150
  },
  {
    _id: '22',
    title: 'The hidden economy of women\'s unpaid labour',
    author: 'Celine Mumbi',
    coverImage: {
      url: '/images/legal hero.jpeg',
      alt: 'The hidden economy of women\'s unpaid labour cover'
    },
    description: 'Exposing the economic value of women\'s unpaid labor and its contribution to global economies.',
    category: 'Economic Analysis',
    publishedAt: '2023-03-20',
    tags: ['Unpaid Labor', 'Economics', 'Women\'s Work', 'Value'],
    pdfUrl: '/files/publications/hidden-economy-unpaid-labour.pdf',
    featured: true,
    readTime: '14 min read',
    viewCount: 1400,
    downloadCount: 360
  },
  {
    _id: '23',
    title: 'Why femicide marches matter',
    author: 'Purity Buyanzi',
    coverImage: {
      url: '/images/legal hero.jpeg',
      alt: 'Why femicide marches matter cover'
    },
    description: 'The importance of public demonstrations in raising awareness about femicide and demanding justice.',
    category: 'Activism',
    publishedAt: '2023-03-08',
    tags: ['Femicide', 'Marches', 'Activism', 'Justice'],
    pdfUrl: '/files/publications/why-femicide-marches-matter.pdf',
    featured: true,
    readTime: '8 min read',
    viewCount: 1700,
    downloadCount: 430
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const author = searchParams.get('author') || '';
    const sort = searchParams.get('sort') || 'newest';

    let filteredPublications = [...publications];

    // Filter by search term
    if (search) {
      filteredPublications = filteredPublications.filter(pub =>
        pub.title.toLowerCase().includes(search.toLowerCase()) ||
        pub.author.toLowerCase().includes(search.toLowerCase()) ||
        pub.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Filter by category
    if (category && category !== 'All') {
      filteredPublications = filteredPublications.filter(pub => pub.category === category);
    }

    // Filter by author
    if (author && author !== 'All') {
      filteredPublications = filteredPublications.filter(pub => pub.author === author);
    }

    // Sort publications
    switch (sort) {
      case 'newest':
        filteredPublications.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        break;
      case 'oldest':
        filteredPublications.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
        break;
      case 'title':
        filteredPublications.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'author':
        filteredPublications.sort((a, b) => a.author.localeCompare(b.author));
        break;
      case 'popular':
        filteredPublications.sort((a, b) => b.viewCount - a.viewCount);
        break;
      case 'featured':
        filteredPublications.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      default:
        filteredPublications.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }

    return NextResponse.json({
      success: true,
      publications: filteredPublications,
      total: filteredPublications.length
    });

  } catch (error) {
    console.error('Error fetching publications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch publications' },
      { status: 500 }
    );
  }
}
