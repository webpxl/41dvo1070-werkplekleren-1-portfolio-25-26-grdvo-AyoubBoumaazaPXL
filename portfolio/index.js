// Konami Code Easter Egg
const code = [
    "ArrowUp","ArrowUp",
    "ArrowDown","ArrowDown",
    "ArrowLeft","ArrowRight",
    "ArrowLeft","ArrowRight",
    "b","a"
];

let index = 0;

window.addEventListener("keydown", (e) => {
    if (e.key === code[index]) {
        index++;
        if (index === code.length) {
            const easterEl = document.getElementById("easter");
            if (easterEl) {
                easterEl.textContent =
                    "🎉 Geheime sectie ontgrendeld! Jij bent een echte coder!";
                easterEl.style.display = "block";
                // hide after a short while
                setTimeout(() => { easterEl.style.display = "none" }, 3500);
            }
            index = 0;
        }
    } else {
        index = 0;
    }
});

// Lightbox and per-card gallery functionality
(function () {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');

    if (!lightbox || !lightboxImg) return;

    // State for current gallery shown in lightbox
    let currentGallery = [];
    let currentIndex = 0;

    function openLightboxWithGallery(galleryArray, startIndex) {
        currentGallery = galleryArray.slice();
        currentIndex = Math.max(0, Math.min(startIndex || 0, currentGallery.length - 1));
        lightboxImg.src = currentGallery[currentIndex] || '';
        lightbox.classList.add('visible');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('visible');
        lightbox.setAttribute('aria-hidden', 'true');
        lightboxImg.src = '';
        currentGallery = [];
        currentIndex = 0;
        document.body.style.overflow = '';
    }

    function showNext() {
        if (!currentGallery.length) return;
        currentIndex = (currentIndex + 1) % currentGallery.length;
        lightboxImg.src = currentGallery[currentIndex];
    }
    function showPrev() {
        if (!currentGallery.length) return;
        currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
        lightboxImg.src = currentGallery[currentIndex];
    }

    // Handle clicks on simple .card images (non-gallery) and gallery mains/thumbs
    document.querySelectorAll('.card').forEach(card => {
        const galleryMain = card.querySelector('.gallery-main');
        const thumbs = Array.from(card.querySelectorAll('.gallery-thumbs img'));

        if (galleryMain && thumbs.length) {
            // Build gallery array: main first, then unique thumbs (use absolute URLs via .src to avoid encoding mismatches)
            const mainSrc = galleryMain.src;
            const thumbsSrcs = thumbs.map(t => t.src).filter(s => !!s);
            // ensure no duplicate entries and main is first
            const galleryArray = [mainSrc, ...thumbsSrcs.filter(s => s !== mainSrc)];

            // mark initial active thumb if one matches the main image
            thumbs.forEach(t => t.classList.remove('active'));
            const activeThumb = thumbs.find(t => t.src === mainSrc);
            if (activeThumb) activeThumb.classList.add('active');

            // Thumbnail click: update active thumb and main image
            thumbs.forEach((thumb) => {
                thumb.addEventListener('click', () => {
                    const indexInGallery = galleryArray.indexOf(thumb.src);
                    if (indexInGallery === -1) return; // safety
                    // update main image
                    galleryMain.src = galleryArray[indexInGallery];
                    // mark active
                    thumbs.forEach(t => t.classList.remove('active'));
                    thumb.classList.add('active');
                });
            });

            // Click on main opens lightbox with this gallery
            galleryMain.addEventListener('click', () => {
                // determine starting index based on current main src
                const start = galleryArray.indexOf(galleryMain.src);
                openLightboxWithGallery(galleryArray, start === -1 ? 0 : start);
            });
        } else {
            // For cards without gallery, make their images open directly
            const imgs = card.querySelectorAll('img');
            imgs.forEach(img => {
                img.addEventListener('click', () => {
                    openLightboxWithGallery([img.src], 0);
                });
            });
        }
    });

    // Backdrop click: close if clicking outside the image or clicking the close button
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target === closeBtn) {
            closeLightbox();
        }
    });

    // Prev/Next buttons
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
        if (lightbox.classList.contains('visible')) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') showNext();
            if (e.key === 'ArrowLeft') showPrev();
        }
    });

    // Touch / swipe support for lightbox (mobile)
    let touchStartX = 0;
    let touchStartY = 0;
    let touchDeltaX = 0;
    let isTouching = false;
    const SWIPE_THRESHOLD = 60; // px
    const MAX_VERTICAL_DRIFT = 120; // px, if user moves vertically more it's probably a scroll

    lightbox.addEventListener('touchstart', (e) => {
        if (!lightbox.classList.contains('visible')) return;
        const t = e.touches[0];
        touchStartX = t.clientX;
        touchStartY = t.clientY;
        touchDeltaX = 0;
        isTouching = true;
        // remove transition for immediate follow
        lightboxImg.style.transition = 'none';
    }, { passive: true });

    lightbox.addEventListener('touchmove', (e) => {
        if (!isTouching) return;
        const t = e.touches[0];
        touchDeltaX = t.clientX - touchStartX;
        const dy = Math.abs(t.clientY - touchStartY);
        if (dy > MAX_VERTICAL_DRIFT) {
            // user is scrolling vertically, cancel swipe interaction
            isTouching = false;
            lightboxImg.style.transform = '';
            lightboxImg.style.transition = '';
            return;
        }
        // prevent native horizontal scroll
        e.preventDefault();
        // apply translation and slight scale for feedback
        lightboxImg.style.transform = `translateX(${touchDeltaX}px) scale(0.985)`;
    }, { passive: false });

    lightbox.addEventListener('touchend', ( ) => {
        if (!isTouching) return;
        isTouching = false;
        // restore transition for snap
        lightboxImg.style.transition = 'transform 220ms ease';
        if (Math.abs(touchDeltaX) > SWIPE_THRESHOLD) {
            if (touchDeltaX < 0) {
                // swipe left -> next
                showNext();
            } else {
                // swipe right -> prev
                showPrev();
            }
            // small delay to allow image src change to render, then reset transform
            setTimeout(() => {
                lightboxImg.style.transform = '';
                lightboxImg.style.transition = '';
            }, 120);
        } else {
            // not enough swipe: snap back
            lightboxImg.style.transform = '';
            setTimeout(() => { lightboxImg.style.transition = ''; }, 250);
        }
        touchDeltaX = 0;
    }, { passive: true });
})();

// Scroll reveal animation using IntersectionObserver
(function(){
    const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduce) return; // don't run animations for users who prefer reduced motion

    const revealElements = document.querySelectorAll('.reveal');
    if (!revealElements.length) return;

    let lastScrollY = window.scrollY;
    function getScrollDirection(){
        const y = window.scrollY;
        const dir = (y > lastScrollY) ? 'down' : 'up';
        lastScrollY = y;
        return dir;
    }

    const observer = new IntersectionObserver((entries) => {
        const direction = getScrollDirection();
        entries.forEach(entry => {
            const el = entry.target;
            if (entry.isIntersecting) {
                // If scrolling down, give a slightly larger translateY for feeling of upward reveal
                if (direction === 'down') {
                    el.style.transform = 'translateY(0)';
                }
                el.classList.add('active');
            } else {
                // remove active when element leaves viewport so it can animate again if desired
                // keep it visible if it has data-stay attribute
                if (!el.hasAttribute('data-stay')) {
                    el.classList.remove('active');
                }
            }
        });
    }, {
        root: null,
        rootMargin: '0px 0px -10% 0px', // trigger slightly before fully in view
        threshold: 0.08
    });

    revealElements.forEach(el => observer.observe(el));
})();
