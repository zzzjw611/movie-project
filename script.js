const API_KEY = '4fcb7ab026d5a3652b064611d8cf6c85';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

const categorySelect = document.getElementById('category-select');
const movieGrid = document.getElementById('movie-grid');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const pageInfo = document.getElementById('page-info');
const homeTab = document.getElementById('home-tab');
const likedTab = document.getElementById('liked-tab');

// 模态框元素
const modal = document.getElementById('movie-modal');
const backdrop = document.getElementById('modal-backdrop');
const closeBtn = backdrop.querySelector('.close-btn');

let currentCategory = 'popular';
let currentPage = 1;
let totalPages = 1;
let likedMovies = JSON.parse(localStorage.getItem('likedMovies')) || {};

document.addEventListener('DOMContentLoaded', () => {
  fetchMovies(currentCategory, currentPage);
});

categorySelect.addEventListener('change', () => {
  currentCategory = categorySelect.value;
  currentPage = 1;
  fetchMovies(currentCategory, currentPage);
});

prevBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    fetchMovies(currentCategory, currentPage);
  }
});

nextBtn.addEventListener('click', () => {
  if (currentPage < totalPages) {
    currentPage++;
    fetchMovies(currentCategory, currentPage);
  }
});

homeTab.addEventListener('click', () => {
  homeTab.classList.add('active');
  likedTab.classList.remove('active');
  categorySelect.style.display = 'inline';
  fetchMovies(currentCategory, currentPage);
});

likedTab.addEventListener('click', () => {
  likedTab.classList.add('active');
  homeTab.classList.remove('active');
  categorySelect.style.display = 'none';
  renderMovies(Object.values(likedMovies));
  pageInfo.textContent = `Liked ${Object.keys(likedMovies).length} movies`;
  prevBtn.disabled = true;
  nextBtn.disabled = true;
});

function fetchMovies(category, page) {
  fetch(`${BASE_URL}/movie/${category}?api_key=${API_KEY}&page=${page}`)
    .then(res => res.json())
    .then(data => {
      totalPages = data.total_pages;
      renderMovies(data.results);
      updatePagination();
    })
    .catch(err => console.error('Error fetching movies:', err));
}

function renderMovies(movies) {
  movieGrid.innerHTML = '';
  movies.forEach(movie => {
    const isLiked = likedMovies[movie.id];

    const card = document.createElement('div');
    card.className = 'movie-card';

    card.innerHTML = `
      <img src="${IMAGE_BASE + movie.poster_path}" alt="${movie.title}">
      <h3 class="movie-title" data-id="${movie.id}">${movie.title}</h3>
      <p class="rating">
        <i class="ion-ios-star"></i> ${movie.vote_average.toFixed(1)}
      </p>
      <i class="${isLiked ? 'ion-ios-heart liked' : 'ion-ios-heart-outline'} like-icon" data-id="${movie.id}"></i>
    `;

    // 收藏功能liked
    const likeIcon = card.querySelector('.like-icon');
    likeIcon.addEventListener('click', () => {
      const id = movie.id;
      if (likedMovies[id]) {
        delete likedMovies[id];
      } else {
        likedMovies[id] = movie;
      }
      localStorage.setItem('likedMovies', JSON.stringify(likedMovies));
      if (likedTab.classList.contains('active')) {
        renderMovies(Object.values(likedMovies));
      } else {
        renderMovies(movies);
      }
    });

    // 点击标题显示模态框
    const titleEl = card.querySelector('.movie-title');
    titleEl.addEventListener('click', () => {
      fetchMovieDetail(movie.id);
    });

    movieGrid.appendChild(card);
  });
}

function updatePagination() {
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

// 关闭模态框
closeBtn.addEventListener('click', () => {
  backdrop.classList.add('hidden');
});

// 获取电影详情
function fetchMovieDetail(movieId) {
  fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      renderMovieModal(data);
    })
    .catch(err => console.error('Error loading movie detail:', err));
}

// 模态框render view
function renderMovieModal(movie) {
  const genres = movie.genres.map(g => g.name).join(', ');
  const companies = movie.production_companies
    .filter(c => c.logo_path)
    .map(c => `<img src="${IMAGE_BASE + c.logo_path}" alt="${c.name}" style="height:30px; margin-right:8px;" />`)
    .join('');

    modal.innerHTML = `
    <span class="close-btn">&times;</span>
    <div class="modal-content">
      <div class="modal-left">
        <img src="${IMAGE_BASE + movie.poster_path}" alt="${movie.title}">
      </div>
      <div class="modal-right">
        <h2>${movie.title}</h2>
        <p><strong>Overview</strong><br>${movie.overview}</p>
        <p><strong>Genres</strong><br>${movie.genres.map(g => `<span class="genre-tag">${g.name}</span>`).join(' ')}</p>
        <p><strong>Rating:</strong> ${movie.vote_average.toFixed(1)}</p>
        <p><strong>Production</strong><br>${
          movie.production_companies
            .filter(c => c.logo_path)
            .map(c => `<img src="${IMAGE_BASE + c.logo_path}" alt="${c.name}" style="height:30px; margin-right:8px;" />`)
            .join('')
        }</p>
      </div>
    </div>
  `;
  

  modal.querySelector('.close-btn').addEventListener('click', () => {
    backdrop.classList.add('hidden');
  });

  backdrop.classList.remove('hidden');
}
