(function ($) {
    "use strict";
    
    // Dropdown on mouse hover
    $(document).ready(function () {
        function toggleNavbarMethod() {
            if ($(window).width() > 992) {
                $('.navbar .dropdown').on('mouseover', function () {
                    $('.dropdown-toggle', this).trigger('click');
                }).on('mouseout', function () {
                    $('.dropdown-toggle', this).trigger('click').blur();
                });
            } else {
                $('.navbar .dropdown').off('mouseover').off('mouseout');
            }
        }
        toggleNavbarMethod();
        $(window).resize(toggleNavbarMethod);
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Main News carousel
    $(".main-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1500,
        items: 1,
        dots: true,
        loop: true,
        center: true,
    });


    // Tranding carousel (breaking news) – no navigation arrows
    $(".tranding-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 2000,
        items: 1,
        dots: false,
        loop: true,
        nav: false // arrows hidden via JS and CSS
    });


    // Carousel item 1
    $(".carousel-item-1").owlCarousel({
        autoplay: true,
        smartSpeed: 1500,
        items: 1,
        dots: false,
        loop: true,
        nav : true,
        navText : [
            '<i class="fa fa-angle-left" aria-hidden="true"></i>',
            '<i class="fa fa-angle-right" aria-hidden="true"></i>'
        ]
    });

    // Carousel item 2
    $(".carousel-item-2").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        margin: 30,
        dots: false,
        loop: true,
        nav : true,
        navText : [
            '<i class="fa fa-angle-left" aria-hidden="true"></i>',
            '<i class="fa fa-angle-right" aria-hidden="true"></i>'
        ],
        responsive: {
            0:{
                items:1
            },
            576:{
                items:1
            },
            768:{
                items:2
            }
        }
    });


    // Carousel item 3
    $(".carousel-item-3").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        margin: 30,
        dots: false,
        loop: true,
        nav : true,
        navText : [
            '<i class="fa fa-angle-left" aria-hidden="true"></i>',
            '<i class="fa fa-angle-right" aria-hidden="true"></i>'
        ],
        responsive: {
            0:{
                items:1
            },
            576:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            }
        }
    });
    

    // Carousel item 4 (featured news)
    $(".carousel-item-4").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        margin: 30,
        dots: false,
        loop: true,
        nav: false, // disable arrows, they're hidden by CSS
        responsive: {
            0:{
                items:1
            },
            576:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            },
            1200:{
                items:4
            }
        }
    });

    // Populate footer categories dynamically (works across pages that include main.js)
    async function populateFooterCategories(){
        try{
            const container = document.getElementById('footerCategories');
            if(!container) return;
            const resp = await fetch('/articles.json');
            if(!resp.ok) throw new Error('no index');
            const data = await resp.json();
            // normalization map
            function normalizeCategory(cat){
                if(!cat) return 'Ekonomi';
                const s = cat.toString().trim().toLowerCase();
                const map = {
                    'environment':'Lingkungan','lingkungan':'Lingkungan',
                    'pangan':'Pangan','ketahanan pangan':'Pangan','food':'Pangan','foods':'Pangan','agriculture':'Pangan',
                    'hukum':'Hukum','law':'Hukum','crime':'Hukum',
                    'keamanan':'Keamanan','security':'Keamanan','safety':'Keamanan',
                    'economy':'Ekonomi','ekonomi':'Ekonomi','business':'Ekonomi','bisnis':'Ekonomi',
                    'education':'Pendidikan','pendidikan':'Pendidikan','edukasi':'Pendidikan',
                    'sports':'Olahraga','sport':'Olahraga','olahraga':'Olahraga',
                    'technology':'Teknologi','teknologi':'Teknologi','tech':'Teknologi','digital':'Teknologi','digitalisasi':'Teknologi',
                    'health':'Kesehatan','kesehatan':'Kesehatan',
                    'culture':'Budaya','budaya':'Budaya',
                    'sosial':'Sosial','social':'Sosial'
                };
                if(map[s]) return map[s];
                for(const k of Object.keys(map)) if(s.indexOf(k)!==-1) return map[k];
                return 'Ekonomi';
            }

            const counts = {};
            data.forEach(a => {
                const c = normalizeCategory(a.category || '');
                counts[c] = (counts[c]||0) + 1;
            });
            const sorted = Object.keys(counts).sort((x,y)=> counts[y]-counts[x]);
            const top = sorted.slice(0,10);
            // create buttons
            container.innerHTML = '';
            top.forEach(cat => {
                const a = document.createElement('a');
                a.className = 'btn btn-sm btn-secondary m-1';
                a.href = '/search.html?q=' + encodeURIComponent(cat);
                a.textContent = cat;
                container.appendChild(a);
            });
        }catch(e){
            // fallback: leave existing markup
            return;
        }
    }
    // Ensure footer placeholder exists even on pages with static footer markup
    function ensureFooterPlaceholder(){
        try{
            if(document.getElementById('footerCategories')) return;
            // look for footer header with text 'Kategori' and find the sibling div to mark
            const headings = document.querySelectorAll('h5');
            for(const h of headings){
                if(h.textContent && h.textContent.trim().toLowerCase()==='kategori'){
                    const parent = h.parentElement;
                    if(!parent) continue;
                    // find a div with the expected classes inside this column
                    const candidate = parent.querySelector('div.d-flex.flex-wrap.m-n1') || parent.querySelector('div[class*="flex-wrap"]');
                    if(candidate){ candidate.id = 'footerCategories'; return; }
                }
            }
        }catch(e){/* ignore */}
    }
    ensureFooterPlaceholder();
    populateFooterCategories().then(() => {
        try{ window.footerCategoriesPopulated = true; }catch(e){}
    }).catch(()=>{});
    
})(jQuery);

