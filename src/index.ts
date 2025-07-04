import './style.css';

const main = document.querySelector('main');
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('nav a');

if (!main) {
    throw new Error('Could not find main element');
}

const colors = [
    '#f2f2f2', // overview
    '#e6e6e6', // study
    '#d9d9d9', // work
    '#cccccc'  // hobby
];

const animationDuration = 1000; // ms. Increase to make the scroll slower.
let currentSectionIndex = 0;
let isScrolling = false;

function smoothScrollTo(targetY: number) {
    if (isScrolling) return;
    isScrolling = true;

    const startY = main!.scrollTop;
    const distance = targetY - startY;
    let startTime: number | null = null;

    function animationStep(timestamp: number) {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percentage = Math.min(progress / animationDuration, 1);

        const easedPercentage = percentage < 0.5 
            ? 2 * percentage * percentage 
            : 1 - Math.pow(-2 * percentage + 2, 2) / 2;

        main!.scrollTop = startY + distance * easedPercentage;

        if (progress < animationDuration) {
            requestAnimationFrame(animationStep);
        } else {
            main!.scrollTop = targetY;
            isScrolling = false;
        }
    }

    requestAnimationFrame(animationStep);
}

function scrollToSection(index: number) {
    if (index >= 0 && index < sections.length) {
        currentSectionIndex = index;
        const targetSection = sections[index];
        if (targetSection instanceof HTMLElement) {
            smoothScrollTo(targetSection.offsetTop);
        }
    }
}

main.addEventListener('wheel', (event) => {
    event.preventDefault();
    if (isScrolling) return;

    if (event.deltaY > 0) {
        scrollToSection(currentSectionIndex + 1);
    } else {
        scrollToSection(currentSectionIndex - 1);
    }
}, { passive: false });

navLinks.forEach((link, index) => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        scrollToSection(index);
    });
});

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
}

function interpolateColor(color1: string, color2: string, factor: number) {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    if (!rgb1 || !rgb2) {
        return color1;
    }

    const r = Math.round(rgb1.r + factor * (rgb2.r - rgb1.r));
    const g = Math.round(rgb1.g + factor * (rgb2.g - rgb1.g));
    const b = Math.round(rgb1.b + factor * (rgb2.b - rgb1.b));

    return `rgb(${r}, ${g}, ${b})`;
}

main.style.backgroundColor = colors[0];

main.addEventListener('scroll', () => {
    const { scrollTop, clientHeight } = main;
    
    const sectionIndex = Math.floor(scrollTop / clientHeight);
    const scrollProgress = (scrollTop % clientHeight) / clientHeight;

    const fromColor = colors[sectionIndex];
    const toColor = colors[sectionIndex + 1] || fromColor;

    main.style.backgroundColor = interpolateColor(fromColor, toColor, scrollProgress);
}); 