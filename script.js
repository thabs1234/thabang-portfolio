// Theme toggle (respects saved pref + system default)
(function () {
  const root = document.documentElement;
  const saved = localStorage.getItem('thabang-theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  if (saved === 'light' || (!saved && prefersLight)) root.classList.add('light');
  const btn = document.getElementById('theme-toggle');
  btn.addEventListener('click', () => {
    root.classList.toggle('light');
    localStorage.setItem('thabang-theme', root.classList.contains('light') ? 'light' : 'dark');
  });
})();

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Scroll reveal
const revealEls = document.querySelectorAll('.section, .hero-content');
revealEls.forEach(el => el.classList.add('reveal'));
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealObserver.unobserve(e.target); } });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObserver.observe(el));

// Animate skill bars when visible
const bars = document.querySelectorAll('.bar-fill');
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const pct = e.target.getAttribute('data-pct');
      e.target.style.width = pct + '%';
      barObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
bars.forEach(b => barObserver.observe(b));
