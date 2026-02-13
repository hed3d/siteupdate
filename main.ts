// ===== Particle System =====
interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  fadeDirection: number;
}

class ParticleSystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private mouseX = 0;
  private mouseY = 0;


  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.init();
  }

  private init(): void {
    this.resize();
    window.addEventListener("resize", () => this.resize());
    window.addEventListener("mousemove", (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });

    this.createParticles();
    this.animate();
  }

  private resize(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private createParticles(): void {
    const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 15000);

    for (let i = 0; i < particleCount; i++) {
      this.particles.push(this.createParticle());
    }
  }

  private createParticle(): Particle {
    return {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.2,
      fadeDirection: Math.random() > 0.5 ? 1 : -1,
    };
  }

  private updateParticle(particle: Particle): void {
    // Movement
    particle.x += particle.speedX;
    particle.y += particle.speedY;

    // Mouse interaction - gentle attraction
    const dx = this.mouseX - particle.x;
    const dy = this.mouseY - particle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 150) {
      const force = (150 - distance) / 150;
      particle.speedX += (dx / distance) * force * 0.01;
      particle.speedY += (dy / distance) * force * 0.01;
    }

    // Friction
    particle.speedX *= 0.99;
    particle.speedY *= 0.99;

    // Boundaries
    if (particle.x < 0 || particle.x > this.canvas.width) {
      particle.speedX *= -1;
      particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
    }
    if (particle.y < 0 || particle.y > this.canvas.height) {
      particle.speedY *= -1;
      particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
    }

    // Fade effect
    particle.opacity += 0.005 * particle.fadeDirection;
    if (particle.opacity >= 0.7 || particle.opacity <= 0.1) {
      particle.fadeDirection *= -1;
    }
  }

  private drawParticle(particle: Particle): void {
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
    this.ctx.fill();

    // Glow effect
    const gradient = this.ctx.createRadialGradient(
      particle.x, particle.y, 0,
      particle.x, particle.y, particle.size * 3
    );
    gradient.addColorStop(0, `rgba(255, 255, 255, ${particle.opacity * 0.3})`);
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
  }

  private drawConnections(): void {
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          const opacity = (1 - distance / 120) * 0.15;
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    }
  }

  private animate = (): void => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const particle of this.particles) {
      this.updateParticle(particle);
      this.drawParticle(particle);
    }

    this.drawConnections();
    requestAnimationFrame(this.animate);
  };
}

// ===== Smooth Scroll Navigation =====
function initSmoothScroll(): void {
  const navLinks = document.querySelectorAll<HTMLAnchorElement>(".nav-link");

  for (const link of navLinks) {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href");
      if (targetId) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          const navbarHeight = 80;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });
        }
      }
    });
  }
}

// ===== Active Navigation Link =====
function initActiveNavigation(): void {
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll<HTMLAnchorElement>(".nav-link");

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          for (const link of navLinks) {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${id}`) {
              link.classList.add("active");
            }
          }
        }
      }
    },
    { threshold: 0.3, rootMargin: "-80px 0px -50% 0px" }
  );

  for (const section of sections) {
    observer.observe(section);
  }
}

// ===== Mobile Menu =====
function initMobileMenu(): void {
  const menuBtn = document.querySelector(".mobile-menu-btn");
  const navLinks = document.querySelector(".nav-links");

  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      menuBtn.classList.toggle("active");
    });

    // Close menu when clicking a link
    for (const link of document.querySelectorAll(".nav-link")) {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        menuBtn.classList.remove("active");
      });
    }
  }
}

// ===== Scroll Animations =====
function initScrollAnimations(): void {
  const animatedElements = document.querySelectorAll(
    ".about-card, .gallery-item, .event-card, .contact-form, .contact-info"
  );

  const observer = new IntersectionObserver(
    (entries) => {
      let index = 0;
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const delay = index * 100;
          setTimeout(() => {
            entry.target.classList.add("animate-in");
          }, delay);
          observer.unobserve(entry.target);
        }
        index++;
      }
    },
    { threshold: 0.1 }
  );

  for (const el of animatedElements) {
    el.classList.add("animate-hidden");
    observer.observe(el);
  }

  // Add CSS for animations
  const style = document.createElement("style");
  style.textContent = `
    .animate-hidden {
      opacity: 0;
      transform: translateY(30px);
    }
    .animate-in {
      opacity: 1 !important;
      transform: translateY(0) !important;
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
  `;
  document.head.appendChild(style);
}

// ===== Form Handling =====
function initForm(): void {
  const form = document.querySelector<HTMLFormElement>(".contact-form");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      if (submitBtn) {
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Отправлено!</span>';
        submitBtn.style.background = "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)";

        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = "";
          form.reset();
        }, 2000);
      }
    });
  }
}

// ===== Parallax Effect for Floating Cards =====
function initParallax(): void {
  const cards = document.querySelectorAll<HTMLElement>(".floating-card");
  const orbs = document.querySelectorAll<HTMLElement>(".orb");

  window.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;

    let cardIndex = 0;
    for (const card of cards) {
      const speed = (cardIndex + 1) * 10;
      card.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
      cardIndex++;
    }

    let orbIndex = 0;
    for (const orb of orbs) {
      const speed = (orbIndex + 1) * 5;
      orb.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
      orbIndex++;
    }
  });
}

// ===== Initialize Everything =====
document.addEventListener("DOMContentLoaded", () => {
  new ParticleSystem("particles-canvas");
  initSmoothScroll();
  initActiveNavigation();
  initMobileMenu();
  initScrollAnimations();
  initForm();
  initParallax();
});
