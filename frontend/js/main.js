const recordAndGetVisitorCount = async () => {
  try {
    const response = await fetch('/api/visit', { method: 'POST' });
    
    // If rate limited, fallback to just getting the count without recording a new visit
    if (response.status === 429) {
      const fallback = await fetch('/api/visits');
      const data = await fallback.json();
      document.getElementById('visitor-count').innerText = data.count;
      return;
    }

    const data = await response.json();
    document.getElementById('visitor-count').innerText = data.count;
  } catch (error) {
    console.log('Error calling visit API: ' + error);
  }
};

recordAndGetVisitorCount();

// Scroll reveal
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
reveals.forEach(el => observer.observe(el));

// Active nav link
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  navLinks.forEach(a => {
    a.style.color = a.getAttribute('href') === '#' + current ? 'var(--gold)' : '';
  });
});
