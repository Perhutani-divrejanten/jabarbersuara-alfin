/**
 * Load Breaking News dari articles.json untuk index.html
 * Menampilkan breaking news dalam carousel dengan navigation buttons
 */

document.addEventListener('DOMContentLoaded', function() {
    const breakingNewsCarousel = document.getElementById('breakingNewsCarousel');
    if (!breakingNewsCarousel) return;

    fetch('articles.json')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load articles.json');
            return response.json();
        })
        .then(articles => {
            breakingNewsCarousel.innerHTML = '';
            const breakingNewsArticles = articles.slice(0, 8);

            breakingNewsArticles.forEach(article => {
                const item = document.createElement('div');
                item.className = 'breaking-news-item';

                const link = document.createElement('a');
                link.href = article.url || '#';
                link.textContent = article.title || 'Breaking News';
                link.title = article.title || 'Breaking News';

                item.appendChild(link);
                breakingNewsCarousel.appendChild(item);
            });

            if (typeof $.fn.owlCarousel === 'function') {
                $(breakingNewsCarousel).owlCarousel({
                    items: 1,
                    loop: true,
                    margin: 0,
                    autoplay: true,
                    autoplayTimeout: 5000,
                    autoplayHoverPause: true,
                    dots: true,
                    nav: true,
                    navText: ['<i class="fa fa-chevron-left"></i>', '<i class="fa fa-chevron-right"></i>'],
                    responsive: {
                        0: { items: 1 },
                        600: { items: 1 },
                        1000: { items: 1 }
                    }
                });
            }
        })
        .catch(err => {
            console.error('❌ Error loading breaking news:', err);
        });
});
