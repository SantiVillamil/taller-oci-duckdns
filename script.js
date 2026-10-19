// 1. Menú hamburguesa en móviles
const menuBtn = document.getElementById('menuBtn');
const menu = document.getElementById('menu');
menuBtn.addEventListener('click', () => menu.classList.toggle('open'));
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));

// 2. Modo oscuro / claro
const themeBtn = document.getElementById('themeBtn');
themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  themeBtn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});

// 3. Texto que se escribe solo
const palabras = ['páginas web.', 'apps móviles.', 'dashboards.', 'soluciones en la nube.'];
const typed = document.getElementById('typed');
let p = 0, c = 0, borrando = false;
function escribir() {
  const palabra = palabras[p];
  typed.textContent = palabra.substring(0, c);
  if (!borrando && c < palabra.length) { c++; setTimeout(escribir, 90); }
  else if (borrando && c > 0) { c--; setTimeout(escribir, 45); }
  else {
    borrando = !borrando;
    if (!borrando) p = (p + 1) % palabras.length;
    setTimeout(escribir, borrando ? 1400 : 300);
  }
}
escribir();

// 4. Contadores animados al aparecer
const counters = document.querySelectorAll('.counter');
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, meta = +el.dataset.target;
    let n = 0;
    const t = setInterval(() => { n++; el.textContent = n; if (n >= meta) clearInterval(t); }, 120);
    obs.unobserve(el);
  });
});
counters.forEach(c => obs.observe(c));

// 5. Filtro de proyectos
document.querySelectorAll('.filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.cat;
    document.querySelectorAll('.card').forEach(card => {
      card.classList.toggle('hide', cat !== 'todos' && card.dataset.cat !== cat);
    });
  });
});

// 6. Validación del formulario de contacto
document.getElementById('form').addEventListener('submit', e => {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value.trim();
  document.getElementById('formMsg').textContent = `¡Gracias, ${nombre}! Tu mensaje fue recibido.`;
  e.target.reset();
});

// 7. Botón volver arriba + año actual
const topBtn = document.getElementById('topBtn');
window.addEventListener('scroll', () => topBtn.classList.toggle('show', window.scrollY > 400));
topBtn.addEventListener('click', () => window.scrollTo({ top: 0 }));
document.getElementById('year').textContent = new Date().getFullYear();
