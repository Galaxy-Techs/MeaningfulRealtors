
// ============================================
// Meaningfulrealtor - Main JavaScript
// Mobile Menu, Dark Mode, Testimonials Slider
// ============================================


document.addEventListener('DOMContentLoaded', function() {

    // ============================================
    // MOBILE MENU
    // ============================================
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileClose = document.getElementById('mobileClose');
    const mobileOverlay = document.getElementById('mobileOverlay');

    function openMobileMenu() {
        mobileMenu.classList.add('active');
        mobileOverlay.classList.add('active');
        hamburger.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        mobileMenu.classList.remove('active');
        mobileOverlay.classList.remove('active');
        hamburger.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (hamburger) {
        hamburger.addEventListener('click', openMobileMenu);
    }

    if (mobileClose) {
        mobileClose.addEventListener('click', closeMobileMenu);
    }

    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', closeMobileMenu);
    }

    // Close menu on link click
    const mobileLinks = document.querySelectorAll('.mobile-menu a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // ============================================
    // DARK MODE TOGGLE
    // ============================================
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    // Check for saved theme preference only
    // Default is ALWAYS light mode (no system preference check)
    const savedTheme = localStorage.getItem('theme');

    // Only apply dark mode if user explicitly saved it as dark
    if (savedTheme === 'dark') {
        html.setAttribute('data-theme', 'dark');
    }
    // If no saved theme or saved as 'light', stay in default light mode

    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            if (newTheme === 'light') {
                html.removeAttribute('data-theme');
            } else {
                html.setAttribute('data-theme', newTheme);
            }
            localStorage.setItem('theme', newTheme);
        });
    }

    // ============================================
    // TESTIMONIALS SLIDER
    // ============================================
    const slider = document.getElementById('testimonialsSlider');
    const track = document.getElementById('testimonialsTrack');
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    const dotsContainer = document.getElementById('sliderDots');

    if (slider && track) {
        const cards = track.querySelectorAll('.testimonial-card');
        const totalCards = cards.length;
        let currentIndex = 0;
        let cardsPerView = getCardsPerView();
        let maxIndex = Math.max(0, totalCards - cardsPerView);
        let isDragging = false;
        let startPos = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let animationID;

        function getCardsPerView() {
            if (window.innerWidth <= 768) return 1;
            if (window.innerWidth <= 1024) return 2;
            return 3;
        }

        function createDots() {
            if (!dotsContainer) return;
            dotsContainer.innerHTML = '';
            const dotCount = maxIndex + 1;

            for (let i = 0; i < dotCount; i++) {
                const dot = document.createElement('button');
                dot.classList.add('slider-dot');
                dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', () => goToSlide(i));
                dotsContainer.appendChild(dot);
            }
        }

        function updateDots() {
            const dots = dotsContainer.querySelectorAll('.slider-dot');
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }

        function updateButtons() {
            if (prevBtn) prevBtn.disabled = currentIndex === 0;
            if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex;
        }

        function goToSlide(index) {
            currentIndex = Math.max(0, Math.min(index, maxIndex));
            const cardWidth = cards[0].offsetWidth + 24; // gap
            currentTranslate = -currentIndex * cardWidth;
            prevTranslate = currentTranslate;
            track.style.transform = `translateX(${currentTranslate}px)`;
            updateDots();
            updateButtons();
        }

        function nextSlide() {
            if (currentIndex < maxIndex) {
                goToSlide(currentIndex + 1);
            }
        }

        function prevSlide() {
            if (currentIndex > 0) {
                goToSlide(currentIndex - 1);
            }
        }

        // Touch / Drag support
        track.addEventListener('mousedown', touchStart);
        track.addEventListener('touchstart', touchStart);
        track.addEventListener('mouseup', touchEnd);
        track.addEventListener('touchend', touchEnd);
        track.addEventListener('mousemove', touchMove);
        track.addEventListener('touchmove', touchMove);
        track.addEventListener('mouseleave', () => {
            if (isDragging) touchEnd();
        });

        function touchStart(event) {
            isDragging = true;
            startPos = getPositionX(event);
            animationID = requestAnimationFrame(animation);
            track.style.cursor = 'grabbing';
        }

        function touchMove(event) {
            if (isDragging) {
                const currentPosition = getPositionX(event);
                const diff = currentPosition - startPos;
                track.style.transform = `translateX(${prevTranslate + diff}px)`;
            }
        }

        function touchEnd() {
            isDragging = false;
            cancelAnimationFrame(animationID);
            track.style.cursor = 'grab';

            const movedBy = currentTranslate - prevTranslate;
            const threshold = 100;

            if (movedBy < -threshold && currentIndex < maxIndex) {
                currentIndex += 1;
            } else if (movedBy > threshold && currentIndex > 0) {
                currentIndex -= 1;
            }

            goToSlide(currentIndex);
        }

        function getPositionX(event) {
            return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
        }

        function animation() {
            if (isDragging) requestAnimationFrame(animation);
        }

        // Button events
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);

        // Keyboard navigation
        slider.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'ArrowRight') nextSlide();
        });

        // Resize handler
        window.addEventListener('resize', () => {
            const newCardsPerView = getCardsPerView();
            if (newCardsPerView !== cardsPerView) {
                cardsPerView = newCardsPerView;
                maxIndex = Math.max(0, totalCards - cardsPerView);
                currentIndex = Math.min(currentIndex, maxIndex);
                createDots();
                goToSlide(currentIndex);
            }
        });

        // Initialize
        createDots();
        updateButtons();

        // Auto-play (optional - uncomment to enable)
        // setInterval(() => {
        //     if (currentIndex < maxIndex) {
        //         nextSlide();
        //     } else {
        //         goToSlide(0);
        //     }
        // }, 5000);
    }

    // ============================================
    // NAVBAR SCROLL EFFECT
    // ============================================
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
        } else {
            navbar.style.boxShadow = 'none';
        }

        lastScroll = currentScroll;
    });

    // ============================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // ============================================
    // FORM HANDLING
    // ============================================
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Show success message (replace with actual form submission)
            const btn = this.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;

            btn.innerHTML = 'Sent Successfully!';
            btn.style.backgroundColor = '#22c55e';

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.backgroundColor = '';
                this.reset();
            }, 3000);
        });
    }

    // ============================================
    // LISTINGS FILTER (Listings Page)
    // ============================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const listingDetails = document.querySelectorAll('.listing-detail');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');

            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            listingDetails.forEach(detail => {
                if (filter === 'all' || detail.getAttribute('data-category') === filter) {
                    detail.style.display = 'block';
                    detail.style.animation = 'fadeIn 0.5s ease';
                } else {
                    detail.style.display = 'none';
                }
            });
        });
    });
});

// Fade in animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

// AOS animation script
   