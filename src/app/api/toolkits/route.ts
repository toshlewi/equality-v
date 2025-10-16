import { NextRequest, NextResponse } from 'next/server';

// Sample toolkits data - these would be managed through CMS
const toolkits = [
  {
    _id: '1',
    title: 'Feminist Legal Advocacy Toolkit',
    author: 'Legal Vanguard Team',
    category: 'Toolkit',
    description: 'A comprehensive guide for lawyers and advocates working on gender justice cases, including legal frameworks, case studies, and practical strategies.',
    targetAudience: ['Lawyers', 'Advocates', 'Legal Students'],
    difficultyLevel: 'Advanced',
    estimatedTime: '2-3 hours',
    coverImage: {
      url: '/images/legal hero.jpeg',
      alt: 'Feminist Legal Advocacy Toolkit cover'
    },
    files: [
      {
        name: 'Legal Advocacy Guide.pdf',
        url: '/files/toolkits/legal-advocacy-guide.pdf',
        type: 'pdf',
        size: 2048000
      },
      {
        name: 'Case Study Templates.docx',
        url: '/files/toolkits/case-study-templates.docx',
        type: 'docx',
        size: 512000
      }
    ],
    publishedAt: '2024-01-15',
    viewCount: 450,
    downloadCount: 120,
    featured: true,
    tags: ['Legal Advocacy', 'Gender Justice', 'Law', 'Feminism']
  },
  {
    _id: '2',
    title: 'Digital Rights for Women Guide',
    author: 'Celine Mumbi',
    category: 'Guide',
    description: 'Essential information about digital rights, online safety, and privacy protection specifically tailored for women and marginalized communities.',
    targetAudience: ['General Public', 'Activists', 'Students'],
    difficultyLevel: 'Beginner',
    estimatedTime: '1 hour',
    coverImage: {
      url: '/images/legal hero.jpeg',
      alt: 'Digital Rights for Women Guide cover'
    },
    files: [
      {
        name: 'Digital Rights Guide.pdf',
        url: '/files/toolkits/digital-rights-guide.pdf',
        type: 'pdf',
        size: 1536000
      }
    ],
    publishedAt: '2024-01-10',
    viewCount: 320,
    downloadCount: 85,
    featured: true,
    tags: ['Digital Rights', 'Online Safety', 'Privacy', 'Women']
  },
  {
    _id: '3',
    title: 'SRHR Advocacy Manual',
    author: 'Purity Buyanzi',
    category: 'Manual',
    description: 'A detailed manual for advocating Sexual and Reproductive Health and Rights, including policy frameworks and community engagement strategies.',
    targetAudience: ['Activists', 'Organizations', 'Health Workers'],
    difficultyLevel: 'Intermediate',
    estimatedTime: '3-4 hours',
    coverImage: {
      url: '/images/legal hero.jpeg',
      alt: 'SRHR Advocacy Manual cover'
    },
    files: [
      {
        name: 'SRHR Advocacy Manual.pdf',
        url: '/files/toolkits/srhr-advocacy-manual.pdf',
        type: 'pdf',
        size: 3072000
      },
      {
        name: 'Policy Templates.docx',
        url: '/files/toolkits/srhr-policy-templates.docx',
        type: 'docx',
        size: 768000
      }
    ],
    publishedAt: '2024-01-05',
    viewCount: 280,
    downloadCount: 95,
    featured: false,
    tags: ['SRHR', 'Advocacy', 'Health', 'Policy']
  },
  {
    _id: '4',
    title: 'Economic Justice Framework',
    author: 'Nadia Mujisa',
    category: 'Framework',
    description: 'A comprehensive framework for understanding and addressing economic inequality through feminist economic principles.',
    targetAudience: ['Researchers', 'Policy Makers', 'Organizations'],
    difficultyLevel: 'Advanced',
    estimatedTime: '4-5 hours',
    coverImage: {
      url: '/images/legal hero.jpeg',
      alt: 'Economic Justice Framework cover'
    },
    files: [
      {
        name: 'Economic Justice Framework.pdf',
        url: '/files/toolkits/economic-justice-framework.pdf',
        type: 'pdf',
        size: 4096000
      },
      {
        name: 'Implementation Guide.docx',
        url: '/files/toolkits/economic-justice-implementation.docx',
        type: 'docx',
        size: 1024000
      }
    ],
    publishedAt: '2023-12-20',
    viewCount: 190,
    downloadCount: 65,
    featured: true,
    tags: ['Economic Justice', 'Feminist Economics', 'Inequality', 'Policy']
  },
  {
    _id: '5',
    title: 'Community Organizing Checklist',
    author: 'Equality Vanguard Team',
    category: 'Checklist',
    description: 'A practical checklist for organizing community events, campaigns, and movements with feminist principles at the core.',
    targetAudience: ['Activists', 'Community Leaders', 'Organizations'],
    difficultyLevel: 'Beginner',
    estimatedTime: '30 minutes',
    coverImage: {
      url: '/images/legal hero.jpeg',
      alt: 'Community Organizing Checklist cover'
    },
    files: [
      {
        name: 'Community Organizing Checklist.pdf',
        url: '/files/toolkits/community-organizing-checklist.pdf',
        type: 'pdf',
        size: 512000
      }
    ],
    publishedAt: '2023-12-15',
    viewCount: 150,
    downloadCount: 45,
    featured: false,
    tags: ['Community Organizing', 'Activism', 'Checklist', 'Events']
  },
  {
    _id: '6',
    title: 'Feminist Research Methodology',
    author: 'Research Team',
    category: 'Framework',
    description: 'A methodological framework for conducting feminist research that centers marginalized voices and challenges traditional research paradigms.',
    targetAudience: ['Researchers', 'Students', 'Academics'],
    difficultyLevel: 'Intermediate',
    estimatedTime: '2-3 hours',
    coverImage: {
      url: '/images/legal hero.jpeg',
      alt: 'Feminist Research Methodology cover'
    },
    files: [
      {
        name: 'Feminist Research Methodology.pdf',
        url: '/files/toolkits/feminist-research-methodology.pdf',
        type: 'pdf',
        size: 2560000
      },
      {
        name: 'Research Templates.docx',
        url: '/files/toolkits/research-templates.docx',
        type: 'docx',
        size: 640000
      }
    ],
    publishedAt: '2023-12-10',
    viewCount: 220,
    downloadCount: 75,
    featured: false,
    tags: ['Research', 'Methodology', 'Feminism', 'Academia']
  },
  {
    _id: '7',
    title: 'Safe Space Guidelines',
    author: 'Community Team',
    category: 'Template',
    description: 'Guidelines and templates for creating and maintaining safe spaces in community settings, events, and online platforms.',
    targetAudience: ['Community Leaders', 'Event Organizers', 'Online Moderators'],
    difficultyLevel: 'Beginner',
    estimatedTime: '45 minutes',
    coverImage: {
      url: '/images/legal hero.jpeg',
      alt: 'Safe Space Guidelines cover'
    },
    files: [
      {
        name: 'Safe Space Guidelines.pdf',
        url: '/files/toolkits/safe-space-guidelines.pdf',
        type: 'pdf',
        size: 1024000
      },
      {
        name: 'Moderation Templates.docx',
        url: '/files/toolkits/moderation-templates.docx',
        type: 'docx',
        size: 256000
      }
    ],
    publishedAt: '2023-12-05',
    viewCount: 180,
    downloadCount: 55,
    featured: true,
    tags: ['Safe Spaces', 'Community', 'Guidelines', 'Safety']
  },
  {
    _id: '8',
    title: 'Media Advocacy Toolkit',
    author: 'Communications Team',
    category: 'Toolkit',
    description: 'Tools and strategies for effective media advocacy, including press release templates, social media strategies, and media engagement guidelines.',
    targetAudience: ['Communications Teams', 'Activists', 'Organizations'],
    difficultyLevel: 'Intermediate',
    estimatedTime: '2 hours',
    coverImage: {
      url: '/images/legal hero.jpeg',
      alt: 'Media Advocacy Toolkit cover'
    },
    files: [
      {
        name: 'Media Advocacy Toolkit.pdf',
        url: '/files/toolkits/media-advocacy-toolkit.pdf',
        type: 'pdf',
        size: 2048000
      },
      {
        name: 'Press Release Templates.docx',
        url: '/files/toolkits/press-release-templates.docx',
        type: 'docx',
        size: 512000
      }
    ],
    publishedAt: '2023-11-28',
    viewCount: 160,
    downloadCount: 50,
    featured: false,
    tags: ['Media Advocacy', 'Communications', 'Press', 'Social Media']
  },
  {
    _id: '9',
    title: 'Youth Engagement Framework',
    author: 'Youth Team',
    category: 'Framework',
    description: 'A framework for meaningful youth engagement in feminist movements, including participation strategies and leadership development.',
    targetAudience: ['Youth Leaders', 'Organizations', 'Educators'],
    difficultyLevel: 'Intermediate',
    estimatedTime: '2-3 hours',
    coverImage: {
      url: '/images/legal hero.jpeg',
      alt: 'Youth Engagement Framework cover'
    },
    files: [
      {
        name: 'Youth Engagement Framework.pdf',
        url: '/files/toolkits/youth-engagement-framework.pdf',
        type: 'pdf',
        size: 1792000
      }
    ],
    publishedAt: '2023-11-20',
    viewCount: 140,
    downloadCount: 40,
    featured: false,
    tags: ['Youth Engagement', 'Leadership', 'Education', 'Activism']
  },
  {
    _id: '10',
    title: 'Intersectional Analysis Template',
    author: 'Research Team',
    category: 'Template',
    description: 'A practical template for conducting intersectional analysis in research, policy development, and program design.',
    targetAudience: ['Researchers', 'Policy Makers', 'Program Managers'],
    difficultyLevel: 'Advanced',
    estimatedTime: '1-2 hours',
    coverImage: {
      url: '/images/legal hero.jpeg',
      alt: 'Intersectional Analysis Template cover'
    },
    files: [
      {
        name: 'Intersectional Analysis Template.pdf',
        url: '/files/toolkits/intersectional-analysis-template.pdf',
        type: 'pdf',
        size: 1280000
      }
    ],
    publishedAt: '2023-11-15',
    viewCount: 110,
    downloadCount: 35,
    featured: true,
    tags: ['Intersectionality', 'Analysis', 'Research', 'Policy']
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const audience = searchParams.get('audience') || '';
    const difficulty = searchParams.get('difficulty') || '';
    const sort = searchParams.get('sort') || 'newest';

    let filteredToolkits = [...toolkits];

    // Filter by search term
    if (search) {
      filteredToolkits = filteredToolkits.filter(toolkit =>
        toolkit.title.toLowerCase().includes(search.toLowerCase()) ||
        toolkit.author.toLowerCase().includes(search.toLowerCase()) ||
        toolkit.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Filter by category
    if (category && category !== 'All') {
      filteredToolkits = filteredToolkits.filter(toolkit => toolkit.category === category);
    }

    // Filter by audience
    if (audience && audience !== 'All') {
      filteredToolkits = filteredToolkits.filter(toolkit => 
        toolkit.targetAudience.includes(audience)
      );
    }

    // Filter by difficulty
    if (difficulty && difficulty !== 'All') {
      filteredToolkits = filteredToolkits.filter(toolkit => toolkit.difficultyLevel === difficulty);
    }

    // Sort toolkits
    switch (sort) {
      case 'newest':
        filteredToolkits.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        break;
      case 'oldest':
        filteredToolkits.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
        break;
      case 'title':
        filteredToolkits.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'author':
        filteredToolkits.sort((a, b) => a.author.localeCompare(b.author));
        break;
      case 'popular':
        filteredToolkits.sort((a, b) => b.viewCount - a.viewCount);
        break;
      case 'featured':
        filteredToolkits.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      default:
        filteredToolkits.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }

    return NextResponse.json({
      success: true,
      toolkits: filteredToolkits,
      total: filteredToolkits.length
    });

  } catch (error) {
    console.error('Error fetching toolkits:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch toolkits' },
      { status: 500 }
    );
  }
}
