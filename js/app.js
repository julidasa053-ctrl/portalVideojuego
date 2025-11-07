// app.js - navegación simple + carga dinámica de juegos
const main = document.getElementById('mainContent');
const gamesListEl = document.getElementById('gamesList');
const gameTemplate = document.getElementById('gameCard');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.getElementById('closeModal');
const searchInput = document.getElementById('searchInput');

let games = [];

async function fetchGames(){
  try{
    const res = await fetch('resources/games.json');
    games = await res.json();
    renderGames(games);
  }catch(e){
    gamesListEl.innerHTML = '<p>Error cargando datos.</p>';
    console.error(e);
  }
}

function renderGames(list){
  gamesListEl.innerHTML = '';
  if(!list.length){
    gamesListEl.innerHTML = '<p>No se encontraron juegos.</p>';
    return;
  }
  list.forEach(g=>{
    const node = gameTemplate.content.cloneNode(true);
    node.querySelector('.thumb').src = g.image;
    node.querySelector('.title').textContent = g.title;
    node.querySelector('.genre').textContent = g.genre.join(' · ');
    node.querySelector('.rating').textContent = 'Puntuación: ' + g.rating.toFixed(1);
    node.querySelector('.detailBtn').addEventListener('click',()=> showDetails(g));
    gamesListEl.appendChild(node);
  });
  gamesListEl.classList.remove('hidden');
}

function showDetails(g){
  modalBody.innerHTML = `
    <h2>${g.title}</h2>
    <p><strong>Géneros:</strong> ${g.genre.join(', ')}</p>
    <p><strong>Plataforma:</strong> ${g.platform}</p>
    <p>${g.description}</p>
    <p><strong>Valoración:</strong> ${g.rating}/10</p>
  `;
  modal.classList.remove('hidden');
}

closeModal.addEventListener('click', ()=> modal.classList.add('hidden'));
modal.addEventListener('click', (e)=> { if(e.target === modal) modal.classList.add('hidden') });

document.getElementById('verJuegos').addEventListener('click', ()=>{
  loadPage('pages/games.html');
  // scroll to list
  setTimeout(()=> document.getElementById('gamesList')?.scrollIntoView({behavior:'smooth'}), 200);
});

document.querySelectorAll('.nav a').forEach(a=>{
  a.addEventListener('click', e=>{
    e.preventDefault();
    const link = a.getAttribute('data-link');
    if(link === 'home'){ history.pushState({},'', '/'); loadHome(); return; }
    loadPage(link);
  });
});

window.addEventListener('popstate', ()=> {
  // simple back handler: reload home
  loadHome();
});

async function loadPage(path){
  try{
    const res = await fetch(path);
    const html = await res.text();
    main.innerHTML = html;
    // after injecting, if the page is the games page, re-render controls
    if(path.includes('games.html')){
      // re-create a container for games
      const container = document.createElement('div');
      container.innerHTML = document.getElementById('gamesList') ? '' : '';
      main.appendChild(document.getElementById('gamesList') || document.createElement('div'));
      // ensure games list element exists
      const existing = document.getElementById('gamesList');
      if(existing){
        existing.classList.remove('hidden');
      }else{
        // create if needed
        const gl = document.createElement('section');
        gl.id = 'gamesList';
        gl.className = 'games-grid';
        main.appendChild(gl);
      }
      // re-attach template if missing
      if(!document.getElementById('gameCard')){
        const t = document.createElement('template');
        t.id = 'gameCard';
        t.innerHTML = `<article class="card"><img class="thumb" alt="thumb"/><div class="card-body"><h3 class="title"></h3><p class="genre"></p><p class="rating"></p><button class="detailBtn">Ver detalles</button></div></article>`;
        document.body.appendChild(t);
      }
      // get reference again
      gamesListEl = document.getElementById('gamesList');
      gameTemplate = document.getElementById('gameCard');
      renderGames(games);
    }
  }catch(e){
    main.innerHTML = '<p>Error cargando la página.</p>';
    console.error(e);
  }
}

function loadHome(){
  // reload the original index content by fetching root index.html and replacing main
  // but for simplicity we just reload the page.
  window.location.href = 'index.html';
}

searchInput.addEventListener('input', e=>{
  const q = e.target.value.trim().toLowerCase();
  const filtered = games.filter(g => g.title.toLowerCase().includes(q) || g.genre.join(' ').toLowerCase().includes(q));
  renderGames(filtered);
});

// initial fetch
fetchGames();
