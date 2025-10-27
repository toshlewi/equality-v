import fs from 'fs/promises';
import path from 'path';
import pdf from 'pdf-parse';

interface PDFConversionResult {
  html: string;
  images: string[];
}

/**
 * Convert a PDF file to HTML format
 * @param pdfPath - Full path to the PDF file
 * @returns HTML content and extracted images
 */
export async function convertPDFToHTML(pdfPath: string): Promise<PDFConversionResult> {
  try {
    // Read the PDF file
    const dataBuffer = await fs.readFile(pdfPath);
    
    // Parse the PDF
    const pdfData = await pdf(dataBuffer);
    
    // Extract text and structure
    let html = '<div class="publication-content">';
    
    // Split text into paragraphs
    const paragraphs = pdfData.text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    paragraphs.forEach((paragraph, index) => {
      // Check if it's a heading (typically shorter and ends with specific patterns)
      if (paragraph.length < 100 && !paragraph.endsWith('.')) {
        html += `<h2 class="section-heading">${escapeHtml(paragraph.trim())}</h2>`;
      } else {
        html += `<p class="paragraph">${escapeHtml(paragraph.trim())}</p>`;
      }
    });
    
    html += '</div>';
    
    // For images, we'll extract them if available from PDF metadata
    // Note: This is a simplified implementation. In production, you'd want to extract actual images
    const images: string[] = [];
    
    // Add base styling
    html = wrapWithStyles(html);
    
    return {
      html,
      images
    };
    
  } catch (error) {
    console.error('Error converting PDF to HTML:', error);
    throw new Error('Failed to convert PDF to HTML');
  }
}

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Wrap HTML with publication-specific styles
 */
function wrapWithStyles(content: string): string {
  return `
    <style>
      .publication-content {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.8;
        color: #333;
        max-width: 750px;
        margin: 0 auto;
        padding: 2rem;
      }
      .publication-content h2 {
        font-size: 1.75rem;
        font-weight: 700;
        margin-top: 2rem;
        margin-bottom: 1rem;
        color: #1a1a1a;
      }
      .publication-content .section-heading {
        font-size: 1.5rem;
        font-weight: 600;
        margin-top: 1.5rem 0 0.75rem 0;
        color: #2c3e50;
      }
      .publication-content p {
        margin-bottom: 1.25rem;
        text-align: justify;
      }
      .publication-content .paragraph {
        font-size: 1.1rem;
        line-height: 1.9;
      }
      .publication-content img {
        max-width: 100%;
        height: auto;
        margin: 1.5rem 0;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      @media (max-width: 768px) {
        .publication-content {
          padding: 1rem;
        }
        .publication-content p {
          font-size: 1rem;
        }
        .publication-content h2 {
          font-size: 1.5rem;
        }
      }
    </style>
    ${content}
  `;
}

/**
 * Process a PDF file and create publication content
 * @param pdfFilePath - Full path to the PDF file
 * @param title - Publication title for context
 * @returns Processed content with HTML and images
 */
export async function processPDFForPublication(
  pdfFilePath: string,
  title: string
): Promise<{ content: string; images: string[] }> {
  const result = await convertPDFToHTML(pdfFilePath);
  
  return {
    content: result.html,
    images: result.images
  };
}
