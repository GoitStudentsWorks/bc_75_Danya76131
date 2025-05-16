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

const refs = {
  artistsListEl: document.querySelector('.js-artists-list'),
  artistsLoaderEl: document.querySelector('.artist-loader.loader'),
  artistsLoadMoreBtnEl: document.querySelector('.js-load-more-btn'),
  artistModalEl: document.querySelector('.js-artist-modal'),
};

document.addEventListener('DOMContentLoaded', handlePageFirstArtistsLoad);
refs.artistsLoadMoreBtnEl.addEventListener('click', handleLoadMoreArtistBtn);
refs.artistsListEl.addEventListener('click', handleLearnMoreBtnOnArtistList);

async function handlePageFirstArtistsLoad() {
  try {
    showArtistLoader();
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
  try {
    showArtistLoader();
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
  }
}

async function handleLearnMoreBtnOnArtistList(e) {
  if (e.target.nodeName !== 'BUTTON') {
    return;
  }
  try {
    showArtistLoader();
    const artistId = e.target.closest('li').id;
    const artist = await getArtistById(artistId);
    console.log(artist);
    openArtistModal();
    renderSingleArtistModalCard(artist);
  } catch (error) {
    console.log(error.message);
  } finally {
    hideArtistLoader();
  }
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
              strArtistThumb
                ? strArtistThumb
                : 'https://placehold.co/600x400?text=Oups!+No+Image'
            } alt=${strArtist} />
            </div>
            <ul class="artist-item-tags-list">
            ${genresMarkup}
            </ul>
            <ul class="artist-item-info-list">
              <li class="artist-info-name">${strArtist}</li>
              <li class="artist-info-bio">${
                strBiographyEN
                  ? strBiographyEN
                  : 'Not much to tell about this artist'
              }</li>
            </ul>
            <button
              type="button"
              class="artists-learn-more-btn js-learn-more-btn"
            >
              Learn more
              <svg class="learn-more-svg" width="24" height="24">
                <use href="/src/img/sprite.svg#icon-learn-more"></use>
              </svg>
            </button>
          </li>
        </ul>`;
}

function checkIfArtistHasGenres(genres = []) {
  if (genres.length === 0) {
    return `<li class="artist-tags-genres">It's hard to tell the genre</li>`;
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

// === open/close modal ===

function openArtistModal() {
  refs.artistModalEl.classList.add('artist-is-open');
}

function closeArtistModal() {
  refs.artistModalEl.classList.remove('artist-is-open');
}

// === render artist by id ===

function renderSingleArtistModalCard(artist = {}) {
  refs.artistModalEl.insertAdjacentHTML(
    'beforeend',
    createSingleArtistMarkup(artist)
  );
}

function createSingleArtistMarkup(obj = {}) {
  const {
    strArtistThumb,
    strArtist,
    strLabel,
    intFormedYear,
    intDiedYear,
    genres = [],
    strGender,
    intMembers,
    strCountry,
    strBiographyEN,
    tracksList = [],
  } = obj;

  const genresMarkup = checkIfArtistHasGenres(genres);

  return `
  <div class="artist-modal-container"> 
  <p class="artist-modal-title">${strArtist}</p>
  <div class="artist-modal-about-wrapper">
  <div class="artist-modal-img-wrapper">
      <img src=${
        strArtistThumb
          ? strArtistThumb
          : 'https://placehold.co/600x400?text=Oups!+No+Image'
      } alt=${strArtist} />
    </div>
    <div class="artist-modal-artist-info-wrapper"
      <ul class="art-mod-years-sex">
        <li class="art-mod-years">
          Years active
          <p>${intFormedYear}-${intDiedYear ? intDiedYear : 'present'}</p>
        </li>
        <li class="art-mod-sex">
          Sex
          <p>${strGender}</p>
        </li>
      </ul>
      <ul class="art-mod-members-country">
        <li class="art-mod-members">
          Members
          <p>${intMembers}</p>
        </li>
        <li class="art-mod-country">
          Country
          <p>${strCountry}</p>
        </li>
      </ul>
      <ul class="art-mod-bio">
        <li class="art-mod-bio">
          Biography
          <p>${strBiographyEN}</p>
        </li>
      </ul>
      <ul class="single-art-tags">
      ${genresMarkup}
      </ul>
      </div>
    </div>
    </div>`;
}
