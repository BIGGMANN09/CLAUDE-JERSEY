/* ============================================================
   JERSEY HUB — MAIN SCRIPT
   ------------------------------------------------------------
   CHANGE LOG (this revision):
   - Cart, cart drawer, and checkout system removed entirely.
     Ordering is now contact-based: every "Contact to Order"
     button opens a pre-filled WhatsApp chat via
     JerseyHub.contactToOrder(). The old checkout flow never
     processed a real payment, so replacing it outright is more
     honest than keeping two competing ordering paths on the
     page.
   - Product catalog moved from static HTML cards into a data
     array (PRODUCTS) rendered by renderProducts(). At 35 items
     (10 national teams + 5 clubs each from EPL, La Liga,
     Bundesliga, Ligue 1, Serie A), hand-written per-card HTML
     stopped being maintainable.
   - Filter categories changed from New/Sale/Special to match the
     new catalog: national, epl, laliga, bundesliga, ligue1,
     seriea, all.
   - Emoji removed from toast copy and headings, consistent with
     the site's "no decorative/marketing fluff" standard.
   - IMPORTANT: image paths below (IMAGES/kits/...) are
     placeholders. Real, licensed product photography needs to
     replace every one of them before launch — see chat response
     for why these can't be auto-sourced.
   - Pricing is a uniform placeholder per tier (national vs. club),
     not real per-team pricing. Update before launch.
   ============================================================ */

(function () {
    'use strict';

    // ------------------------------------------------------------
    // Product data
    // ------------------------------------------------------------
    // WHATSAPP_NUMBER: reuses the phone number already in the site
    // footer, in international format with no leading "+" (required
    // by the wa.me link format).
    const WHATSAPP_NUMBER = '233505389974';

    const PRODUCTS = [
        // ---- National teams (10) ----
        // None of these had a photo supplied at all (the "national"
        // folder in the uploaded archive was empty). All ten need
        // real photography before launch.
        { id: 'nt-ghana', name: 'Ghana Home Kit 2026/27', category: 'national', price: 220, image: 'IMAGES/kits/ghana-home-2026-27.jpg' }, // NEEDS PHOTO
        { id: 'nt-nigeria', name: 'Nigeria Home Kit 2026/27', category: 'national', price: 220, image: 'IMAGES/kits/nigeria-home-2026-27.jpg' }, // NEEDS PHOTO
        { id: 'nt-brazil', name: 'Brazil Home Kit 2026/27', category: 'national', price: 220, image: 'IMAGES/kits/brazil-home-2026-27.jpg' }, // NEEDS PHOTO
        { id: 'nt-argentina', name: 'Argentina Home Kit 2026/27', category: 'national', price: 220, image: 'IMAGES/kits/argentina-home-2026-27.jpg' }, // NEEDS PHOTO
        { id: 'nt-france', name: 'France Home Kit 2026/27', category: 'national', price: 220, image: 'IMAGES/kits/france-home-2026-27.jpg' }, // NEEDS PHOTO
        { id: 'nt-england', name: 'England Home Kit 2026/27', category: 'national', price: 220, image: 'IMAGES/kits/england-home-2026-27.jpg' }, // NEEDS PHOTO
        { id: 'nt-germany', name: 'Germany Home Kit 2026/27', category: 'national', price: 220, image: 'IMAGES/kits/germany-home-2026-27.jpg' }, // NEEDS PHOTO
        { id: 'nt-spain', name: 'Spain Home Kit 2026/27', category: 'national', price: 220, image: 'IMAGES/kits/spain-home-2026-27.jpg' }, // NEEDS PHOTO
        { id: 'nt-portugal', name: 'Portugal Home Kit 2026/27', category: 'national', price: 220, image: 'IMAGES/kits/portugal-home-2026-27.jpg' }, // NEEDS PHOTO
        { id: 'nt-netherlands', name: 'Netherlands Home Kit 2026/27', category: 'national', price: 220, image: 'IMAGES/kits/netherlands-home-2026-27.jpg' }, // NEEDS PHOTO

        // ---- Premier League, top 5 (home) ----
        // CHANGED: only clean, verified-usable photos supplied were for
        // Nottingham Forest and Tottenham, so they take two of the five
        // slots. Man Utd and Chelsea dropped to make room — flagged as
        // the one swap worth double-checking, since they're bigger
        // brands than the two clubs replacing them. Easy to revert once
        // real Man Utd / Chelsea photos exist.
        { id: 'epl-mancity', name: 'Manchester City Home Kit 2026/27', category: 'epl', price: 240, image: 'IMAGES/kits/man-city-home-2026-27.jpg' }, // NEEDS PHOTO
        { id: 'epl-arsenal', name: 'Arsenal Home Kit 2026/27', category: 'epl', price: 240, image: 'IMAGES/kits/arsenal-home-2026-27.jpg' }, // NEEDS PHOTO
        { id: 'epl-liverpool', name: 'Liverpool Home Kit 2026/27', category: 'epl', price: 240, image: 'IMAGES/kits/liverpool-home-2026-27.jpg' }, // NEEDS PHOTO
        { id: 'epl-forest', name: 'Nottingham Forest Home Kit 2026/27', category: 'epl', price: 240, image: 'IMAGES/kits/nottingham-forest-home-2026-27.jpg' },
        { id: 'epl-tottenham', name: 'Tottenham Hotspur Home Kit 2026/27', category: 'epl', price: 240, image: 'IMAGES/kits/tottenham-home-2026-27.jpg' },

        // ---- La Liga, top 5 (home) ----
        // CHANGED: Sevilla and Real Sociedad (never had photos supplied)
        // swapped for Getafe and Real Betis, which do. Real Madrid kept
        // its slot but is placeholder-pending — its only supplied photo
        // was an outdated "Fly Emirates" sponsor kit, years out of date.
        { id: 'll-realmadrid', name: 'Real Madrid Home Kit 2026/27', category: 'laliga', price: 240, image: 'IMAGES/kits/real-madrid-home-2026-27.jpg' }, // NEEDS PHOTO (supplied photo was an outdated sponsor kit)
        { id: 'll-barcelona', name: 'Barcelona Home Kit 2026/27', category: 'laliga', price: 240, image: 'IMAGES/kits/barcelona-home-2026-27.jpg' },
        { id: 'll-atletico', name: 'Atletico Madrid Home Kit 2026/27', category: 'laliga', price: 240, image: 'IMAGES/kits/atletico-madrid-home-2026-27.jpg' },
        { id: 'll-getafe', name: 'Getafe Home Kit 2026/27', category: 'laliga', price: 240, image: 'IMAGES/kits/getafe-home-2026-27.jpg' },
        { id: 'll-realbetis', name: 'Real Betis Home Kit 2026/27', category: 'laliga', price: 240, image: 'IMAGES/kits/real-betis-home-2026-27.jpg' },

        // ---- Bundesliga, top 5 (home) ----
        // CHANGED: Bayer Leverkusen swapped for Mainz, the only extra
        // clean photo available. Bayern kept its slot but is
        // placeholder-pending — its only supplied photo carried a
        // third-party news-site watermark. RB Leipzig also stays
        // placeholder-pending; no second clean alternate photo was
        // available to fill that slot too.
        { id: 'bl-bayern', name: 'Bayern Munich Home Kit 2026/27', category: 'bundesliga', price: 240, image: 'IMAGES/kits/bayern-munich-home-2026-27.jpg' }, // NEEDS PHOTO (supplied photo was watermarked, third-party copyrighted)
        { id: 'bl-dortmund', name: 'Borussia Dortmund Home Kit 2026/27', category: 'bundesliga', price: 240, image: 'IMAGES/kits/dortmund-home-2026-27.webp' },
        { id: 'bl-leipzig', name: 'RB Leipzig Home Kit 2026/27', category: 'bundesliga', price: 240, image: 'IMAGES/kits/rb-leipzig-home-2026-27.jpg' }, // NEEDS PHOTO
        { id: 'bl-mainz', name: 'Mainz Home Kit 2026/27', category: 'bundesliga', price: 240, image: 'IMAGES/kits/mainz-home-2026-27.jpg' },
        { id: 'bl-frankfurt', name: 'Eintracht Frankfurt Home Kit 2026/27', category: 'bundesliga', price: 240, image: 'IMAGES/kits/eintracht-frankfurt-home-2026-27.jpg' },

        // ---- Ligue 1, top 5 (home) ----
        // CHANGED: all five club names unchanged. Lyon's only supplied
        // photo was thumbnail-sized (225x225, same low-resolution
        // profile as the other skipped images), so it stays
        // placeholder-pending; the other four have real photos.
        { id: 'l1-psg', name: 'Paris Saint-Germain Home Kit 2026/27', category: 'ligue1', price: 240, image: 'IMAGES/kits/psg-home-2026-27.jpg' },
        { id: 'l1-marseille', name: 'Marseille Home Kit 2026/27', category: 'ligue1', price: 240, image: 'IMAGES/kits/marseille-home-2026-27.jpg' },
        { id: 'l1-lyon', name: 'Lyon Home Kit 2026/27', category: 'ligue1', price: 240, image: 'IMAGES/kits/lyon-home-2026-27.jpg' }, // NEEDS PHOTO (supplied photo was thumbnail-resolution)
        { id: 'l1-monaco', name: 'Monaco Home Kit 2026/27', category: 'ligue1', price: 240, image: 'IMAGES/kits/monaco-home-2026-27.jpg' },
        { id: 'l1-lille', name: 'Lille Home Kit 2026/27', category: 'ligue1', price: 240, image: 'IMAGES/kits/lille-home-2026-27.jpg' },

        // ---- Serie A, top 5 (home) ----
        // CHANGED: AC Milan swapped for Parma, the fifth clean photo
        // available. All five slots now have real, verified photos.
        { id: 'sa-juventus', name: 'Juventus Home Kit 2026/27', category: 'seriea', price: 240, image: 'IMAGES/kits/juventus-home-2026-27.jpg' },
        { id: 'sa-intermilan', name: 'Inter Milan Home Kit 2026/27', category: 'seriea', price: 240, image: 'IMAGES/kits/inter-milan-home-2026-27.jpg' },
        { id: 'sa-parma', name: 'Parma Home Kit 2026/27', category: 'seriea', price: 240, image: 'IMAGES/kits/parma-home-2026-27.jpg' },
        { id: 'sa-napoli', name: 'Napoli Home Kit 2026/27', category: 'seriea', price: 240, image: 'IMAGES/kits/napoli-home-2026-27.jpg' },
        { id: 'sa-asroma', name: 'AS Roma Home Kit 2026/27', category: 'seriea', price: 240, image: 'IMAGES/kits/as-roma-home-2026-27.jpg' }
    ];

    const CATEGORY_LABELS = {
        national: 'National Team',
        epl: 'Premier League',
        laliga: 'La Liga',
        bundesliga: 'Bundesliga',
        ligue1: 'Ligue 1',
        seriea: 'Serie A'
    };

    let currentFilter = 'all';

    // ------------------------------------------------------------
    // Small utilities
    // ------------------------------------------------------------
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function formatGHS(amount) {
        return 'GH₵' + amount.toFixed(2);
    }

    // ------------------------------------------------------------
    // 1. ACCORDION / SIDEBAR
    // ------------------------------------------------------------
    function myAccFunc() {
        const x = document.getElementById('demoAcc');
        if (!x) return;
        x.classList.toggle('w3-show');
    }

    function w3Open() {
        const sidebar = document.getElementById('mySidebar');
        const overlay = document.getElementById('myOverlay');
        if (sidebar) sidebar.style.display = 'block';
        if (overlay) overlay.style.display = 'block';
    }

    function w3Close() {
        const sidebar = document.getElementById('mySidebar');
        const overlay = document.getElementById('myOverlay');
        if (sidebar) sidebar.style.display = 'none';
        if (overlay) overlay.style.display = 'none';
    }

    // ------------------------------------------------------------
    // 2. PRODUCT GRID (data-driven)
    // ------------------------------------------------------------
    // Lightweight inline placeholder for products still awaiting real
    // photography, so missing images render as a clean on-brand tile
    // instead of a broken-image icon.
    const PLACEHOLDER_IMG = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">' +
        '<rect width="400" height="400" fill="%230f3324"/>' +
        '<text x="200" y="200" fill="%2393a99c" font-family="Inter,sans-serif" font-size="20" text-anchor="middle" dominant-baseline="middle">Photo coming soon</text>' +
        '</svg>'
    );

    function renderProducts(filter) {
        const grid = document.getElementById('productGrid');
        const itemCountEl = document.getElementById('itemCount');
        if (!grid) return;

        const list = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);

        if (itemCountEl) itemCountEl.textContent = list.length + ' items';

        grid.innerHTML = list.map(p => `
            <div class="w3-col l3 s6 product-item fade-up" data-tag="${p.category}">
                <div class="w3-container">
                    <div class="w3-display-container">
                        <img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}" loading="lazy" data-action="open-lightbox" data-lightbox-src="${escapeHTML(p.image)}" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}';">
                        <span class="w3-tag w3-display-topleft">${escapeHTML(CATEGORY_LABELS[p.category] || '')}</span>
                    </div>
                    <p>${escapeHTML(p.name)}<br><b>${formatGHS(p.price)}</b></p>
                    <button class="w3-button w3-black w3-small buy-btn" data-action="contact-to-order" data-product-name="${escapeHTML(p.name).replace(/"/g, '&quot;')}">
                        Contact to Order <svg class="icon" aria-hidden="true"><use href="#icon-whatsapp"></use></svg>
                    </button>
                </div>
            </div>
        `).join('');

        // Newly rendered cards need to be picked up by the fade-up
        // IntersectionObserver, since they didn't exist when it was
        // first set up.
        observeFadeUpTargets();
    }

    // ------------------------------------------------------------
    // 3. IMAGE LIGHTBOX
    // ------------------------------------------------------------
    function openLightbox(imageSrc) {
        const lightbox = document.getElementById('imageLightbox');
        const img = document.getElementById('lightboxImage');
        if (!lightbox || !img) return;
        img.src = imageSrc;
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        const lightbox = document.getElementById('imageLightbox');
        if (lightbox) lightbox.classList.remove('open');
        document.body.style.overflow = '';
    }

    // ------------------------------------------------------------
    // 4. SHOP FILTERS
    // ------------------------------------------------------------
    function filterProducts(filter) {
        currentFilter = filter;
        renderProducts(filter);
    }

    // ------------------------------------------------------------
    // 5. CONTACT TO ORDER
    // CHANGED: replaces the entire cart/checkout system. Opens a
    // pre-filled WhatsApp chat naming the specific kit. Falls back
    // gracefully since wa.me works in any browser (opens the WhatsApp
    // app if installed, otherwise WhatsApp Web).
    // ------------------------------------------------------------
    function contactToOrder(productName) {
        const message = `Hi Jersey HUB, I'd like to order the ${productName}.`;
        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank', 'noopener');
        showToast('Opening WhatsApp to order the ' + productName);
    }

    // ------------------------------------------------------------
    // 6. CONTACT FORM
    // ------------------------------------------------------------
    function submitContactForm(event) {
        event.preventDefault();
        const form = document.getElementById('contactForm');
        if (!form) return;
        const nameInput = form.querySelector('input[name="Name"]');
        const name = nameInput ? nameInput.value.trim() : '';
        if (name) {
            showToast('Thanks ' + name + '. We will get back to you shortly.');
            form.reset();
        } else {
            showToast('Please fill in all fields.');
        }
    }

    // ------------------------------------------------------------
    // 7. NEWSLETTER
    // ------------------------------------------------------------
    function subscribeNewsletter() {
        const emailInput = document.getElementById('newsletterEmail');
        if (!emailInput) return;
        const email = emailInput.value;
        if (email && email.includes('@')) {
            showToast('Subscribed. Check your inbox.');
            emailInput.value = '';
        } else {
            showToast('Please enter a valid email.');
        }
    }

    function subscribeModalNewsletter() {
        const emailInput = document.getElementById('modalNewsletterEmail');
        const modal = document.getElementById('newsletter');
        if (!emailInput) return;
        const email = emailInput.value;
        if (email && email.includes('@')) {
            showToast('Subscribed. Welcome to Jersey HUB.');
            emailInput.value = '';
            if (modal) modal.style.display = 'none';
        } else {
            showToast('Please enter a valid email.');
        }
    }

    function closeNewsletterModal() {
        const modal = document.getElementById('newsletter');
        if (modal) modal.style.display = 'none';
    }

    function openNewsletterModal() {
        const modal = document.getElementById('newsletter');
        if (modal) modal.style.display = 'block';
    }

    // ------------------------------------------------------------
    // 8. BACK TO TOP
    // ------------------------------------------------------------
    let scrollTicking = false;

    function handleScroll() {
        const btn = document.getElementById('backToTopBtn');
        if (btn) {
            btn.style.display = window.scrollY > 300 ? 'block' : 'none';
        }
        scrollTicking = false;
    }

    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            requestAnimationFrame(handleScroll);
            scrollTicking = true;
        }
    }, { passive: true });

    // ------------------------------------------------------------
    // 9. TOAST
    // ------------------------------------------------------------
    let toastTimer;

    function showToast(message) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // ------------------------------------------------------------
    // FADE-UP ON SCROLL INTO VIEW
    // ------------------------------------------------------------
    let fadeUpObserver = null;

    function observeFadeUpTargets() {
        if (!('IntersectionObserver' in window)) {
            document.querySelectorAll('.fade-up:not(.visible)').forEach(el => el.classList.add('visible'));
            return;
        }
        if (!fadeUpObserver) {
            fadeUpObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        fadeUpObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });
        }
        document.querySelectorAll('.fade-up:not(.visible)').forEach(el => fadeUpObserver.observe(el));
    }

    // ------------------------------------------------------------
    // EVENT WIRING
    // ------------------------------------------------------------
    document.addEventListener('DOMContentLoaded', function () {
        renderProducts(currentFilter);

        document.querySelectorAll('.filter-link').forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                filterProducts(this.dataset.filter);
                w3Close();
            });
        });

        // NEW: wires the "Shop by collection" buttons added in this
        // merge. Unlike .filter-link (real <a href="#jerseys"> anchors,
        // which scroll natively), these are plain <button> elements, so
        // the scroll into view has to happen explicitly here.
        document.querySelectorAll('.collection-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                filterProducts(this.dataset.filter);
                const grid = document.getElementById('jerseys');
                if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });

        observeFadeUpTargets();

        const accEl = document.getElementById('demoAcc');
        if (accEl) accEl.classList.add('w3-show');

        // ------------------------------------------------------------
        // Wire data-action attributes (replaces inline onclick handlers)
        // ------------------------------------------------------------
        const actionMap = {
            'close-menu': () => w3Close(),
            'toggle-accordion': () => myAccFunc(),
            'open-newsletter': () => openNewsletterModal(),
            'open-menu': () => w3Open(),
            'close-newsletter': () => closeNewsletterModal(),
            'close-lightbox': () => closeLightbox(),
            'scroll-to-top': () => window.scrollTo({ top: 0, behavior: 'smooth' }),
        };

        document.querySelectorAll('[data-action]').forEach(el => {
            const action = el.dataset.action;
            const handler = actionMap[action];
            if (!handler) return;

            el.addEventListener('click', function (e) {
                e.preventDefault();
                handler();
            });
        });

        // Lightbox images: open-lightbox on product card images
        document.querySelectorAll('[data-action="open-lightbox"]').forEach(img => {
            img.addEventListener('click', function () {
                openLightbox(this.dataset.lightboxSrc);
            });
        });

        // Contact-to-order buttons
        document.querySelectorAll('[data-action="contact-to-order"]').forEach(btn => {
            btn.addEventListener('click', function () {
                contactToOrder(this.dataset.productName);
            });
        });

        // Newsletter subscription form
        const subscribeForm = document.querySelector('form[data-action="subscribe-newsletter"]');
        if (subscribeForm) {
            subscribeForm.addEventListener('submit', function (e) {
                e.preventDefault();
                subscribeModalNewsletter();
            });
        }
    });

    // ------------------------------------------------------------
    // Exposed API for inline onclick="" handlers in index.html.
    // ------------------------------------------------------------
    window.JerseyHub = {
        myAccFunc,
        w3Open,
        w3Close,
        contactToOrder,
        openLightbox,
        closeLightbox,
        submitContactForm,
        subscribeNewsletter,
        subscribeModalNewsletter,
        closeNewsletterModal,
        openNewsletterModal,
        showToast
    };
})();