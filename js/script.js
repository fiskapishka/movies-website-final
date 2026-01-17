const API_KEY = 'edcd4c6f';
const API_URL = 'https://www.omdbapi.com/';

const burger = document.getElementById('burger');
const navMenu = document.getElementById('navMenu');
const header = document.getElementById('header');
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const moviesGrid = document.getElementById('moviesGrid');
const modal = document.getElementById('movieModal');
const modalClose = document.getElementById('modalClose');
const modalBody = document.getElementById('modalBody');
const resultsTitle = document.getElementById('resultsTitle');
const categoryButtons = document.querySelectorAll('.category-btn');

const featuredMovies = [
    'tt0111161', 'tt0068646', 'tt0468569', 'tt0071562', 
    'tt0167260', 'tt0108052', 'tt0110912', 'tt0109830'
];

const genreMovies = {
    'action': ['tt0468569', 'tt0137523', 'tt0816692', 'tt1375666', 'tt0109830', 'tt0133093'],
    'comedy': ['tt0110912', 'tt0107290', 'tt0102926', 'tt0120737', 'tt0364569', 'tt1856101'],
    'drama': ['tt0111161', 'tt0068646', 'tt0071562', 'tt0050083', 'tt0108052', 'tt0110413'],
    'horror': ['tt0081505', 'tt0113497', 'tt0078748', 'tt1345836', 'tt0091251', 'tt0070047'],
    'romance': ['tt0110357', 'tt0120737', 'tt1856101', 'tt0338013', 'tt1187043', 'tt0259711'],
    'thriller': ['tt0137523', 'tt0114369', 'tt0110413', 'tt0253474', 'tt0482571', 'tt0167260'],
    'sci-fi': ['tt0133093', 'tt0816692', 'tt0816711', 'tt1375666', 'tt0482571', 'tt0078748'],
    'fantasy': ['tt0167260', 'tt0120737', 'tt0167261', 'tt0077869', 'tt0330373', 'tt0241527']
};

burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        burger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

let lastScrollTop = 0;
window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 100) {
        header.classList.add('fixed');
    } else {
        header.classList.remove('fixed');
    }
    
    lastScrollTop = scrollTop;
});

async function fetchMovie(imdbID) {
    try {
        const response = await fetch(`${API_URL}?apikey=${API_KEY}&i=${imdbID}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching movie:', error);
        return null;
    }
}

async function searchMovies(query) {
    try {
        moviesGrid.innerHTML = '<div class="loading">Searching...</div>';
        resultsTitle.textContent = `Search Results for "${query}"`;
        
        const response = await fetch(`${API_URL}?apikey=${API_KEY}&s=${query}`);
        const data = await response.json();
        
        if (data.Response === 'True') {
            displayMovies(data.Search);
            document.getElementById('trending').scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            moviesGrid.innerHTML = `<div class="error">No movies found. Try another search.</div>`;
        }
    } catch (error) {
        console.error('Error searching movies:', error);
        moviesGrid.innerHTML = `<div class="error">Error loading movies. Please try again.</div>`;
    }
}

function displayMovies(movies) {
    moviesGrid.innerHTML = '';
    
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.onclick = () => showMovieDetails(movie.imdbID);
        
        const poster = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster';
        
        movieCard.innerHTML = `
            <img src="${poster}" alt="${movie.Title}" class="movie-poster">
            <div class="movie-info">
                <h3 class="movie-title">${movie.Title}</h3>
                <p class="movie-year">${movie.Year}</p>
                <span class="movie-type">${movie.Type}</span>
            </div>
        `;
        
        moviesGrid.appendChild(movieCard);
    });
}

async function showMovieDetails(imdbID) {
    const movie = await fetchMovie(imdbID);
    
    if (!movie || movie.Response === 'False') {
        alert('Error loading movie details');
        return;
    }
    
    const poster = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster';
    
    modalBody.innerHTML = `
        <div class="modal-movie">
            <img src="${poster}" alt="${movie.Title}" class="modal-poster">
            <div class="modal-details">
                <h2>${movie.Title} (${movie.Year})</h2>
                <p><strong>Rating:</strong> ${movie.imdbRating}/10</p>
                <p><strong>Genre:</strong> ${movie.Genre}</p>
                <p><strong>Director:</strong> ${movie.Director}</p>
                <p><strong>Cast:</strong> ${movie.Actors}</p>
                <p><strong>Runtime:</strong> ${movie.Runtime}</p>
                <p><strong>Plot:</strong> ${movie.Plot}</p>
                <p><strong>Awards:</strong> ${movie.Awards}</p>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

modalClose.addEventListener('click', () => {
    modal.classList.remove('active');
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
    }
});

searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        searchMovies(query);
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
            searchMovies(query);
        }
    }
});

async function loadFeaturedMovies() {
    moviesGrid.innerHTML = '<div class="loading">Loading featured movies...</div>';
    resultsTitle.textContent = 'Featured Movies';
    
    const moviePromises = featuredMovies.map(id => fetchMovie(id));
    const movies = await Promise.all(moviePromises);
    
    const validMovies = movies.filter(movie => movie && movie.Response === 'True');
    
    const formattedMovies = validMovies.map(movie => ({
        imdbID: movie.imdbID,
        Title: movie.Title,
        Year: movie.Year,
        Type: movie.Type,
        Poster: movie.Poster
    }));
    
    displayMovies(formattedMovies);
}

async function loadCategoryMovies(genre) {
    const genreKey = genre.toLowerCase().replace('-', '');
    const movieIds = genreMovies[genreKey] || genreMovies['action'];
    
    moviesGrid.innerHTML = '<div class="loading">Loading movies...</div>';
    resultsTitle.textContent = `${genre.charAt(0).toUpperCase() + genre.slice(1)} Movies`;
    
    const moviePromises = movieIds.map(id => fetchMovie(id));
    const movies = await Promise.all(moviePromises);
    
    const validMovies = movies.filter(movie => movie && movie.Response === 'True');
    
    const formattedMovies = validMovies.map(movie => ({
        imdbID: movie.imdbID,
        Title: movie.Title,
        Year: movie.Year,
        Type: movie.Type,
        Poster: movie.Poster
    }));
    
    displayMovies(formattedMovies);
    document.getElementById('trending').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        categoryButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const genre = btn.getAttribute('data-genre');
        loadCategoryMovies(genre);
    });
});

window.addEventListener('DOMContentLoaded', loadFeaturedMovies);
