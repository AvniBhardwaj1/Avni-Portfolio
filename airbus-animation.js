// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

// Animate airplane along the flight path based on scroll
document.addEventListener('DOMContentLoaded', () => {
    // Check if the Airbus section exists
    const airbusSectionExists = document.querySelector('.airbus-experience');
    
    if (airbusSectionExists) {
        // Create the scroll-triggered animation
        gsap.to('#airplane', {
            scrollTrigger: {
                trigger: '.flight-container',
                start: 'top center',
                end: 'bottom center',
                scrub: 1, // Smooth scrub tied to scroll
                markers: false, // Set to true for debugging
            },
            motionPath: {
                path: '#flightPath',
                align: '#flightPath',
                autoRotate: true, // Plane rotates to follow the path
                alignOrigin: [0.5, 0.5],
            },
            ease: 'none',
        });

        // Animate waypoints to fade in as they become visible
        const waypoints = document.querySelectorAll('.waypoint');
        waypoints.forEach((waypoint, index) => {
            gsap.to(waypoint, {
                scrollTrigger: {
                    trigger: waypoint,
                    start: 'top 80%',
                    toggleActions: 'play none none none',
                },
                opacity: 1,
                y: 0,
                duration: 0.8,
                delay: index * 0.1,
            });
        });

        // Landing animation
        gsap.to('.airbus-landing', {
            scrollTrigger: {
                trigger: '.airbus-landing',
                start: 'top 80%',
                toggleActions: 'play none none none',
            },
            opacity: 1,
            scale: 1,
            duration: 1,
        });

        // Optional: Add a subtle parallax to the clouds
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
});

// Page navigation (existing functionality)
const sections = document.querySelectorAll('.container');
const allSections = document.querySelectorAll('main .container, main .airbus-experience');
const controlsContainer = document.querySelector('.controls');

allSections.forEach((section) => {
    let menu = section.getAttribute('id');
    let menuClass = document.querySelector(`.control[data-id="${menu}"]`);
    
    if (menuClass) {
        menuClass.addEventListener('click', () => {
            menuClass.classList.add('active-btn');
            
            allSections.forEach((section) => {
                section.classList.remove('active');
            });
            
            section.classList.add('active');
            
            document.querySelectorAll('.control').forEach((el) => {
                el.classList.remove('active-btn');
            });
            
            menuClass.classList.add('active-btn');
        });
    }
});

// Theme toggle
const themeBtn = document.querySelector('.theme-btn');
if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
    });
}
