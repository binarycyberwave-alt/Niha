const introScreen = document.getElementById('intro-screen');
const mainScreen = document.getElementById('main-screen');
const openBtn = document.getElementById('open-btn');
const carousel = document.getElementById('carousel');
const scene = document.querySelector('.scene-container');

// YouTube Player Initialization
let ytPlayer;
function onYouTubeIframeAPIReady() {
    ytPlayer = new YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: 'P37ok63MRJg',
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'showinfo': 0,
            'rel': 0,
            'loop': 1,
            'playlist': 'P37ok63MRJg'
        }
    });
}

// Load YouTube API
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

// The 16 images provided in the folder
const images = [
    "1.png",
    "2.jpeg",
    "3.png",
    "4.jpeg",
    "5.png",
    "6.png",
    "7.jpeg",
    "8.jpeg",
    "9.jpeg",
    "11.jpeg",
    "12.jpeg"
];

// Initialize Carousel
const totalImages = images.length;
const theta = 360 / totalImages;
let itemWidth = window.innerWidth > 768 ? 250 : 160;
// Radius calculation for a regular polygon
let radius = Math.round((itemWidth / 2) / Math.tan(Math.PI / totalImages));
radius += 50; // Give some extra padding

function buildCarousel() {
    carousel.innerHTML = '';
    images.forEach((src, index) => {
        const item = document.createElement('div');
        item.className = 'carousel-item';
        const angle = theta * index;
        item.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
        
        const img = document.createElement('img');
        // Setting the src handles any URL encoding needed for spaces
        img.src = src;
        img.alt = `Memory ${index + 1}`;
        // Prevent default dragging of the image
        img.addEventListener('dragstart', (e) => e.preventDefault());
        
        item.appendChild(img);
        carousel.appendChild(item);
    });
}

buildCarousel();

// Recalculate on resize
window.addEventListener('resize', () => {
    let newWidth = window.innerWidth > 768 ? 250 : 160;
    if (newWidth !== itemWidth) {
        itemWidth = newWidth;
        radius = Math.round((itemWidth / 2) / Math.tan(Math.PI / totalImages)) + 50;
        buildCarousel();
    }
});

// Start Experience
openBtn.addEventListener('click', () => {
    introScreen.classList.remove('active');
    setTimeout(() => {
        mainScreen.classList.add('active');
        // Try playing music
        if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
            ytPlayer.playVideo();
        }
        initParticles();
        startAutoRotate();
    }, 500);
});

// Carousel Interaction
let currAngle = 0;
let isDragging = false;
let startX = 0;
let lastX = 0;
let autoRotateInterval;
let velocity = 0;
let dragAnimation;

function rotateCarousel(angle) {
    carousel.style.transform = `rotateY(${angle}deg)`;
}

function startAutoRotate() {
    autoRotateInterval = setInterval(() => {
        if (!isDragging) {
            currAngle -= 0.2; // slow continuous rotation
            rotateCarousel(currAngle);
        }
    }, 20);
}

function stopAutoRotate() {
    clearInterval(autoRotateInterval);
}

// Mouse / Touch Events for Carousel
scene.addEventListener('mousedown', dragStart);
scene.addEventListener('touchstart', dragStart, {passive: true});
window.addEventListener('mousemove', dragMove);
window.addEventListener('touchmove', dragMove, {passive: true});
window.addEventListener('mouseup', dragEnd);
window.addEventListener('touchend', dragEnd);

function dragStart(e) {
    if (!mainScreen.classList.contains('active')) return;
    isDragging = true;
    startX = e.pageX || (e.touches && e.touches[0].pageX);
    lastX = startX;
    stopAutoRotate();
    carousel.style.transition = 'none'; // remove CSS transition for smooth drag
    cancelAnimationFrame(dragAnimation);
}

function dragMove(e) {
    if (!isDragging) return;
    const x = e.pageX || (e.touches && e.touches[0].pageX);
    const deltaX = x - lastX;
    lastX = x;
    
    // Sensitivity
    const rotationDelta = deltaX * 0.3; 
    currAngle += rotationDelta;
    velocity = rotationDelta; // store for inertia
    rotateCarousel(currAngle);
}

function dragEnd(e) {
    if (!isDragging) return;
    isDragging = false;
    // Don't add a transition duration back here to avoid jumping during inertia
    applyInertia();
    
    // Resume auto-rotate after some time if not touched
    setTimeout(() => {
        if (!isDragging) startAutoRotate();
    }, 3000);
}

function applyInertia() {
    if (Math.abs(velocity) > 0.05) {
        currAngle += velocity;
        velocity *= 0.95; // friction
        rotateCarousel(currAngle);
        dragAnimation = requestAnimationFrame(applyInertia);
    }
}

// 3D Particles (Hearts and Sparkles)
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const particles = [];
const particleCount = window.innerWidth > 768 ? 60 : 30;

class Particle {
    constructor() {
        this.reset();
        this.y = Math.random() * canvas.height; // initial random distribution
    }
    
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = -20;
        this.size = Math.random() * 15 + 5;
        this.speedY = Math.random() * 1.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 1;
        this.opacity = Math.random() * 0.6 + 0.2;
        this.type = Math.random() > 0.4 ? 'heart' : 'sparkle';
        
        // Heart specifics
        this.rot = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.05;
        
        // Colors: mix of pinks, reds, and white
        const colors = ['#ff0055', '#ff4d88', '#ffb3c6', '#ffffff'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    
    update() {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.y * 0.01) * 0.5; // sway
        this.rot += this.rotSpeed;
        
        if (this.y > canvas.height + 20) {
            this.reset();
        }
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.globalAlpha = this.opacity;
        
        if (this.type === 'heart') {
            // Draw heart shape
            ctx.fillStyle = this.color;
            ctx.beginPath();
            const s = this.size / 20;
            ctx.moveTo(0, 5 * s);
            ctx.bezierCurveTo(0, 0, -10 * s, 0, -10 * s, 10 * s);
            ctx.bezierCurveTo(-10 * s, 20 * s, 0, 25 * s, 0, 30 * s);
            ctx.bezierCurveTo(0, 25 * s, 10 * s, 20 * s, 10 * s, 10 * s);
            ctx.bezierCurveTo(10 * s, 0, 0, 0, 0, 5 * s);
            ctx.fill();
        } else {
            // Draw sparkle
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
        }
        
        ctx.restore();
    }
}

function initParticles() {
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    animateParticles();
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}
