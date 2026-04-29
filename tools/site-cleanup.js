const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const rootDir = process.argv[2] || '.';
const apply = process.argv.includes('--apply');
const verbose = process.argv.includes('--verbose') || process.argv.includes('-v');
const dryRun = !apply;

const trendingHtml = `<!-- Trending News Start -->
<div class="mb-5">
    <div class="section-title mb-0">
        <h4 class="m-0 text-uppercase font-weight-bold">Berita Trending</h4>
    </div>
    <div class="bg-white border border-top-0 p-4">
        <div class="d-flex align-items-center bg-white mb-4 pb-3 border-bottom" style="min-height: 90px;">
            <a href="article/perhutani-majalengka.html" class="flex-shrink-0 mr-3">
                <img src="img/imgnews-700x435-5.jpg" alt="" style="width: 100px; height: 90px; object-fit: cover; border-radius: 3px;">
            </a>
            <div class="flex-grow-1">
                <div class="mb-2">
                    <a class="badge badge-primary news-badge mr-2" href="">Ekonomi</a>
                    <a class="text-muted" href=""><small>Jan 26</small></a>
                </div>
                <a class="h6 m-0 text-secondary text-uppercase font-weight-bold small" href="article/perhutani-majalengka.html">Perhutani KPH Majalengka...</a>
            </div>
        </div>
        <div class="d-flex align-items-center bg-white mb-4 pb-3 border-bottom" style="min-height: 90px;">
            <a href="article/bojan-hodak.html" class="flex-shrink-0 mr-3">
                <img src="img/news-700x435-2.jpg" alt="" style="width: 100px; height: 90px; object-fit: cover; border-radius: 3px;">
            </a>
            <div class="flex-grow-1">
                <div class="mb-2">
                    <a class="badge badge-primary news-badge mr-2" href="">Olahraga</a>
                    <a class="text-muted" href=""><small>Jan 27</small></a>
                </div>
                <a class="h6 m-0 text-secondary text-uppercase font-weight-bold small" href="article/bojan-hodak.html">Bojan Pertimbang...</a>
            </div>
        </div>
        <div class="d-flex align-items-center bg-white mb-4 pb-3 border-bottom" style="min-height: 90px;">
            <a href="article/masih-ingat-resbob.html" class="flex-shrink-0 mr-3">
                <img src="img/news-700x435-3.jpg" alt="" style="width: 100px; height: 90px; object-fit: cover; border-radius: 3px;">
            </a>
            <div class="flex-grow-1">
                <div class="mb-2">
                    <a class="badge badge-primary news-badge mr-2" href="">Hukum</a>
                    <a class="text-muted" href=""><small>Jan 20</small></a>
                </div>
                <a class="h6 m-0 text-secondary text-uppercase font-weight-bold small" href="article/masih-ingat-resbob.html">Masih Ingat Resbob?</a>
            </div>
        </div>
        <div class="d-flex align-items-center bg-white" style="min-height: 90px;">
            <a href="article/longsor-bandung.html" class="flex-shrink-0 mr-3">
                <img src="img/akang.jpg" alt="" style="width: 100px; height: 90px; object-fit: cover; border-radius: 3px;">
            </a>
            <div class="flex-grow-1">
                <div class="mb-2">
                    <a class="badge badge-primary news-badge mr-2" href="">Ekonomi</a>
                    <a class="text-muted" href=""><small>Jan 27</small></a>
                </div>
                <a class="h6 m-0 text-secondary text-uppercase font-weight-bold small" href="article/longsor-bandung.html">Warga Korban Longsor...</a>
            </div>
        </div>
    </div>
</div>
<!-- Trending News End -->
`;

const tagsHtml = `<!-- Tags Start -->
<div class="mb-5">
    <div class="section-title mb-0">
        <h4 class="m-0 text-uppercase font-weight-bold">Kategori</h4>
    </div>
    <div class="bg-white border border-top-0 p-4">
        <div class="d-flex flex-wrap gap-2">
            <a href="search.html?q=Lingkungan" class="btn btn-sm btn-outline-secondary">Lingkungan</a>
            <a href="search.html?q=Ekonomi" class="btn btn-sm btn-outline-secondary">Ekonomi</a>
            <a href="search.html?q=Keamanan" class="btn btn-sm btn-outline-secondary">Keamanan</a>
            <a href="search.html?q=Pendidikan" class="btn btn-sm btn-outline-secondary">Pendidikan</a>
            <a href="search.html?q=Pangan" class="btn btn-sm btn-outline-secondary">Pangan</a>
            <a href="search.html?q=Hukum" class="btn btn-sm btn-outline-secondary">Hukum</a>
            <a href="search.html?q=Olahraga" class="btn btn-sm btn-outline-secondary">Olahraga</a>
            <a href="search.html?q=Kesehatan" class="btn btn-sm btn-outline-secondary">Kesehatan</a>
            <a href="search.html?q=Sosial" class="btn btn-sm btn-outline-secondary">Sosial</a>
        </div>
    </div>
</div>
<!-- Tags End -->
`;

const siteSpecificPages = ['news.html', 'contact.html'];
const removeLabels = [
  'follow us',
  'social follow',
  'newsletter',
  'ikuti kami'
];

function walk(dir) {
  const result = [];
  for (const child of fs.readdirSync(dir, { withFileTypes: true })) {
    const childPath = path.join(dir, child.name);
    if (child.isDirectory()) {
      if (child.name === 'node_modules' || child.name === '.git') continue;
      result.push(...walk(childPath));
    } else if (child.isFile() && child.name.toLowerCase().endsWith('.html')) {
      result.push(childPath);
    }
  }
  return result;
}

function normalizeClassValue(classes) {
  return classes
    .split(/\s+/)
    .filter(Boolean)
    .join(' ');
}

function removeTopbar($) {
  $('div.container-fluid.d-none.d-lg-block').each((_, el) => {
    const text = $(el).text().toLowerCase();
    if (text.includes('login') || text.includes('register') || text.includes('follow') || text.includes('newsletter') || text.includes('social')) {
      $(el).remove();
    }
  });
}

function removeAuthLinks($) {
  $('a[href*="login.html"], a[href*="register.html"]').each((_, el) => {
    const parent = $(el).parent();
    const grandParent = parent.parent();
    $(el).remove();
    if (parent.is('li') && parent.children().length === 0) {
      parent.remove();
    }
    if (grandParent.is('li') && grandParent.children().length === 0) {
      grandParent.remove();
    }
  });
}

function removeSidebarBlocks($) {
  $('div.section-title').each((_, el) => {
    const heading = $(el).text().trim().toLowerCase();
    if (removeLabels.some(label => heading.includes(label))) {
      const wrapper = $(el).closest('div.mb-5, div.mb-3');
      if (wrapper.length) {
        wrapper.remove();
      }
    }
  });
}

function removeFooterContact($) {
  $('div.container-fluid.bg-dark').each((_, el) => {
    const block = $(el);

    // Remove footer columns with contact or social sections from legacy sites.
    block.find('div').filter((_, col) => {
      const column = $(col);
      const classAttr = column.attr('class') || '';
      const isFooterColumn = /\bcol-(lg|md|sm|xs)-\d+\b/.test(classAttr) || /\bmb-(4|5)\b/.test(classAttr);
      if (!isFooterColumn) return false;

      const text = column.text().trim().toLowerCase();
      const html = column.html() || '';
      const heading = column.find('h1,h2,h3,h4,h5,h6').first().text().trim().toLowerCase();

      const hasFooterBrand = /bandung\s+news|bandung\s+bersuara|bandungnews|bandungbersuara/i.test(text + ' ' + heading);
      const hasContactInfo = /\bjl\.?\s*merdeka\b|jakarta pusat|bandungnews@gmail\.com|\+62\s*21|\bwww\.|\bfacebook\.com|\binstagram\.com|\btwitter\.com|\blinkedin\.com|\byoutube\.com|\btiktok\.com/i.test(text + ' ' + html);
      const hasFollowTitle = /follow\s+us|ikuti kami|social follow|follow/i.test(text + ' ' + heading);

      return hasFooterBrand || hasContactInfo || hasFollowTitle;
    }).remove();

    block.find('h1,h2,h3,h4,h5,h6').filter((_, h) => /follow\s+us|ikuti kami|social\s+follow/i.test($(h).text().trim().toLowerCase()))
      .closest('div.mb-5, div.mb-4, div.col-lg-3, div.col-lg-4, div.col-md-6').remove();

    // Remove footer login/register links only if they exist as part of the footer.
    block.find('a[href*="login.html"], a[href*="register.html"]').remove();
  });
}

function normalizeFooterClasses($) {
  $('div.container-fluid.bg-dark').each((_, el) => {
    const current = $(el).attr('class') || '';
    const updated = current
      .replace(/\bpt-5\b/g, 'pt-4')
      .replace(/\bmt-5\b/g, 'mt-4')
      .replace(/\s+/g, ' ') .trim();
    $(el).attr('class', updated);

    const style = ($(el).attr('style') || '').replace(/margin-top\s*:[^;]+;?/gi, '').trim();
    if (style) {
      $(el).attr('style', style);
    } else {
      $(el).removeAttr('style');
    }
  });

  $('div.col-lg-3.col-md-6.mb-5, div.col-lg-4.col-md-6.mb-4').each((_, el) => {
    if ($(el).closest('div.container-fluid.bg-dark').length) {
      const current = $(el).attr('class') || '';
      const updated = current
        .replace(/\bcol-lg-3\b/g, 'col-lg-4')
        .replace(/\bmb-5\b/g, 'mb-4')
        .replace(/\s+/g, ' ') .trim();
      $(el).attr('class', updated);
    }
  });

  $('div.container-fluid.bg-dark').each((_, el) => {
    const block = $(el);
    block.find('div.col-lg-4, div.col-md-6, div.mb-4, div.mb-5').filter((_, col) => !$(col).text().trim()).remove();
    block.find('div.row').filter((_, row) => !$(row).children().filter((_, child) => $(child).text().trim()).length).remove();
  });
}

function insertTrendingAndTags($, filePath) {
  const filename = path.basename(filePath).toLowerCase();
  if (!siteSpecificPages.includes(filename)) return false;

  const hasTrending = $('h4, h5, h6').filter((_, el) => /trending/i.test($(el).text().trim())).length > 0;
  const hasTags = $('h4, h5, h6').filter((_, el) => /(kategori|tags)/i.test($(el).text().trim())).length > 0;

  const sidebar = $('div.col-lg-4').first();
  if (!sidebar.length) {
    return false;
  }

  const trendingBlock = sidebar.find('div.mb-5').filter((_, el) => /berita\s+trending|trending\s+news/i.test($(el).text())).first();
  const tagsBlock = sidebar.find('div.mb-5').filter((_, el) => /(kategori|tags)/i.test($(el).text())).first();

  let inserted = false;
  if (!hasTrending) {
    if (hasTags && tagsBlock.length) {
      tagsBlock.before(trendingHtml);
    } else {
      sidebar.append(trendingHtml);
    }
    inserted = true;
  }

  if (!hasTags) {
    const currentTrending = sidebar.find('div.mb-5').filter((_, el) => /berita\s+trending|trending\s+news/i.test($(el).text())).first();
    if (currentTrending.length) {
      currentTrending.after(tagsHtml);
    } else {
      sidebar.append(tagsHtml);
    }
    inserted = true;
  }

  return inserted;
}

function processFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  const $ = cheerio.load(html, { decodeEntities: false });
  const before = $.html();

  removeTopbar($);
  removeAuthLinks($);
  removeSidebarBlocks($);
  removeFooterContact($);
  normalizeFooterClasses($);
  insertTrendingAndTags($, filePath);

  let updated = $.html();

  // Clean up duplicated blank lines from block removals
  updated = updated.replace(/\n{3,}/g, '\n\n');

  const changed = updated !== html;
  if (changed) {
    if (dryRun) {
      console.log(`✔ [DRY-RUN] Will update: ${filePath}`);
    } else {
      fs.writeFileSync(filePath, updated, 'utf8');
      console.log(`✔ Updated: ${filePath}`);
    }
  } else if (verbose) {
    console.log(`- No change: ${filePath}`);
  }

  return changed;
}

function main() {
  const startPath = path.resolve(rootDir);
  if (!fs.existsSync(startPath)) {
    console.error(`Path not found: ${startPath}`);
    process.exit(1);
  }

  const files = walk(startPath);
  if (!files.length) {
    console.error('No HTML files found.');
    process.exit(1);
  }

  console.log(`Scanning ${files.length} HTML file(s) in ${startPath}`);
  let changedCount = 0;

  for (const file of files) {
    try {
      if (processFile(file)) changedCount += 1;
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }

  console.log(`\nCompleted. ${changedCount} file(s) ${dryRun ? 'would be changed' : 'updated'}.`);
  if (dryRun) {
    console.log('Run with --apply to write changes to disk.');
  }
}

main();