const axios = require('axios');
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

const SHEETS_URL = process.env.SHEETS_URL || 'https://script.google.com/macros/s/AKfycbw2SfGbp73DxRE54CJ7-THv0CA-cQwTQnISorQ6AxmMF_Fl_ueWyUMUDwsmkMXdVU5r7g/exec';

const TEMPLATE_PATH = path.join(__dirname, 'template.html');
const ARTICLES_JSON_PATH = path.resolve(__dirname, '../articles.json');
const OUT_DIR = path.resolve(__dirname, '../article');
const IMG_DIR = 'img';

function toSlug(str) {
  if (!str) return 'unknown';
  return str.toString().trim().toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function convertGoogleDriveLink(url) {
  if (!url || typeof url !== 'string') return url;
  
  // Check if it's a Google Drive sharing link
  const driveMatch = url.match(/https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/view/);
  if (driveMatch) {
    const fileId = driveMatch[1];
    // Use thumbnail format which is more reliable for web display
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }
  
  // If it's already a direct Google Drive link, return as is
  if (url.includes('drive.google.com/')) {
    return url;
  }
  
  return url;
}

function backupArticlesJson() {
  const timestamp = Math.floor(Date.now() / 1000);
  const backupPath = `${ARTICLES_JSON_PATH}.bak.${timestamp}`;
  if (fs.existsSync(ARTICLES_JSON_PATH)) {
    fs.copyFileSync(ARTICLES_JSON_PATH, backupPath);
    console.log(`✅ Backup: ${path.basename(backupPath)}`);
  }
}

function readExistingArticles() {
  try {
    if (fs.existsSync(ARTICLES_JSON_PATH)) {
      return JSON.parse(fs.readFileSync(ARTICLES_JSON_PATH, 'utf8'));
    }
  } catch (e) {
    console.warn('⚠️  Error reading articles.json:', e.message);
  }
  return [];
}

function extractFirstImage(content) {
  // Look for the main article image - specifically with class "img-fluid w-100"
  // This is the standard featured image container in the template
  const mainImageMatch = content.match(/<img[^>]*class="img-fluid w-100"[^>]*src=["']([^"']+)["'][^>]*>/i);
  
  if (mainImageMatch) {
    const src = mainImageMatch[1];
    const normalizedSrc = src.replace('../img/', 'img/');
    return normalizedSrc;
  }
  
  // Fallback: look for any first significant image (not logo, ads, or profile pics)
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  
  while ((match = imgRegex.exec(content)) !== null) {
    const src = match[1];
    if (!src.includes('logo.png') && 
        !src.includes('ads-') && 
        !src.includes('cewe') && 
        !src.includes('cowok') && 
        !src.includes('alfin.jpg')) {
      const normalizedSrc = src.replace('../img/', 'img/');
      return normalizedSrc;
    }
  }
  
  return 'img/news-700x435-2.jpg';
}

function scanLocalArticles() {
  const localArticles = [];
  if (!fs.existsSync(OUT_DIR)) return localArticles;
  
  const files = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.html') && !f.endsWith('-f.html'));
  console.log(`📂 Found ${files.length} local HTML files in article/ folder`);
  
  for (const file of files) {
    try {
      const slug = file.replace('.html', '');
      const filePath = path.join(OUT_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract title from <h1> or <title> tag
      let title = 'Untitled';
      const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/);
      const titleMatch = content.match(/<title>([^<]+)<\/title>/);
      if (h1Match) title = h1Match[1].trim();
      else if (titleMatch) title = titleMatch[1].trim();
      
      // Extract excerpt from first <p> tag
      let excerpt = '';
      const pMatch = content.match(/<p[^>]*>([^<]+)<\/p>/);
      if (pMatch) excerpt = pMatch[1].trim().substring(0, 150);
      
      // Extract first image from content
      const imagePath = extractFirstImage(content);
      
// Extract category from badge element
let category = 'Lokal';
const badgeMatch = content.match(/<a[^>]*class="badge[^"]*"[^>]*>([^<]+)<\/a>/i);
if (badgeMatch) category = badgeMatch[1].trim();
      
      localArticles.push({
        title,
        excerpt,
        category,
        date: new Date().toISOString().split('T')[0],
        image: imagePath,
        url: `article/${slug}.html`,
        slug,
        isLocal: true
      });
      console.log(`   📄 ${slug} (image: ${imagePath})`);
    } catch (err) {
      console.warn(`   ⚠️  Error reading ${file}:`, err.message);
    }
  }
  
  return localArticles;
}

async function generateArticles() {
  try {
    console.log('📥 Fetching articles from Sheets...');
    let newArticles = [];
    
    try {
      // Increased timeout to 30 seconds for Google Sheets API
      const resp = await axios.get(SHEETS_URL, { timeout: 30000 });
      newArticles = resp.data;
      
      if (!Array.isArray(newArticles) || newArticles.length === 0) {
        console.warn('⚠️  No articles found from Sheets. Using existing articles.json');
        // Use existing articles if Sheets is empty
        newArticles = readExistingArticles();
      } else {
        console.log(`✅ Successfully fetched ${newArticles.length} articles from Sheets.`);
      }
    } catch (sheetError) {
      if (sheetError.code === 'ECONNABORTED' || sheetError.message.includes('timeout')) {
        console.warn('⚠️  ⏱️  Google Sheets API timeout - using existing articles.json');
        // Use existing articles if timeout occurs
        newArticles = readExistingArticles();
        if (newArticles.length === 0) {
          console.error('❌ No existing articles found either!');
          process.exit(1);
        }
        console.log(`   Loaded ${newArticles.length} existing articles instead`);
      } else {
        throw sheetError;
      }
    }
    
    if (!Array.isArray(newArticles) || newArticles.length === 0) {
      console.warn('⚠️  No articles available.');
      return;
    }
    console.log(`📊 Processing ${newArticles.length} articles.`);

    if (!fs.existsSync(TEMPLATE_PATH)) {
      console.error(`❌ Template not found: ${TEMPLATE_PATH}`);
      process.exit(1);
    }
    const template = Handlebars.compile(fs.readFileSync(TEMPLATE_PATH, 'utf8'));

    if (!fs.existsSync(OUT_DIR)) {
      fs.mkdirSync(OUT_DIR, { recursive: true });
    }

    let existingArticles = readExistingArticles();
    console.log(`📖 Found ${existingArticles.length} existing articles.`);
    
    backupArticlesJson();

    let newCount = 0, updateCount = 0, skipCount = 0;

    for (const row of newArticles) {
      try {
        const slug = row.slug ? toSlug(row.slug) : toSlug(row.title);
        if (!slug || slug === 'unknown') {
          console.warn(`⏭️  Skip: ${row.title}`);
          skipCount++;
          continue;
        }

        let imagePath = row.image && !row.image.startsWith('http') 
          ? `${IMG_DIR}/${row.image}` 
          : (row.image || '');
        
        // Convert Google Drive links to direct viewable links
        imagePath = convertGoogleDriveLink(imagePath);
        
        let imagePathForHTML = imagePath && !imagePath.startsWith('http')
          ? `../${imagePath}`
          : imagePath;

        let content = row.content || row.excerpt || '<p>No content</p>';
        if (content && !content.includes('<')) {
          content = `<p>${content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
        }

        const articleData = {
          title: row.title || 'Untitled',
          date: row.date || new Date().toISOString().split('T')[0],
          category: row.category || row.badge || 'News',
          badge: row.badge || row.category || 'News',
          image: imagePathForHTML,
          content,
          author: row.author || '',
          excerpt: row.excerpt || content.replace(/<[^>]*>/g, '').substring(0, 150),
          slug
        };

        const html = template(articleData);
        fs.writeFileSync(path.join(OUT_DIR, `${slug}.html`), html, 'utf8');

        const jsonEntry = {
          title: articleData.title,
          excerpt: articleData.excerpt.replace(/<[^>]*>/g, '').substring(0, 150),
          category: articleData.category,
          date: articleData.date,
          image: imagePath,
          url: `article/${slug}.html`,
          slug
        };
        if (articleData.author) jsonEntry.author = articleData.author;

        const idx = existingArticles.findIndex(a => a.slug === slug);
        if (idx !== -1) {
          existingArticles[idx] = jsonEntry;
          console.log(`🔄 Update: ${slug}`);
          updateCount++;
        } else {
          existingArticles.unshift(jsonEntry);
          console.log(`✅ New: ${slug}`);
          newCount++;
        }
      } catch (err) {
        console.error(`❌ Error (${row?.title}):`, err.message);
      }
    }

    // PRESERVE LOCAL ARTICLES (not from sheet)
    const sheetSlugs = new Set(newArticles.map(r => (r.slug ? toSlug(r.slug) : toSlug(r.title))).filter(s => s && s !== 'unknown'));
    const localArticlesScan = scanLocalArticles();
    
    // Add local articles that are not in the sheets
    let localPreserved = 0;
    for (const local of localArticlesScan) {
      const idx = existingArticles.findIndex(a => a.slug === local.slug);
      if (!sheetSlugs.has(local.slug)) {
        if (idx !== -1) {
          existingArticles[idx] = local;
        } else {
          existingArticles.unshift(local);
        }
        localPreserved++;
        console.log(`📌 Preserve local: ${local.slug}`);
      }
    }
    
    // Only delete articles that exist in sheet but were removed from sheet
    const removed = existingArticles.filter(a => sheetSlugs.has(a.slug) === false && a.isLocal !== true);
    if (removed.length) {
      console.log(`🗑️  Would delete ${removed.length} articles (not in sheet and not local):`);
      removed.forEach(a => {
        console.log(`   - ${a.slug}`);
      });
      existingArticles = existingArticles.filter(a => sheetSlugs.has(a.slug) || a.isLocal === true);
    }

    fs.writeFileSync(ARTICLES_JSON_PATH, JSON.stringify(existingArticles, null, 2), 'utf8');
    console.log(`💾 Updated ${ARTICLES_JSON_PATH}`);

    console.log(`\n📋 Summary:`);
    console.log(`   ✨ New: ${newCount}`);
    console.log(`   🔄 Updated: ${updateCount}`);
    console.log(`   ⏭️  Skipped: ${skipCount}`);
    console.log(`     Local preserved: ${localPreserved}`);
    console.log(`    🗑️  Deleted: ${removed.length}`);
    console.log(`   📁 Total: ${existingArticles.length}`);
    console.log(`\n✅ Done!`);
  } catch (err) {
    console.error('❌ Fatal:', err.message);
    if (err.response?.data) console.error('Response:', err.response.data);
    process.exit(1);
  }
}

generateArticles();
