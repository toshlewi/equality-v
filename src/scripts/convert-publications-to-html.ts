import { connectDB } from '../lib/mongodb';
import Publication from '../models/Publication';
import { convertPDFToHTML } from '../lib/pdf-converter';
import path from 'path';
import fs from 'fs/promises';

async function convertPublications() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Get all publications
    const publications = await Publication.find({});
    console.log(`Found ${publications.length} publications`);

    for (const pub of publications) {
      // Skip if already has HTML content
      if (pub.content && pub.content.includes('<')) {
        console.log(`Skipping ${pub.title} - already has HTML content`);
        continue;
      }

      // Get PDF path from pdfUrl
      let pdfPath = '';
      if (pub.pdfUrl) {
        // Remove leading slash if present
        const cleanPath = pub.pdfUrl.startsWith('/') ? pub.pdfUrl.slice(1) : pub.pdfUrl;
        pdfPath = path.join(process.cwd(), 'public', cleanPath);
      } else {
        // Try to find PDF in public/files/publications
        const fileName = `${pub.slug}.pdf` || `${pub.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
        pdfPath = path.join(process.cwd(), 'public', 'files', 'publications', fileName);
      }

      try {
        // Check if file exists
        await fs.access(pdfPath);
        
        console.log(`Converting ${pub.title}...`);
        const result = await convertPDFToHTML(pdfPath);
        
        // Update publication with HTML content
        pub.content = result.html;
        await pub.save();
        
        console.log(`✓ Converted ${pub.title}`);
      } catch (error) {
        console.error(`Error converting ${pub.title}:`, error);
        // Continue with next publication
      }
    }

    console.log('\n✅ Done! All publications converted.');
    process.exit(0);
  } catch (error) {
    console.error('Error converting publications:', error);
    process.exit(1);
  }
}

convertPublications();
