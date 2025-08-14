const API_BASE = 'https://rickandmortyapi.com/api/character';

const state = {
  page: 1,
  name: '',
  status: '',
  totalPages: 1
};

const searchInput = document.getElementById('searchInput');
const statusSelect = document.getElementById('statusSelect');
const applyBtn = document.getElementById('applyBtn');
const resetBtn = document.getElementById('resetBtn');
const cards = document.getElementById('cards');
const loadingEl = document.getElementById('loading');
const errorAlert = document.getElementById('errorAlert');
const emptyAlert = document.getElementById('emptyAlert');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');

function setLoading(isLoading) {
  loadingEl.classList.toggle('d-none', !isLoading);
  applyBtn.disabled = isLoading;
  resetBtn.disabled = isLoading;
  prevBtn.disabled = isLoading || state.page <= 1;
  nextBtn.disabled = isLoading || state.page >= state.totalPages;
}

function showError(message) {
  errorAlert.textContent = message;
  errorAlert.classList.remove('d-none');
}

function clearFeedback() {
  errorAlert.classList.add('d-none');
  emptyAlert.classList.add('d-none');
}

function renderCards(results = []) {
  if (!results.length) {
    cards.innerHTML = '';
    emptyAlert.classList.remove('d-none');
    return;
  }
  const html = results.map(char => `
    <div class="col-12 col-sm-6 col-lg-4">
      <div class="card h-100 shadow-sm">
        <img src="${char.image}" class="card-img-top" alt="${char.name}">
        <div class="card-body">
          <h5 class="card-title mb-1">${char.name}</h5>
          <p class="mb-1"><span class="badge ${badgeClass(char.status)}">${char.status}</span></p>
          <p class="mb-1"><strong>Especie:</strong> ${char.species}</p>
          <p class="mb-0"><strong>Origen:</strong> ${char.origin?.name ?? 'Desconocido'}</p>
        </div>
      </div>
    </div>
  `).join('');
  cards.innerHTML = html;
}

function badgeClass(status) {
  const s = (status || '').toLowerCase();
  if (s === 'alive') return 'bg-success';
  if (s === 'dead') return 'bg-danger';
  return 'bg-secondary';
}

function renderPagination(info = { pages: 1 }) {
  state.totalPages = info.pages || 1;
  prevBtn.disabled = state.page <= 1;
  nextBtn.disabled = state.page >= state.totalPages;
  pageInfo.textContent = `Página ${state.page} de ${state.totalPages}`;
}

async function fetchCharacters() {
  clearFeedback();
  setLoading(true);
  try {
    const params = new URLSearchParams();
    if (state.name) params.set('name', state.name);
    if (state.status) params.set('status', state.status);
    params.set('page', state.page);

    const url = `${API_BASE}?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) {

      if (res.status === 404) {
        renderCards([]);
        renderPagination({ pages: 1 });
        return;
      }
      throw new Error(`Error HTTP ${res.status}`);
    }
    const data = await res.json();
    renderCards(data.results || []);
    renderPagination(data.info || { pages: 1 });
  } catch (err) {
    console.error(err);
    showError('Ocurrió un error al cargar los datos. Intenta nuevamente.');
  } finally {
    setLoading(false);
  }
}

applyBtn.addEventListener('click', () => {
  state.name = (searchInput.value || '').trim();
  state.status = statusSelect.value;
  state.page = 1; // reiniciar a primera página cuando cambian filtros
  fetchCharacters();
});

resetBtn.addEventListener('click', () => {
  searchInput.value = '';
  statusSelect.value = '';
  state.name = '';
  state.status = '';
  state.page = 1;
  fetchCharacters();
});

prevBtn.addEventListener('click', () => {
  if (state.page > 1) {
    state.page -= 1;
    fetchCharacters();
  }
});

nextBtn.addEventListener('click', () => {
  if (state.page < state.totalPages) {
    state.page += 1;
    fetchCharacters();
  }
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    applyBtn.click();
  }
});

fetchCharacters();