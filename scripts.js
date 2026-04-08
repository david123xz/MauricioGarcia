// =======================
// HEADER + NAVBAR SCROLL
// =======================
const header = document.querySelector('.header');

function handleScroll() {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

let ticking = false;

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      handleScroll();
      ticking = false;
    });
    ticking = true;
  }
});

// =======================
// SCROLL REVEAL (Opcional)
// =======================
const scrollElements = document.querySelectorAll('.scroll-reveal');

function elementInView(el, offset = 0) {
  const elementTop = el.getBoundingClientRect().top;
  return elementTop <= (window.innerHeight || document.documentElement.clientHeight) - offset;
}

function displayScrollElement(el) {
  el.classList.add('scrolled-element');
}

function hideScrollElement(el) {
  el.classList.remove('scrolled-element');
}

function handleScrollReveal() {
  scrollElements.forEach(el => {
    if (elementInView(el, 100)) {
      displayScrollElement(el);
    } else {
      hideScrollElement(el);
    }
  });
}

window.addEventListener('scroll', handleScrollReveal);

// =======================
// TECNOLOGÍAS AVANZADAS
// =======================
const bars = document.querySelectorAll('.bar');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting) {
      const level = entry.target.parentElement.parentElement.dataset.level;
      entry.target.style.width = level;
      entry.target.classList.add('flow');
    }
  });
}, { threshold: 0.5 });

bars.forEach(bar => observer.observe(bar));

// =======================
// CANVAS GALAXY BACKGROUND
// =======================
// ======= CANVAS CINEMATIC ULTRA PREMIUM =======
const canvas = document.getElementById("galaxia");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = document.body.scrollHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ======= MOUSE TRACKING =======
const mouse = { x: null, y: null };
window.addEventListener("mousemove", e => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener("mouseout", () => { mouse.x = null; mouse.y = null; });

// ======= CONFIGURATION =======
const CONFIG = {
    STAR_COUNT: 250,
    STAR_LAYERS: [0.4, 0.8, 1.5], // Lejanas, medias, cercanas
    SHOOTING_STAR_COUNT: 12,
    NEBULA_COUNT: 7,
    TRAIL_LENGTH: 30,
    BACKGROUND_COLOR: "rgba(5,10,25,0.2)"
};

// ======= STAR CLASS =======
class Star {
    constructor(layer) { this.layer = layer; this.init(); }
    init() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = (0.4 + Math.random()*0.6) * this.layer;
        this.color = `hsla(220,30%,${70 + Math.random()*10}%,0.9)`;
        this.speedX = (Math.random()-0.5) * 0.02 * this.layer;
        this.speedY = (Math.random()-0.5) * 0.02 * this.layer;
        this.trail = [];
    }
    update() {
        // Mouse attraction
        if(mouse.x && mouse.y){
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.hypot(dx, dy);
            if(dist < 300){
                const force = (300 - dist)/300 * 0.008;
                this.x += dx*force;
                this.y += dy*force;
            }
        }
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around
        if(this.x<0) this.x=canvas.width;
        if(this.x>canvas.width) this.x=0;
        if(this.y<0) this.y=canvas.height;
        if(this.y>canvas.height) this.y=0;

        // Trail
        this.trail.push({x:this.x, y:this.y});
        if(this.trail.length>CONFIG.TRAIL_LENGTH) this.trail.shift();
    }
    draw() {
        ctx.beginPath();
        for(let i=0;i<this.trail.length;i++){
            const p = this.trail[i];
            ctx.globalAlpha = (i/this.trail.length)*0.6;
            ctx.fillStyle = this.color;
            ctx.arc(p.x,p.y,this.radius,0,Math.PI*2);
            ctx.fill();
            ctx.beginPath();
        }
        ctx.globalAlpha=1;
    }
}

// ======= SHOOTING STAR CLASS =======
class ShootingStar {
    constructor(){ this.reset(); }
    reset(){
        this.x = Math.random()*canvas.width;
        this.y = Math.random()*canvas.height/2;
        this.length = 250 + Math.random()*150;
        this.speed = 7 + Math.random()*5;
        this.angle = Math.random()*0.12 - 0.06;
        this.active = Math.random()<0.01;
    }
    update(){
        if(!this.active && Math.random()<0.001) this.active=true;
        if(this.active){
            this.x += this.speed;
            this.y += this.speed * Math.tan(this.angle);
            if(this.x>canvas.width || this.y>canvas.height) this.reset();
        }
    }
    draw(){
        if(!this.active) return;
        const grad = ctx.createLinearGradient(this.x, this.y, this.x - this.length, this.y - this.length*Math.tan(this.angle));
        grad.addColorStop(0,"rgba(255,255,255,0.95)");
        grad.addColorStop(1,"rgba(255,255,255,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(this.x,this.y);
        ctx.lineTo(this.x - this.length, this.y - this.length*Math.tan(this.angle));
        ctx.stroke();
    }
}

// ======= NEBULA CLASS =======
class Nebula {
    constructor(){
        this.x = Math.random()*canvas.width;
        this.y = Math.random()*canvas.height;
        this.radius = 150 + Math.random()*180;
        this.color = `hsla(220,50%,35%,0.07)`;
        this.speedX = (Math.random()-0.5)*0.008;
        this.speedY = (Math.random()-0.5)*0.008;
    }
    update(){
        this.x += this.speedX;
        this.y += this.speedY;
        if(this.x<0)this.x=canvas.width;
        if(this.x>canvas.width)this.x=0;
        if(this.y<0)this.y=canvas.height;
        if(this.y>canvas.height)this.y=0;
    }
    draw(){
        const gradient = ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.radius);
        gradient.addColorStop(0,this.color);
        gradient.addColorStop(1,"rgba(0,0,0,0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2);
        ctx.fill();
    }
}

// ======= INITIALIZE PARTICLES =======
const stars=[], shootingStars=[], nebulas=[];
function init(){
    stars.length=0; shootingStars.length=0; nebulas.length=0;
    CONFIG.STAR_LAYERS.forEach(layer=>{
        for(let i=0;i<CONFIG.STAR_COUNT/CONFIG.STAR_LAYERS.length;i++){
            stars.push(new Star(layer));
        }
    });
    for(let i=0;i<CONFIG.SHOOTING_STAR_COUNT;i++) shootingStars.push(new ShootingStar());
    for(let i=0;i<CONFIG.NEBULA_COUNT;i++) nebulas.push(new Nebula());
}
init();

// ======= ANIMATION LOOP =======
function animate(){
    ctx.fillStyle=CONFIG.BACKGROUND_COLOR;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    nebulas.forEach(n=>{n.update();n.draw();});
    stars.forEach(s=>{s.update();s.draw();});
    shootingStars.forEach(ss=>{ss.update();ss.draw();});

    requestAnimationFrame(animate);
}
animate();