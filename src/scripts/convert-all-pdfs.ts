import { connectDB } from '../lib/mongodb';
import Publication from '../models/Publication';
import { convertPDFToHTML } from '../lib/pdf-converter';
import path from 'path';
import fs from 'fs/promises';

async function convertAllPublications() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Get all publications
    const publications = await Publication.find({});
    console.log(`Found ${publications.length} publications\n`);

    let convertedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const pub of publications) {
      try {
        // Skip if already has HTML content
        if (pub.content && pub.content.length > 100 && pub.content.includes('<div')) {
          console.log(`⏭️  Skipping "${pub.title}" - already has HTML content`);
          skippedCount++;
          continue;
        }

        // Try to find PDF file
        let pdfPath = '';
        
        // Check if pdfUrl exists
        if (pub.pdfUrl) {
          const cleanPath = pub.pdfUrl.startsWith('/') ? pub.pdfUrl.slice(1) : pub.pdfUrl;
          pdfPath = path.join(process.cwd(), 'public', cleanPath);
          
          // Check if file exists
          try {
            await fs.access(pdfPath);
          } catch {
            // If not found, try in files/publications
            const fileName = path.basename(cleanPath);
            pdfPath = path.join(process.cwd(), 'public', 'files', 'publications', fileName);
            await fs.access(pdfPath);
          }
        } else {
          // Try to find by slug or title
          const fileName = `${pub.slug}.pdf` || `${pub.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
          pdfPath = path.join(process.cwd(), 'public', 'files', 'publications', fileName);
          await fs.access(pdfPath);
        }

        console.log(`📄 Converting "${pub.title}"...`);
        const result = await convertPDFToHTML(pdfPath);
        
        // Update publication with HTML content
        pub.content = result.html;
        if (result.images && result.images.length > 0) {
          pub.images = result.images;
        }
        await pub.save();
        
        console.log(`✅ Converted "${pub.title}" - ${result.html.length} characters`);
        convertedCount++;
      } catch (error) {
        console.error(`❌ Error converting "${pub.title}":`, error instanceof Error ? error.message : error);
        errorCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Converted: ${convertedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`\n✅ Done!`);
    process.exit(0);
  } catch (error) {
    console.error('Error converting publications:', error);
    process.exit(1);
  }
}

convertAllPublications();
