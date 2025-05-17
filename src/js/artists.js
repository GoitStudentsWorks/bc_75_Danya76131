// === api ===
import axios from 'axios';

async function getArtistsData(pg = 1) {
  axios.defaults.baseURL = 'https://sound-wave.b.goit.study/api';
  try {
    const response = await axios.get('/artists', {
      params: {
        limit: 8,
        page: pg ? pg : 1,
      },
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

async function getArtistById(id = '') {
  axios.defaults.baseURL = 'https://sound-wave.b.goit.study/api/artists';
  try {
    const response = await axios.get(id);
    console.log(response);
    return response.data;
  } catch (error) {
    console.log(error.message);
  }
}

// === main ===

const NO_IMAGE = 'https://placehold.co/600x400?text=Oups!+No+Image';
const NO_BIO = 'Not much to tell about this artist';
const NO_GENRES = "It's hard to tell the genre";
const NO_INFO = 'No exact data';

const refs = {
  artistsListEl: document.querySelector('.js-artists-list'),
  artistsLoaderEl: document.querySelector('.artist-loader.loader'),
  artistsLoadMoreBtnEl: document.querySelector('.js-load-more-btn'),
  artistModalEl: document.querySelector('.js-artist-modal'),
  artistModalLoaderEl: document.querySelector('.artist-modal-loader.loader'),
};

document.addEventListener('DOMContentLoaded', handlePageFirstArtistsLoad);
refs.artistsLoadMoreBtnEl.addEventListener('click', handleLoadMoreArtistBtn);
refs.artistsListEl.addEventListener('click', handleLearnMoreBtnOnArtistList);
document.addEventListener('keydown', onEscKeyPress);
refs.artistModalEl.addEventListener('click', onBackdropClick);

async function handlePageFirstArtistsLoad() {
  showArtistLoader();
  try {
    const { artists, totalArtists } = await getArtistsData();
    renderArtistList(artists);
    paginator.setTotal(totalArtists);
  } catch (error) {
    console.log(error);
  } finally {
    hideArtistLoader();
  }
}

async function handleLoadMoreArtistBtn() {
  showArtistLoader();
  lockLoadMoreBtn();
  try {
    if (!paginator.isArtistLeft()) {
      console.log('no more artists');
      hideArtistLoader();
      return;
    }

    paginator.setNewPage();
    const newPage = paginator.getPage();

    const response = await getArtistsData(newPage);
    renderArtistList(response.artists);
  } catch (error) {
    console.log(error);
  } finally {
    hideArtistLoader();
    unlockLoadMoreBtn();
  }
}

async function handleLearnMoreBtnOnArtistList(e) {
  const learnMoreBtn = e.target.closest('.js-learn-more-btn');
  if (e.target.nodeName !== 'BUTTON' || !learnMoreBtn) {
    return;
  }
  try {
    showArtistModalLoader();

    learnMoreBtn.disabled = true;
    learnMoreBtn.classList.add('is-disabled');

    const artistId = e.target.closest('.artists-list-item').id;
    const genres = e.target
      .closest('.artists-list-item')
      .children[1].outerText.split('\n');
    const artist = await getArtistById(artistId);

    openArtistModal();
    renderSingleArtistModalCard(artist, genres);

    document.addEventListener('click', function (e) {
      if (e.target.classList.contains('bio-toggle-btn')) {
        const bioText = e.target.previousElementSibling;
        bioText.classList.toggle('expanded');
        e.target.textContent = bioText.classList.contains('expanded')
          ? 'Show less'
          : 'Show more';
      }
    });
  } catch (error) {
    console.log(error.message);
  } finally {
    hideArtistModalLoader();
    learnMoreBtn.classList.remove('is-disabled');
    learnMoreBtn.disabled = false;
  }
}

// === lock/unlock load more btn ===

function lockLoadMoreBtn() {
  refs.artistsLoadMoreBtnEl.disabled = true;
  refs.artistsLoadMoreBtnEl.classList.add('is-disabled');
}

function unlockLoadMoreBtn() {
  refs.artistsLoadMoreBtnEl.classList.remove('is-disabled');
  refs.artistsLoadMoreBtnEl.disabled = false;
}

// === artist list markup ===

function renderArtistList(array = []) {
  if (!array || array.length === 0) return;
  refs.artistsListEl.insertAdjacentHTML('beforeend', createArtistList(array));
}

function createArtistList(array = []) {
  return array.map(createArtistMarkup).join('');
}

function createArtistMarkup(obj = {}) {
  const { genres = [], strArtist, strArtistThumb, strBiographyEN, _id } = obj;

  const genresMarkup = checkIfArtistHasGenres(genres);

  return `<li class="artists-list-item" id=${_id}>
  <div class="artist-item-img-wrapper">
            <img class="artists-list-item-img" src=${
              strArtistThumb ? strArtistThumb : NO_IMAGE
            } alt="${strArtist}" />
            </div>
            <ul class="artist-item-tags-list">
            ${genresMarkup}
            </ul>
            <ul class="artist-item-info-list">
              <li class="artist-info-name">${strArtist}</li>
              <li class="artist-info-bio">${
                strBiographyEN ? strBiographyEN : NO_BIO
              }</li>
            </ul>
            <button
              type="button"
              class="artists-learn-more-btn js-learn-more-btn"
            >
              Learn More
              <svg class="learn-more-svg" width="8" height="15">
                <use href="/img/sprite.svg#icon-learn-more"></use>
              </svg>
            </button>
          </li>
        </ul>`;
}

function checkIfArtistHasGenres(genres = []) {
  if (genres.length === 0) {
    return `<li class="artist-tags-genres">${NO_GENRES}</li>`;
  }

  return genres
    .flatMap(g => g.split('/'))
    .filter((gen, idx, arr) => arr.indexOf(gen) === idx)
    .map(genre => {
      return `<li class="artist-tags-genres">${genre}</li>`;
    })
    .join('');
}

// === pagination ===

const paginator = {
  page: 1,
  totalArtists: null,
  limit: 8,

  getPage() {
    return this.page;
  },

  setNewPage() {
    this.page += 1;
  },

  setTotal(total) {
    this.totalArtists = total;
  },

  isArtistLeft() {
    return this.totalArtists > this.page * this.limit;
  },

  reset() {
    this.page = 1;
    this.totalArtists = null;
    this.limit = 8;
  },
};

// === loaders ===

function showArtistLoader() {
  refs.artistsLoaderEl.style.display = 'block';
}

function hideArtistLoader() {
  refs.artistsLoaderEl.style.display = 'none';
}

function showArtistModalLoader() {
  refs.artistModalLoaderEl.style.display = 'block';
}

function hideArtistModalLoader() {
  refs.artistModalLoaderEl.style.display = 'none';
}

// === open/close modal ===

function openArtistModal() {
  refs.artistModalEl.classList.add('artist-is-open');
  document.body.classList.add('modal-open');
}

function closeArtistModal() {
  refs.artistModalEl.classList.remove('artist-is-open');
  document.body.classList.remove('modal-open');
  deleteSingleArtistModalCard();
}

function onEscKeyPress(e) {
  if (e.key === 'Escape') {
    closeArtistModal();
  }
}

function onBackdropClick(e) {
  const modalCloseBtn = e.target.closest('.artist-modal-backdrop-close-btn');
  if (e.target === e.currentTarget || modalCloseBtn) {
    closeArtistModal();
  }
}

// === render artist by id ===

function deleteSingleArtistModalCard() {
  refs.artistModalEl.innerHTML = '';
}

function renderSingleArtistModalCard(artist = {}, genres = []) {
  refs.artistModalEl.insertAdjacentHTML(
    'beforeend',
    createSingleArtistMarkup(artist, genres)
  );
}

function createSingleArtistMarkup(obj = {}, array = []) {
  const {
    strArtistThumb,
    strArtist,
    intFormedYear,
    intDiedYear,
    strGender,
    intMembers,
    strCountry,
    strBiographyEN,
    tracksList = [],
  } = obj;

  const genresMarkup = checkIfArtistHasGenres(array);
  const albumsMarkup = createArtistAlbums(tracksList);

  return `
  <div class="artist-modal-container">
  <button type="button" class="artist-modal-backdrop-close-btn">
    <svg class="artist-backdrop-close-icon" width="24" height="24">
      <use href="/img/sprite.svg#icon-x-close"></use>
    </svg>
  </button>
  <p class="artist-modal-title">${strArtist ? strArtist : 'Artist'}</p>
  <div class="artist-modal-about-wrapper">
  <div class="artist-modal-img-wrapper">
      <img class="art-mod-img" src="${
        strArtistThumb ? strArtistThumb : NO_IMAGE
      }" alt="${strArtist ? strArtist : 'Artist'}" />
    </div>
    <div class="artist-modal-info-wrapper">
      <ul class="art-mod-years-sex">
        <li class="art-mod-years">
          Years active
          <p>${Number(intFormedYear) > 0 ? intFormedYear : NO_INFO} - 
          ${intDiedYear || 'present'}</p>
        </li>
        <li class="art-mod-sex">
          Sex
          <p>${strGender ? strGender : 'human'}</p>
        </li>
      </ul>
      <ul class="art-mod-members-country">
        <li class="art-mod-members">
          Members
          <p>${intMembers ? intMembers : NO_INFO}</p>
        </li>
        <li class="art-mod-country">
          Country
          <p>${strCountry ? strCountry : NO_INFO}</p>
        </li>
      </ul>
      <ul class="art-mod-biography">
        <li class="art-mod-bio">
          Biography
          <p class="bio-text">${strBiographyEN ? strBiographyEN : NO_BIO}</p>
    <button class="bio-toggle-btn" type="button">Show more</button>
        </li>
      </ul>
      <ul class="artist-item-tags-list">${genresMarkup}</ul>
      </div>
    </div>
    <div class="modal-artist-albums-wrapper">
      <p class="modal-artist-albums-title">Albums</p>
      <ul class="modal-artist-albums-list">${albumsMarkup}</ul>
    </div>
    </div>`;
}

function createArtistAlbums(array = []) {
  const markup = [];
  const albumsList = array.reduce((res, track) => {
    if (!res.includes(track.strAlbum)) {
      res.push(track.strAlbum);
    }
    return res;
  }, []);

  for (const title of albumsList) {
    const songs = array
      .filter(track => track.strAlbum === title)
      .map(createAlbumSongsList)
      .join('');

    markup.push(
      `<li class="modal-artist-albums-item">
      <p class="alb-list-title">${title}</p>
      <table class="single-album-table">
        <thead>
          <tr class="album-head">
            <th>Track</th>
            <th>Time</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody class="album-table-body">${songs}</tbody>
      </table>
    </li>`
    );
  }

  return markup.join('');
}

function createAlbumSongsList(obj = {}) {
  const { intDuration, movie, strTrack, _id } = obj;
  const youTubeBtn = `<svg class="artist-backdrop-youTube-icon" width="24" height="24">
      <use href="/img/sprite.svg#icon-youtube"></use>
    </svg>`;

  const time = formatDuration(Number(intDuration));

  return `<tr class="table-songs" id=${_id}>
            <td>${strTrack}</td>
            <td>${time}</td>
            <td><a href="${movie ? movie : '#'}" target="_blank">${
    movie ? youTubeBtn : ''
  }</a></td>
          </tr>`;
}

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
