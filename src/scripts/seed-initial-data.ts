import { connectDB } from '@/lib/mongodb';
import Category from '@/models/Category';
import Tag from '@/models/Tag';
import Setting from '@/models/Setting';

// Initial categories for publications and content
const categoriesData = [
  {
    name: "Digital Rights",
    slug: "digital-rights",
    description: "Content related to digital rights, privacy, and technology",
    color: "#3B82F6",
    icon: "laptop",
    isActive: true
  },
  {
    name: "Economic Justice",
    slug: "economic-justice",
    description: "Content related to women's economic empowerment and financial rights",
    color: "#10B981",
    icon: "dollar-sign",
    isActive: true
  },
  {
    name: "Legal Advocacy",
    slug: "legal-advocacy",
    description: "Content related to legal rights and advocacy",
    color: "#8B5CF6",
    icon: "scale",
    isActive: true
  },
  {
    name: "SRHR",
    slug: "srhr",
    description: "Sexual and Reproductive Health and Rights content",
    color: "#EC4899",
    icon: "heart",
    isActive: true
  },
  {
    name: "Mental Health",
    slug: "mental-health",
    description: "Content related to mental health and wellbeing",
    color: "#F59E0B",
    icon: "brain",
    isActive: true
  },
  {
    name: "Gender Justice",
    slug: "gender-justice",
    description: "General gender justice and equality content",
    color: "#EF4444",
    icon: "users",
    isActive: true
  },
  {
    name: "Climate Justice",
    slug: "climate-justice",
    description: "Content related to climate change and environmental justice",
    color: "#06B6D4",
    icon: "leaf",
    isActive: true
  },
  {
    name: "Education",
    slug: "education",
    description: "Educational content and resources",
    color: "#84CC16",
    icon: "book-open",
    isActive: true
  }
];

// Initial tags for content classification
const tagsData = [
  // Digital Rights
  { name: "privacy", category: "digital-rights", color: "#3B82F6" },
  { name: "data-protection", category: "digital-rights", color: "#3B82F6" },
  { name: "online-safety", category: "digital-rights", color: "#3B82F6" },
  { name: "digital-literacy", category: "digital-rights", color: "#3B82F6" },
  { name: "cybersecurity", category: "digital-rights", color: "#3B82F6" },
  
  // Economic Justice
  { name: "entrepreneurship", category: "economic-justice", color: "#10B981" },
  { name: "financial-literacy", category: "economic-justice", color: "#10B981" },
  { name: "wage-equity", category: "economic-justice", color: "#10B981" },
  { name: "access-to-credit", category: "economic-justice", color: "#10B981" },
  { name: "economic-empowerment", category: "economic-justice", color: "#10B981" },
  
  // Legal Advocacy
  { name: "constitutional-rights", category: "legal-advocacy", color: "#8B5CF6" },
  { name: "legal-aid", category: "legal-advocacy", color: "#8B5CF6" },
  { name: "access-to-justice", category: "legal-advocacy", color: "#8B5CF6" },
  { name: "human-rights", category: "legal-advocacy", color: "#8B5CF6" },
  { name: "policy-advocacy", category: "legal-advocacy", color: "#8B5CF6" },
  
  // SRHR
  { name: "reproductive-rights", category: "srhr", color: "#EC4899" },
  { name: "sexual-health", category: "srhr", color: "#EC4899" },
  { name: "family-planning", category: "srhr", color: "#EC4899" },
  { name: "maternal-health", category: "srhr", color: "#EC4899" },
  { name: "consent", category: "srhr", color: "#EC4899" },
  
  // Mental Health
  { name: "wellbeing", category: "mental-health", color: "#F59E0B" },
  { name: "stigma", category: "mental-health", color: "#F59E0B" },
  { name: "trauma", category: "mental-health", color: "#F59E0B" },
  { name: "therapy", category: "mental-health", color: "#F59E0B" },
  { name: "self-care", category: "mental-health", color: "#F59E0B" },
  
  // Gender Justice
  { name: "feminism", category: "gender-justice", color: "#EF4444" },
  { name: "intersectionality", category: "gender-justice", color: "#EF4444" },
  { name: "equality", category: "gender-justice", color: "#EF4444" },
  { name: "leadership", category: "gender-justice", color: "#EF4444" },
  { name: "empowerment", category: "gender-justice", color: "#EF4444" },
  
  // Climate Justice
  { name: "environment", category: "climate-justice", color: "#06B6D4" },
  { name: "sustainability", category: "climate-justice", color: "#06B6D4" },
  { name: "climate-change", category: "climate-justice", color: "#06B6D4" },
  { name: "green-economy", category: "climate-justice", color: "#06B6D4" },
  { name: "environmental-rights", category: "climate-justice", color: "#06B6D4" },
  
  // Education
  { name: "literacy", category: "education", color: "#84CC16" },
  { name: "skills-development", category: "education", color: "#84CC16" },
  { name: "training", category: "education", color: "#84CC16" },
  { name: "capacity-building", category: "education", color: "#84CC16" },
  { name: "knowledge-sharing", category: "education", color: "#84CC16" },
  
  // General tags
  { name: "kenya", category: "general", color: "#6B7280" },
  { name: "africa", category: "general", color: "#6B7280" },
  { name: "women", category: "general", color: "#6B7280" },
  { name: "youth", category: "general", color: "#6B7280" },
  { name: "community", category: "general", color: "#6B7280" },
  { name: "advocacy", category: "general", color: "#6B7280" },
  { name: "policy", category: "general", color: "#6B7280" },
  { name: "research", category: "general", color: "#6B7280" }
];

// Initial settings for the application
const settingsData = [
  {
    key: "site_name",
    value: "Equality Vanguard",
    type: "string",
    description: "The name of the website",
    category: "general"
  },
  {
    key: "site_description",
    value: "Advancing gender justice and women's rights in Kenya through advocacy, education, and community empowerment.",
    type: "text",
    description: "The description of the website",
    category: "general"
  },
  {
    key: "contact_email",
    value: "info@equalityvanguard.org",
    type: "email",
    description: "Main contact email address",
    category: "contact"
  },
  {
    key: "contact_phone",
    value: "+254 700 000 000",
    type: "string",
    description: "Main contact phone number",
    category: "contact"
  },
  {
    key: "address",
    value: "Nairobi, Kenya",
    type: "text",
    description: "Physical address",
    category: "contact"
  },
  {
    key: "social_media_twitter",
    value: "https://twitter.com/equalityvanguard",
    type: "url",
    description: "Twitter profile URL",
    category: "social_media"
  },
  {
    key: "social_media_facebook",
    value: "https://facebook.com/equalityvanguard",
    type: "url",
    description: "Facebook page URL",
    category: "social_media"
  },
  {
    key: "social_media_instagram",
    value: "https://instagram.com/equalityvanguard",
    type: "url",
    description: "Instagram profile URL",
    category: "social_media"
  },
  {
    key: "social_media_linkedin",
    value: "https://linkedin.com/company/equalityvanguard",
    type: "url",
    description: "LinkedIn company page URL",
    category: "social_media"
  },
  {
    key: "newsletter_enabled",
    value: "true",
    type: "boolean",
    description: "Whether newsletter functionality is enabled",
    category: "features"
  },
  {
    key: "donations_enabled",
    value: "true",
    type: "boolean",
    description: "Whether donation functionality is enabled",
    category: "features"
  },
  {
    key: "membership_enabled",
    value: "true",
    type: "boolean",
    description: "Whether membership functionality is enabled",
    category: "features"
  },
  {
    key: "events_enabled",
    value: "true",
    type: "boolean",
    description: "Whether events functionality is enabled",
    category: "features"
  },
  {
    key: "shop_enabled",
    value: "true",
    type: "boolean",
    description: "Whether e-commerce functionality is enabled",
    category: "features"
  },
  {
    key: "maintenance_mode",
    value: "false",
    type: "boolean",
    description: "Whether the site is in maintenance mode",
    category: "system"
  },
  {
    key: "registration_enabled",
    value: "true",
    type: "boolean",
    description: "Whether user registration is enabled",
    category: "system"
  },
  {
    key: "comments_enabled",
    value: "true",
    type: "boolean",
    description: "Whether comments are enabled on content",
    category: "features"
  },
  {
    key: "analytics_google_id",
    value: "",
    type: "string",
    description: "Google Analytics tracking ID",
    category: "analytics"
  },
  {
    key: "seo_default_title",
    value: "Equality Vanguard - Advancing Gender Justice in Kenya",
    type: "string",
    description: "Default SEO title for the site",
    category: "seo"
  },
  {
    key: "seo_default_description",
    value: "Equality Vanguard is a leading organization advancing gender justice and women's rights in Kenya through advocacy, education, and community empowerment.",
    type: "text",
    description: "Default SEO description for the site",
    category: "seo"
  }
];

export async function seedInitialData() {
  try {
    console.log('🌱 Starting initial data seeding...');
    
    // Seed categories
    console.log('📂 Seeding categories...');
    let categoryCount = 0;
    for (const categoryData of categoriesData) {
      try {
        const existingCategory = await Category.findOne({ slug: categoryData.slug });
        if (!existingCategory) {
          const category = new Category(categoryData);
          await category.save();
          categoryCount++;
        }
      } catch (error) {
        console.error(`❌ Error seeding category "${categoryData.name}":`, error);
      }
    }
    console.log(`✅ Seeded ${categoryCount} categories`);
    
    // Seed tags
    console.log('🏷️  Seeding tags...');
    let tagCount = 0;
    for (const tagData of tagsData) {
      try {
        const existingTag = await Tag.findOne({ name: tagData.name });
        if (!existingTag) {
          const tag = new Tag(tagData);
          await tag.save();
          tagCount++;
        }
      } catch (error) {
        console.error(`❌ Error seeding tag "${tagData.name}":`, error);
      }
    }
    console.log(`✅ Seeded ${tagCount} tags`);
    
    // Seed settings
    console.log('⚙️  Seeding settings...');
    let settingCount = 0;
    for (const settingData of settingsData) {
      try {
        const existingSetting = await Setting.findOne({ key: settingData.key });
        if (!existingSetting) {
          const setting = new Setting(settingData);
          await setting.save();
          settingCount++;
        }
      } catch (error) {
        console.error(`❌ Error seeding setting "${settingData.key}":`, error);
      }
    }
    console.log(`✅ Seeded ${settingCount} settings`);
    
    console.log('\n🎉 Initial data seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error in initial data seeding:', error);
    throw error;
  }
}
