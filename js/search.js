document.addEventListener('DOMContentLoaded', function() {
    function getQueryParam(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name) || '';
    }

    function normalizeImg(src){
        if(!src) return '';
        src = src.trim();
        src = src.replace(/^\.\./, '');
        src = src.replace(/^\//, '');
        return src;
    }

    const q = getQueryParam('q').trim();
    const input = document.querySelector('input[name="q"]');
    if (input) input.value = q;

    const resultsRow = document.getElementById('searchResultsRow');
    if (!resultsRow) return;

    // fallback: filter existing DOM items
    function fallbackFilter(){
        const items = Array.from(resultsRow.querySelectorAll('.col-12.mb-3'))
            .filter(el => el.querySelector('a'));

        if (!q) {
            items.forEach(i => i.style.display = 'block');
            return;
        }

        const keywords = q.toLowerCase().split(/\s+/).filter(Boolean);
        const validCategories = ['Lingkungan', 'Ekonomi', 'Keamanan', 'Pendidikan', 'Pangan', 'Hukum', 'Olahraga', 'Kesehatan', 'Sosial'];
        const isCategoryQuery = keywords.length === 1 && validCategories.some(cat => cat.toLowerCase() === keywords[0]);
        
        let matched = 0;
        items.forEach(item => {
            const titleEl = item.querySelector('h5');
            const excerptEl = item.querySelector('p');
            const badgeEl = item.querySelector('.badge');
            const linkEl = item.querySelector('a');

            const title = titleEl ? titleEl.textContent : '';
            const excerpt = excerptEl ? excerptEl.textContent : '';
            const badge = badgeEl ? badgeEl.textContent : '';
            const href = linkEl ? (linkEl.getAttribute('href') || '') : '';

            let isMatch = false;
            if (isCategoryQuery) {
                // Match only by category badge
                isMatch = badge.toLowerCase() === keywords[0];
            } else {
                const hay = (title + ' ' + excerpt + ' ' + badge + ' ' + href).toLowerCase();
                isMatch = keywords.every(k => hay.indexOf(k) !== -1);
            }

            if (isMatch) {
                item.style.display = 'block';
                matched++;
            } else {
                item.style.display = 'none';
            }
        });

        showMessage(matched, q);
    }

    function escapeHTML(s){
        return String(s || '').replace(/[&<>"'`]/g, function(ch){
            return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;","`":"&#96;"})[ch];
        });
    }

    function showMessage(count, q) {
        let noMsg = document.getElementById('noSearchResultsMsg');
        if (!noMsg) {
            noMsg = document.createElement('div');
            noMsg.id = 'noSearchResultsMsg';
            noMsg.style.marginTop = '1rem';
            noMsg.style.marginBottom = '1rem';
            resultsRow.parentNode.insertBefore(noMsg, resultsRow.nextSibling);
        }
        const safeQ = escapeHTML(q);
        if (count === 0) {
            noMsg.innerHTML = '<div class="alert alert-warning">No results found for <strong>' + safeQ + '</strong>.</div>';
        } else {
            noMsg.innerHTML = '<div class="alert alert-info">Found <strong>' + count + '</strong> result(s) for <strong>' + safeQ + '</strong>.</div>';
        }
    }

    function renderMatches(matches){
        resultsRow.innerHTML = '';
        matches.forEach(m => {
            const col = document.createElement('div');
            col.className = 'col-12 mb-3';
            const a = document.createElement('a');
            a.href = m.url;
            a.style.textDecoration = 'none';
            a.style.color = 'inherit';
            const outer = document.createElement('div');
            outer.className = 'd-flex align-items-center bg-white border p-3';

            const img = document.createElement('img');
            img.style.width = '180px';
            img.style.height = '120px';
            img.style.objectFit = 'cover';
            img.alt = m.title || '';
            // Use image from index, or fallback to berita10.png
            img.src = m.image || 'img/berita10.png';
            img.onerror = function() {
                this.src = 'img/berita10.png';
            };

            const inner = document.createElement('div');
            inner.className = 'pl-3 w-100';

            const meta = document.createElement('div');
            meta.className = 'mb-2';
            const badge = document.createElement('span');
            badge.className = 'badge badge-primary text-uppercase font-weight-semi-bold p-1 mr-2';
            badge.textContent = m.category || '';
            const date = document.createElement('small');
            date.className = 'text-muted';
            date.innerHTML = '<i class="fa fa-calendar-alt mr-1"></i> ' + (m.date || '');

            meta.appendChild(badge);
            meta.appendChild(date);

            const h5 = document.createElement('h5');
            h5.className = 'font-weight-bold text-uppercase text-secondary';
            h5.textContent = m.title;

            const p = document.createElement('p');
            p.className = 'm-0';
            p.textContent = m.excerpt || '';

            inner.appendChild(meta);
            inner.appendChild(h5);
            inner.appendChild(p);

            outer.appendChild(img);
            outer.appendChild(inner);
            a.appendChild(outer);
            col.appendChild(a);
            resultsRow.appendChild(col);
        });
    }

    // Try to fetch articles.json and search it. If not available, fallback to in-page filtering.
    (async function(){
        const keywords = q.toLowerCase().split(/\s+/).filter(Boolean);
        if (!keywords.length) {
            // show all: prefer to show indexed list if available
            try {
                const r = await fetch('articles.json');
                if (!r.ok) throw new Error('no index');
                const data = await r.json();
                renderMatches(data);
                showMessage(data.length, '');
                return;
            } catch(e){
                fallbackFilter();
                return;
            }
        }

        try {
            const resp = await fetch('articles.json');
            if (!resp.ok) throw new Error('no index');
            const data = await resp.json();
            
            // Define valid categories
            const validCategories = ['Lingkungan', 'Ekonomi', 'Keamanan', 'Pendidikan', 'Pangan', 'Hukum', 'Olahraga', 'Kesehatan', 'Sosial'];
            
            // Check if the query is exactly a valid category
            const isCategoryQuery = keywords.length === 1 && validCategories.some(cat => cat.toLowerCase() === keywords[0]);
            
            const matches = data.filter(a => {
                if (isCategoryQuery) {
                    // If querying a category, match only by category
                    return (a.category || '').toLowerCase() === keywords[0];
                } else {
                    // Otherwise, search in all fields
                    const hay = (a.title + ' ' + (a.excerpt||'') + ' ' + (a.category||'') + ' ' + (a.url||'') + ' ' + (a.date||'')).toLowerCase();
                    return keywords.every(k => hay.indexOf(k) !== -1);
                }
            });
            renderMatches(matches);
            showMessage(matches.length, q);
        } catch (err) {
            fallbackFilter();
        }
    })();
});
