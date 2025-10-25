import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

// Team member data from EV CONTEXT.md
const teamData = [
  {
    name: "Dr. Sarah Mwangi",
    email: "sarah.mwangi@equalityvanguard.org",
    role: "admin",
    title: "Executive Director",
    bio: "Dr. Sarah Mwangi is a passionate advocate for women's rights with over 15 years of experience in gender justice work. She holds a PhD in Gender Studies from the University of Nairobi and has led numerous campaigns for women's economic empowerment and digital rights.",
    image: "/images/team/sarah-mwangi.jpg",
    socialLinks: {
      twitter: "https://twitter.com/sarahmwangi",
      linkedin: "https://linkedin.com/in/sarahmwangi",
      website: "https://sarahmwangi.com"
    },
    expertise: ["Gender Studies", "Economic Justice", "Digital Rights", "Policy Advocacy"],
    location: "Nairobi, Kenya",
    isActive: true
  },
  {
    name: "Grace Wanjiku",
    email: "grace.wanjiku@equalityvanguard.org",
    role: "editor",
    title: "Program Manager - Mental Health",
    bio: "Grace Wanjiku is a licensed psychologist and mental health advocate with a Master's degree in Clinical Psychology. She has dedicated her career to breaking down mental health stigma and creating safe spaces for women to seek help and support.",
    image: "/images/team/grace-wanjiku.jpg",
    socialLinks: {
      twitter: "https://twitter.com/gracewanjiku",
      linkedin: "https://linkedin.com/in/gracewanjiku"
    },
    expertise: ["Clinical Psychology", "Mental Health Advocacy", "Trauma Counseling", "Community Outreach"],
    location: "Mombasa, Kenya",
    isActive: true
  },
  {
    name: "Amina Hassan",
    email: "amina.hassan@equalityvanguard.org",
    role: "editor",
    title: "Legal Advocacy Coordinator",
    bio: "Amina Hassan is a human rights lawyer with extensive experience in women's legal advocacy. She holds an LLM in International Human Rights Law and has successfully litigated numerous cases involving women's rights violations.",
    image: "/images/team/amina-hassan.jpg",
    socialLinks: {
      twitter: "https://twitter.com/aminahassan",
      linkedin: "https://linkedin.com/in/aminahassan"
    },
    expertise: ["Human Rights Law", "Women's Legal Rights", "International Law", "Litigation"],
    location: "Nairobi, Kenya",
    isActive: true
  },
  {
    name: "Dr. Mercy Ochieng",
    email: "mercy.ochieng@equalityvanguard.org",
    role: "editor",
    title: "SRHR Program Director",
    bio: "Dr. Mercy Ochieng is a public health specialist with a focus on sexual and reproductive health and rights. She holds a PhD in Public Health and has worked with various international organizations to improve SRHR outcomes for women and girls.",
    image: "/images/team/mercy-ochieng.jpg",
    socialLinks: {
      twitter: "https://twitter.com/mercyochieng",
      linkedin: "https://linkedin.com/in/mercyochieng"
    },
    expertise: ["Public Health", "SRHR", "Health Policy", "Community Health"],
    location: "Kisumu, Kenya",
    isActive: true
  },
  {
    name: "Fatma Ali",
    email: "fatma.ali@equalityvanguard.org",
    role: "reviewer",
    title: "Digital Rights Specialist",
    bio: "Fatma Ali is a technology and human rights expert with a background in computer science and digital rights advocacy. She leads our digital rights program and works to ensure women's safety and rights in digital spaces.",
    image: "/images/team/fatma-ali.jpg",
    socialLinks: {
      twitter: "https://twitter.com/fatmaali",
      linkedin: "https://linkedin.com/in/fatmaali"
    },
    expertise: ["Digital Rights", "Technology", "Cybersecurity", "Digital Literacy"],
    location: "Nairobi, Kenya",
    isActive: true
  },
  {
    name: "Dr. Wanjiku Mwangi",
    email: "wanjiku.mwangi@equalityvanguard.org",
    role: "reviewer",
    title: "Research Director",
    bio: "Dr. Wanjiku Mwangi is a social researcher with expertise in gender studies and policy analysis. She leads our research initiatives and ensures that our advocacy work is grounded in evidence and data.",
    image: "/images/team/wanjiku-mwangi.jpg",
    socialLinks: {
      twitter: "https://twitter.com/wanjikumwangi",
      linkedin: "https://linkedin.com/in/wanjikumwangi"
    },
    expertise: ["Social Research", "Gender Studies", "Policy Analysis", "Data Analysis"],
    location: "Nairobi, Kenya",
    isActive: true
  },
  {
    name: "Hassan Omar",
    email: "hassan.omar@equalityvanguard.org",
    role: "finance",
    title: "Finance Manager",
    bio: "Hassan Omar is a certified public accountant with extensive experience in nonprofit financial management. He ensures the organization's financial health and transparency while supporting our mission through sound financial practices.",
    image: "/images/team/hassan-omar.jpg",
    socialLinks: {
      linkedin: "https://linkedin.com/in/hassanomar"
    },
    expertise: ["Financial Management", "Nonprofit Accounting", "Budget Planning", "Financial Reporting"],
    location: "Nairobi, Kenya",
    isActive: true
  },
  {
    name: "Mary Wanjiku",
    email: "mary.wanjiku@equalityvanguard.org",
    role: "editor",
    title: "Communications Manager",
    bio: "Mary Wanjiku is a communications specialist with a background in journalism and public relations. She leads our communications strategy and ensures our message reaches the right audiences through various channels.",
    image: "/images/team/mary-wanjiku.jpg",
    socialLinks: {
      twitter: "https://twitter.com/marywanjiku",
      linkedin: "https://linkedin.com/in/marywanjiku"
    },
    expertise: ["Communications", "Journalism", "Public Relations", "Social Media"],
    location: "Nairobi, Kenya",
    isActive: true
  },
  {
    name: "Dr. Patricia Kimani",
    email: "patricia.kimani@equalityvanguard.org",
    role: "reviewer",
    title: "Community Outreach Coordinator",
    bio: "Dr. Patricia Kimani is a community development specialist with a PhD in Social Work. She leads our community outreach programs and ensures that our work is grounded in the needs and voices of the communities we serve.",
    image: "/images/team/patricia-kimani.jpg",
    socialLinks: {
      twitter: "https://twitter.com/patriciakimani",
      linkedin: "https://linkedin.com/in/patriciakimani"
    },
    expertise: ["Community Development", "Social Work", "Outreach", "Community Engagement"],
    location: "Eldoret, Kenya",
    isActive: true
  },
  {
    name: "James Mwangi",
    email: "james.mwangi@equalityvanguard.org",
    role: "reviewer",
    title: "IT Support Specialist",
    bio: "James Mwangi is an IT professional with expertise in system administration and technical support. He ensures our digital infrastructure runs smoothly and supports our team's technology needs.",
    image: "/images/team/james-mwangi.jpg",
    socialLinks: {
      linkedin: "https://linkedin.com/in/jamesmwangi"
    },
    expertise: ["System Administration", "Technical Support", "Network Management", "Database Administration"],
    location: "Nairobi, Kenya",
    isActive: true
  }
];

export async function migrateTeam() {
  try {
    console.log('👥 Starting team migration...');
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const memberData of teamData) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: memberData.email });
        if (existingUser) {
          console.log(`⏭️  Skipping existing team member: ${memberData.name}`);
          skippedCount++;
          continue;
        }
        
        // Create user
        const user = new User({
          ...memberData,
          emailVerified: new Date(),
          isActive: true,
          lastLogin: new Date()
        });
        
        await user.save();
        console.log(`✅ Migrated: ${memberData.name}`);
        migratedCount++;
        
      } catch (error) {
        console.error(`❌ Error migrating team member "${memberData.name}":`, error);
      }
    }
    
    console.log(`\n📊 Team migration summary:`);
    console.log(`   ✅ Migrated: ${migratedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   👥 Total: ${teamData.length}`);
    
  } catch (error) {
    console.error('❌ Error in team migration:', error);
    throw error;
  }
}
