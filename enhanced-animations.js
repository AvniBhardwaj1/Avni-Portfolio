// ============================================
// Enhanced Portfolio Animations & Aircraft Effects
// ============================================

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

// ============================================
// 1. CUSTOM AIRCRAFT CURSOR
// ============================================
function initAircraftCursor() {
    const cursor = document.createElement('div');
    cursor.className = 'aircraft-cursor';
    cursor.innerHTML = `
        <svg viewBox="0 0 100 100" width="40" height="40">
            <!-- Fuselage -->
            <ellipse cx="50" cy="50" rx="20" ry="8" fill="#ff5733"/>
            <!-- Wings -->
            <rect x="15" y="44" width="70" height="12" fill="#ff5733"/>
            <!-- Tail -->
            <polygon points="65,48 75,45 75,55" fill="#ff5733"/>
            <!-- Cockpit -->
            <circle cx="35" cy="50" r="3" fill="#fff"/>
        </svg>
    `;
    document.body.appendChild(cursor);

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function updateCursor() {
        cursorX += (mouseX - cursorX) * 0.3;
        cursorY += (mouseY - cursorY) * 0.3;
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        requestAnimationFrame(updateCursor);
    }

    updateCursor();

    // Hide default cursor
    document.body.style.cursor = 'none';
}

// ============================================
// 2. PARALLAX AIRCRAFT IMAGES (Hero & Throughout)
// ============================================
function initParallaxAircraft() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    if (parallaxElements.length === 0) return;

    window.addEventListener('scroll', () => {
        parallaxElements.forEach((el) => {
            const scrollPosition = window.pageYOffset;
            const parallaxSpeed = el.getAttribute('data-parallax') || 0.5;
            el.style.transform = `translateY(${scrollPosition * parallaxSpeed}px) rotate(${scrollPosition * 0.1}deg)`;
        });
    });
}

// ============================================
// 3. AIRBUS SECTION - AIRPLANE ALONG FLIGHT PATH
// ============================================
function initAirbusAnimation() {
    const airbusSectionExists = document.querySelector('.airbus-experience');
    if (!airbusSectionExists) return;

    // Animate airplane along flight path
    gsap.to('#airplane', {
        scrollTrigger: {
            trigger: '.flight-container',
            start: 'top center',
            end: 'bottom center',
            scrub: 1,
            markers: false,
        },
        motionPath: {
            path: '#flightPath',
            align: '#flightPath',
            autoRotate: true,
            alignOrigin: [0.5, 0.5],
        },
        ease: 'none',
    });

    // Fade in waypoints
    const waypoints = document.querySelectorAll('.waypoint');
    waypoints.forEach((waypoint, index) => {
        gsap.fromTo(waypoint, 
            { opacity: 0, y: 30 },
            {
                scrollTrigger: {
                    trigger: waypoint,
                    start: 'top 80%',
                    toggleActions: 'play none none none',
                },
                opacity: 1,
                y: 0,
                duration: 0.8,
                delay: index * 0.1,
            }
        );
    });

    // Cloud parallax
    gsap.to('.clouds-1', {
        scrollTrigger: {
            trigger: '.flight-container',
            start: 'top center',
            end: 'bottom center',
            scrub: 2,
        },
        x: -100,
        ease: 'none',
    });

    gsap.to('.clouds-2', {
        scrollTrigger: {
            trigger: '.flight-container',
            start: 'top center',
            end: 'bottom center',
            scrub: 2.5,
        },
        x: 80,
        ease: 'none',
    });

    gsap.to('.clouds-3', {
        scrollTrigger: {
            trigger: '.flight-container',
            start: 'top center',
            end: 'bottom center',
            scrub: 3,
        },
        x: -60,
        ease: 'none',
    });
}

// ============================================
// 4. SCROLL ANIMATIONS - ALL SECTIONS
// ============================================
function initScrollAnimations() {
    // Portfolio items fade in on scroll
    gsap.utils.toArray('.portfolio-item').forEach((item, index) => {
        gsap.fromTo(item,
            { opacity: 0, y: 50 },
            {
                scrollTrigger: {
                    trigger: item,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                },
                opacity: 1,
                y: 0,
                duration: 0.6,
                delay: (index % 3) * 0.1,
            }
        );
    });

    // About section elements
    gsap.utils.toArray('.about-item').forEach((item, index) => {
        gsap.fromTo(item,
            { opacity: 0, scale: 0.9 },
            {
                scrollTrigger: {
                    trigger: item,
                    start: 'top 80%',
                    toggleActions: 'play none none none',
                },
                opacity: 1,
                scale: 1,
                duration: 0.7,
                delay: index * 0.15,
            }
        );
    });

    // Timeline items
    gsap.utils.toArray('.timeline-item').forEach((item, index) => {
        gsap.fromTo(item,
            { opacity: 0, x: index % 2 === 0 ? -50 : 50 },
            {
                scrollTrigger: {
                    trigger: item,
                    start: 'top 80%',
                    toggleActions: 'play none none none',
                },
                opacity: 1,
                x: 0,
                duration: 0.7,
                delay: index * 0.1,
            }
        );
    });

    // Section titles - slide in from left
    gsap.utils.toArray('.main-title').forEach((title) => {
        gsap.fromTo(title,
            { opacity: 0, x: -100 },
            {
                scrollTrigger: {
                    trigger: title,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                },
                opacity: 1,
                x: 0,
                duration: 0.8,
            }
        );
    });

    // Progress bars animate on scroll
    gsap.utils.toArray('.progress-bar').forEach((bar, index) => {
        const span = bar.querySelector('span');
        gsap.fromTo(span,
            { width: '0%' },
            {
                scrollTrigger: {
                    trigger: bar,
                    start: 'top 75%',
                    toggleActions: 'play none none none',
                },
                width: span.className || '75%',
                duration: 1.5,
                ease: 'power2.out',
                delay: index * 0.1,
            }
        );
    });
}

// ============================================
// 5. HERO AIRCRAFT ANIMATIONS (if present)
// ============================================
function initHeroAircraft() {
    const heroAircraft = document.querySelector('.hero-aircraft-decoration');
    if (!heroAircraft) return;

    // Gentle floating animation
    gsap.to(heroAircraft, {
        y: -20,
        rotation: 2,
        duration: 4,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
    });

    // Subtle scale on hover
    heroAircraft.addEventListener('mouseenter', () => {
        gsap.to(heroAircraft, { scale: 1.1, duration: 0.3 });
    });

    heroAircraft.addEventListener('mouseleave', () => {
        gsap.to(heroAircraft, { scale: 1, duration: 0.3 });
    });
}

// ============================================
// 6. PAGE NAVIGATION
// ============================================
function initPageNavigation() {
    const allSections = document.querySelectorAll('main .container, main .airbus-experience');
    const controls = document.querySelectorAll('.control');

    controls.forEach((control) => {
        control.addEventListener('click', () => {
            const sectionId = control.getAttribute('data-id');
            const targetSection = document.getElementById(sectionId);

            if (!targetSection) return;

            // Remove active class from all sections
            allSections.forEach((section) => {
                section.classList.remove('active');
            });

            // Add active to target
            targetSection.classList.add('active');

            // Update control buttons
            controls.forEach((btn) => {
                btn.classList.remove('active-btn');
            });
            control.classList.add('active-btn');

            // Smooth scroll to section
            targetSection.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// ============================================
// 7. THEME TOGGLE
// ============================================
function initThemeToggle() {
    const themeBtn = document.querySelector('.theme-btn');
    if (!themeBtn) return;

    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        gsap.to(themeBtn, {
            rotation: 360,
            duration: 0.6,
        });
    });
}

// ============================================
// 8. REFRESH SCROLL TRIGGERS ON WINDOW RESIZE
// ============================================
function refreshScrollTriggers() {
    ScrollTrigger.refresh();
}

window.addEventListener('resize', refreshScrollTriggers);

// ============================================
// INITIALIZE ALL ON DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🛫 Initializing enhanced portfolio animations...');
    
    initAircraftCursor();
    console.log('✅ Aircraft cursor initialized');
    
    initParallaxAircraft();
    console.log('✅ Parallax aircraft initialized');
    
    initAirbusAnimation();
    console.log('✅ Airbus animation initialized');
    
    initScrollAnimations();
    console.log('✅ Scroll animations initialized');
    
    initHeroAircraft();
    console.log('✅ Hero aircraft animations initialized');
    
    initPageNavigation();
    console.log('✅ Page navigation initialized');
    
    initThemeToggle();
    console.log('✅ Theme toggle initialized');
    
    console.log('🎉 All animations ready!');
});
