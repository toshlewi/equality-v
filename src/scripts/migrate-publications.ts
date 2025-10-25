import { connectDB } from '@/lib/mongodb';
import Publication from '@/models/Publication';
import { slugify } from '@/lib/utils';

// Publications data from EV CONTEXT.md
const publicationsData = [
  {
    title: "Digital Health Rights: A Comprehensive Guide",
    author: "Dr. Sarah Mwangi",
    content: "This comprehensive guide explores the intersection of digital technology and health rights, examining how digital platforms can both advance and hinder access to healthcare services. The publication covers key topics including data privacy in healthcare, telemedicine accessibility, digital health equity, and policy recommendations for ensuring inclusive digital health systems.",
    excerpt: "A comprehensive exploration of digital health rights, covering data privacy, telemedicine accessibility, and policy recommendations for inclusive digital health systems.",
    category: "report",
    tags: ["digital-rights", "health", "technology", "policy"],
    pdfUrl: "/files/publications/digital-health-rights.pdf",
    featuredImage: "/images/publications/digital-health-rights.jpg",
    isFeatured: true
  },
  {
    title: "Economic Justice for Women: Policy Framework",
    author: "Equality Vanguard Research Team",
    content: "This policy framework presents a comprehensive approach to achieving economic justice for women in Kenya. It examines the current economic landscape, identifies systemic barriers, and provides actionable recommendations for policymakers, businesses, and civil society organizations. The framework covers wage equity, access to credit, entrepreneurship support, and social protection measures.",
    excerpt: "A comprehensive policy framework for achieving economic justice for women, covering wage equity, access to credit, and entrepreneurship support.",
    category: "report",
    tags: ["economic-justice", "women", "policy", "kenya"],
    pdfUrl: "/files/publications/economic-justice-framework.pdf",
    featuredImage: "/images/publications/economic-justice.jpg",
    isFeatured: true
  },
  {
    title: "Mental Health in the Workplace: A Guide for Employers",
    author: "Dr. Grace Wanjiku",
    content: "This practical guide helps employers create mentally healthy workplaces. It covers recognizing mental health challenges, implementing supportive policies, training managers, and creating inclusive environments. The guide includes case studies, best practices, and practical tools for organizations of all sizes.",
    excerpt: "A practical guide for employers to create mentally healthy workplaces, including policies, training, and inclusive practices.",
    category: "guide",
    tags: ["mental-health", "workplace", "employers", "wellbeing"],
    pdfUrl: "/files/publications/mental-health-workplace.pdf",
    featuredImage: "/images/publications/mental-health-workplace.jpg"
  },
  {
    title: "Legal Rights of Women in Kenya: A Handbook",
    author: "Legal Vanguard Team",
    content: "This comprehensive handbook provides women with essential information about their legal rights in Kenya. It covers constitutional rights, family law, employment law, property rights, and access to justice. Written in accessible language, it serves as a practical resource for women seeking to understand and assert their rights.",
    excerpt: "A comprehensive handbook providing women with essential information about their legal rights in Kenya, covering constitutional, family, and employment law.",
    category: "handbook",
    tags: ["legal-rights", "women", "kenya", "constitution"],
    pdfUrl: "/files/publications/legal-rights-handbook.pdf",
    featuredImage: "/images/publications/legal-rights.jpg",
    isFeatured: true
  },
  {
    title: "SRHR Advocacy Toolkit",
    author: "SRHR Advocacy Team",
    content: "This toolkit provides advocates with practical tools and strategies for promoting sexual and reproductive health and rights. It includes advocacy planning frameworks, communication strategies, stakeholder engagement techniques, and monitoring and evaluation tools. The toolkit is designed for use by civil society organizations, activists, and community leaders.",
    excerpt: "A comprehensive toolkit for SRHR advocates, including planning frameworks, communication strategies, and monitoring tools.",
    category: "toolkit",
    tags: ["srhr", "advocacy", "toolkit", "reproductive-rights"],
    pdfUrl: "/files/publications/srhr-advocacy-toolkit.pdf",
    featuredImage: "/images/publications/srhr-toolkit.jpg"
  },
  {
    title: "Digital Rights and Privacy: A Citizen's Guide",
    author: "Digital Rights Team",
    content: "This citizen's guide explains digital rights and privacy in simple terms. It covers data protection, online safety, digital surveillance, and how to protect personal information online. The guide includes practical tips, checklists, and resources for individuals to safeguard their digital rights.",
    excerpt: "A citizen's guide to digital rights and privacy, covering data protection, online safety, and practical tips for safeguarding digital rights.",
    category: "guide",
    tags: ["digital-rights", "privacy", "citizens", "online-safety"],
    pdfUrl: "/files/publications/digital-rights-citizen-guide.pdf",
    featuredImage: "/images/publications/digital-rights-guide.jpg"
  },
  {
    title: "Gender-Based Violence Prevention: Community Strategies",
    author: "Community Safety Team",
    content: "This publication presents evidence-based strategies for preventing gender-based violence at the community level. It covers awareness-raising, community mobilization, bystander intervention, and creating safe spaces. The guide includes case studies from successful prevention programs and practical implementation tools.",
    excerpt: "Evidence-based strategies for preventing gender-based violence at the community level, including awareness-raising and bystander intervention.",
    category: "guide",
    tags: ["gbv", "prevention", "community", "safety"],
    pdfUrl: "/files/publications/gbv-prevention-guide.pdf",
    featuredImage: "/images/publications/gbv-prevention.jpg"
  },
  {
    title: "Women in Leadership: Breaking Barriers",
    author: "Leadership Development Team",
    content: "This publication examines the barriers women face in leadership positions and provides strategies for overcoming them. It covers unconscious bias, mentorship programs, leadership development, and creating inclusive organizational cultures. The guide includes interviews with successful women leaders and practical advice for aspiring leaders.",
    excerpt: "An examination of barriers to women's leadership and strategies for overcoming them, including mentorship and leadership development.",
    category: "article",
    tags: ["leadership", "women", "barriers", "mentorship"],
    pdfUrl: "/files/publications/women-leadership.pdf",
    featuredImage: "/images/publications/women-leadership.jpg"
  },
  {
    title: "Climate Justice and Gender: Intersectional Approaches",
    author: "Climate Justice Team",
    content: "This publication explores the intersection of climate change and gender, examining how climate change disproportionately affects women and girls. It presents intersectional approaches to climate justice, including women's participation in climate action, gender-responsive climate policies, and community-based adaptation strategies.",
    excerpt: "An exploration of the intersection of climate change and gender, with intersectional approaches to climate justice and adaptation strategies.",
    category: "article",
    tags: ["climate-justice", "gender", "intersectionality", "environment"],
    pdfUrl: "/files/publications/climate-justice-gender.pdf",
    featuredImage: "/images/publications/climate-justice.jpg"
  },
  {
    title: "Access to Justice: Legal Aid and Support Services",
    author: "Legal Aid Team",
    content: "This publication provides an overview of legal aid and support services available to women in Kenya. It covers free legal services, pro bono representation, legal clinics, and community paralegal programs. The guide includes contact information, eligibility criteria, and step-by-step processes for accessing legal support.",
    excerpt: "An overview of legal aid and support services for women in Kenya, including free legal services and community paralegal programs.",
    category: "guide",
    tags: ["legal-aid", "access-justice", "support-services", "kenya"],
    pdfUrl: "/files/publications/legal-aid-guide.pdf",
    featuredImage: "/images/publications/legal-aid.jpg"
  },
  {
    title: "Youth Engagement in Gender Justice",
    author: "Youth Programs Team",
    content: "This publication examines the role of young people in advancing gender justice. It covers youth-led initiatives, intergenerational partnerships, digital activism, and creating inclusive spaces for young voices. The guide includes case studies of successful youth programs and practical tools for youth engagement.",
    excerpt: "An examination of youth engagement in gender justice, covering youth-led initiatives and digital activism strategies.",
    category: "article",
    tags: ["youth", "engagement", "gender-justice", "activism"],
    pdfUrl: "/files/publications/youth-engagement.pdf",
    featuredImage: "/images/publications/youth-engagement.jpg"
  },
  {
    title: "Media Representation of Women: A Critical Analysis",
    author: "Media Advocacy Team",
    content: "This critical analysis examines how women are represented in Kenyan media. It covers news coverage, entertainment media, advertising, and social media. The analysis identifies harmful stereotypes, highlights positive representations, and provides recommendations for more inclusive media practices.",
    excerpt: "A critical analysis of women's representation in Kenyan media, identifying stereotypes and recommending inclusive practices.",
    category: "article",
    tags: ["media", "representation", "stereotypes", "analysis"],
    pdfUrl: "/files/publications/media-representation.pdf",
    featuredImage: "/images/publications/media-analysis.jpg"
  },
  {
    title: "Economic Empowerment Through Entrepreneurship",
    author: "Economic Justice Team",
    content: "This publication provides practical guidance for women entrepreneurs in Kenya. It covers business planning, access to finance, market research, networking, and scaling strategies. The guide includes success stories, practical templates, and resources for women starting or growing their businesses.",
    excerpt: "Practical guidance for women entrepreneurs, covering business planning, access to finance, and scaling strategies.",
    category: "guide",
    tags: ["entrepreneurship", "economic-empowerment", "business", "women"],
    pdfUrl: "/files/publications/entrepreneurship-guide.pdf",
    featuredImage: "/images/publications/entrepreneurship.jpg"
  },
  {
    title: "Digital Literacy for Women: A Training Manual",
    author: "Digital Rights Team",
    content: "This training manual provides structured lessons for teaching digital literacy to women. It covers basic computer skills, internet safety, social media use, online banking, and digital communication. The manual includes lesson plans, activities, and assessment tools for trainers and facilitators.",
    excerpt: "A structured training manual for teaching digital literacy to women, including lesson plans and assessment tools.",
    category: "manual",
    tags: ["digital-literacy", "training", "women", "education"],
    pdfUrl: "/files/publications/digital-literacy-manual.pdf",
    featuredImage: "/images/publications/digital-literacy.jpg"
  },
  {
    title: "Mental Health Stigma: Breaking the Silence",
    author: "Mental Health Team",
    content: "This publication addresses mental health stigma and its impact on women. It covers the causes of stigma, its effects on help-seeking behavior, and strategies for reducing stigma at individual, community, and societal levels. The guide includes personal stories, awareness-raising activities, and advocacy tools.",
    excerpt: "An exploration of mental health stigma and its impact on women, with strategies for reducing stigma and promoting help-seeking.",
    category: "article",
    tags: ["mental-health", "stigma", "awareness", "advocacy"],
    pdfUrl: "/files/publications/mental-health-stigma.pdf",
    featuredImage: "/images/publications/mental-health-stigma.jpg"
  },
  {
    title: "Women's Political Participation: A Roadmap",
    author: "Political Participation Team",
    content: "This roadmap provides guidance for increasing women's political participation in Kenya. It covers electoral processes, campaign strategies, leadership development, and policy advocacy. The guide includes case studies of successful women politicians and practical tools for political engagement.",
    excerpt: "A roadmap for increasing women's political participation, covering electoral processes and campaign strategies.",
    category: "guide",
    tags: ["political-participation", "women", "elections", "leadership"],
    pdfUrl: "/files/publications/political-participation.pdf",
    featuredImage: "/images/publications/political-participation.jpg"
  },
  {
    title: "Intersectionality in Gender Justice Work",
    author: "Research Team",
    content: "This publication explores the concept of intersectionality and its application in gender justice work. It examines how different forms of oppression intersect and provides frameworks for intersectional analysis and advocacy. The guide includes case studies and practical tools for intersectional programming.",
    excerpt: "An exploration of intersectionality in gender justice work, with frameworks for intersectional analysis and advocacy.",
    category: "article",
    tags: ["intersectionality", "gender-justice", "oppression", "advocacy"],
    pdfUrl: "/files/publications/intersectionality.pdf",
    featuredImage: "/images/publications/intersectionality.jpg"
  },
  {
    title: "Community-Based Monitoring and Evaluation",
    author: "M&E Team",
    content: "This guide provides practical tools for community-based monitoring and evaluation of gender justice programs. It covers participatory methods, data collection techniques, analysis frameworks, and reporting strategies. The guide includes templates, checklists, and case studies from successful programs.",
    excerpt: "Practical tools for community-based monitoring and evaluation of gender justice programs, including participatory methods.",
    category: "guide",
    tags: ["monitoring", "evaluation", "community", "gender-justice"],
    pdfUrl: "/files/publications/community-m-e.pdf",
    featuredImage: "/images/publications/community-me.jpg"
  },
  {
    title: "Technology and Gender-Based Violence Prevention",
    author: "Tech for Good Team",
    content: "This publication examines how technology can be used to prevent and respond to gender-based violence. It covers mobile apps, online platforms, data analytics, and digital safety tools. The guide includes case studies of successful tech interventions and practical implementation strategies.",
    excerpt: "An examination of technology's role in preventing gender-based violence, covering mobile apps and digital safety tools.",
    category: "article",
    tags: ["technology", "gbv", "prevention", "mobile-apps"],
    pdfUrl: "/files/publications/tech-gbv-prevention.pdf",
    featuredImage: "/images/publications/tech-gbv.jpg"
  },
  {
    title: "Women's Health Rights: A Policy Brief",
    author: "Health Rights Team",
    content: "This policy brief examines women's health rights in Kenya, focusing on reproductive health, maternal health, and access to healthcare services. It provides policy recommendations for improving health outcomes and ensuring equitable access to healthcare for all women.",
    excerpt: "A policy brief on women's health rights in Kenya, focusing on reproductive and maternal health with policy recommendations.",
    category: "policy-brief",
    tags: ["health-rights", "reproductive-health", "maternal-health", "policy"],
    pdfUrl: "/files/publications/women-health-rights.pdf",
    featuredImage: "/images/publications/health-rights.jpg"
  },
  {
    title: "Building Inclusive Organizations: A Toolkit",
    author: "Organizational Development Team",
    content: "This toolkit provides organizations with practical tools for building inclusive and equitable workplaces. It covers diversity and inclusion policies, unconscious bias training, inclusive hiring practices, and creating safe spaces. The toolkit includes assessment tools, training materials, and implementation guides.",
    excerpt: "A toolkit for building inclusive and equitable organizations, covering diversity policies and inclusive hiring practices.",
    category: "toolkit",
    tags: ["inclusion", "diversity", "organizations", "workplace"],
    pdfUrl: "/files/publications/inclusive-organizations.pdf",
    featuredImage: "/images/publications/inclusive-orgs.jpg"
  },
  {
    title: "Women's Land Rights: Legal Framework and Implementation",
    author: "Land Rights Team",
    content: "This publication examines women's land rights in Kenya, covering the legal framework, implementation challenges, and strategies for enforcement. It provides practical guidance for women seeking to assert their land rights and includes case studies of successful land rights advocacy.",
    excerpt: "An examination of women's land rights in Kenya, covering legal framework and strategies for enforcement.",
    category: "article",
    tags: ["land-rights", "women", "legal-framework", "kenya"],
    pdfUrl: "/files/publications/land-rights.pdf",
    featuredImage: "/images/publications/land-rights.jpg"
  },
  {
    title: "Digital Security for Women Human Rights Defenders",
    author: "Digital Security Team",
    content: "This guide provides essential digital security information for women human rights defenders. It covers secure communication, data protection, online privacy, and responding to digital threats. The guide includes practical tools, checklists, and resources for maintaining digital safety.",
    excerpt: "Essential digital security guidance for women human rights defenders, covering secure communication and data protection.",
    category: "guide",
    tags: ["digital-security", "human-rights-defenders", "privacy", "safety"],
    pdfUrl: "/files/publications/digital-security-defenders.pdf",
    featuredImage: "/images/publications/digital-security.jpg"
  }
];

export async function migratePublications() {
  try {
    console.log('📚 Starting publications migration...');
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const pubData of publicationsData) {
      try {
        // Check if publication already exists
        const existingPub = await Publication.findOne({ title: pubData.title });
        if (existingPub) {
          console.log(`⏭️  Skipping existing publication: ${pubData.title}`);
          skippedCount++;
          continue;
        }
        
        // Create publication
        const publication = new Publication({
          ...pubData,
          slug: slugify(pubData.title),
          status: 'published',
          publishedAt: new Date(),
          viewCount: Math.floor(Math.random() * 1000), // Random view count for demo
          isFeatured: pubData.isFeatured || false
        });
        
        await publication.save();
        console.log(`✅ Migrated: ${pubData.title}`);
        migratedCount++;
        
      } catch (error) {
        console.error(`❌ Error migrating publication "${pubData.title}":`, error);
      }
    }
    
    console.log(`\n📊 Publications migration summary:`);
    console.log(`   ✅ Migrated: ${migratedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   📚 Total: ${publicationsData.length}`);
    
  } catch (error) {
    console.error('❌ Error in publications migration:', error);
    throw error;
  }
}
