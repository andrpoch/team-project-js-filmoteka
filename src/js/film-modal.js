import { api, watchedStorage, queuedStorage } from './services';
import makeOneMovieMarkup from './templates/film-modal';
import { MARKER, renderWatched, renderQueue } from './my_library';

const BTNS = {
  QUEUE: 'queue',
  WATCHED: 'watched',
  TRAILER: 'trailer',
  ADD: 'Add to',
  REMOVE: 'Remove from',
  SHOW: 'Show',
  HIDE: 'Hide',
  ON: 'btn--on',
  OFF: 'btn-modal--off',
};
// получаем ссылку на бэкдроп
const backdropRef = document.querySelector(`[data-modal="movie-one"]`);
// получаем ссылку на модалку
const modalRef = document.querySelector(`.modal`);
// получаем ссылку на галерею в которую рендерятся карточки фильмов
const movieListRef = document.querySelector('.gallery');
// получаем ссылку на кнопку закрытия модалки
const closeBtnRef = document.querySelector(`[data-modal-close="movie-one"]`);
const wrapperModalRef = document.querySelector('.wrapper-modal');
const loader = document.querySelector('.loader');


let dataMovie = {};
let watched = false;
let queued = false;
let trailerShown = false;


// Функция для очищения разметки в модальном окне
function clearModal() {
  wrapperModalRef.innerHTML = '';
}

// Функция для сообщения пользователю об ошибке
const handleError = error => {
  loader.classList.add('is-hidden');
  console.log(error.message);
};

// Функция для модального окна
async function onModalOpenClick(event) {
  const cardRef = event.target.closest('.card-item');
  if (event.target === event.currentTarget || !cardRef) {
    return;
  }
  const id = Number(cardRef.dataset.id);
  loader.classList.remove('is-hidden');
  watched = watchedStorage.checkMovie(id);
  queued = queuedStorage.checkMovie(id);
  api.id = id;
  try {
    dataMovie = await api.getMovie();

    wrapperModalRef.insertAdjacentHTML(
      'beforeend',
      makeOneMovieMarkup({ ...dataMovie, watched, queued }),
    );

    openModal();
    loader.classList.add('is-hidden');
    closeBtnRef.addEventListener('click', closeModal);
    backdropRef.addEventListener('click', onBackdropClick);
    document.addEventListener('keydown', onEscDown);
    wrapperModalRef.querySelector('.buttons__container').addEventListener('click', onModalButton);
  } catch (error) {
    handleError(error);
  }
}

function openModal() {
  backdropRef.classList.remove('is-hidden');
  document.body.classList.add('modal-open');
}

function closeModal() {
  backdropRef.classList.add('is-hidden');
  document.body.classList.remove('modal-open');
  closeBtnRef.removeEventListener('click', onBtnClick);
  backdropRef.removeEventListener('click', onBackdropClick);
  document.removeEventListener('keydown', onEscDown);
  wrapperModalRef.querySelector('.buttons__container').removeEventListener('click', onModalButton);
  clearModal();
}
function onBackdropClick(e) {
  if (e.target !== backdropRef) return;
  closeModal();
}
function onEscDown(e) {
  if (e.code !== 'Escape') return;
  closeModal();
}
function onBtnClick(e) {
  if (e.code !== closeBtnRef) return;
  closeModal();
}
function onModalButton({ target }) {
  const btn = target.dataset.btn;
  if (!btn) return;
  switch (btn) {
    case BTNS.WATCHED:
      if (watched) {
        watchedStorage.deleteMovie(dataMovie.id);
      } else {
        watchedStorage.saveMovie(dataMovie);
      }
      watched = !watched;
      toggleBtnClass(target)
      changeBtnTextWatched(target);
      if (movieListRef.classList.contains(MARKER.WATCHED)) {
        renderWatched();
      }
      return;
    case BTNS.QUEUE:
      if (queued) {
        queuedStorage.deleteMovie(dataMovie.id);
      } else {
        queuedStorage.saveMovie(dataMovie);
      }
      queued = !queued;
      toggleBtnClass(target)
      changeBtnTextQueue(target);
      if (movieListRef.classList.contains(MARKER.QUEUE)) {
        renderQueue();
      }
      return;
    case BTNS.TRAILER:
      const trailerRef = document.querySelector('.trailer');
      if (trailerShown) {
        modalRef.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
        setTimeout(() => trailerRef.classList.add('is-hidden'), 250);
      } else {
        trailerRef.classList.remove('is-hidden');
        setTimeout(
          () =>
            modalRef.scrollTo({
              top: 500,
              behavior: 'smooth',
            }),
          250,
        );
      }
      trailerShown = !trailerShown;
      toggleBtnClass(target)
      changeBtnTextTrailer(target);
      return;
    default:
      return;
  }
}

function changeBtnTextWatched(btn) {
  btn.textContent = `${watched ? BTNS.REMOVE : BTNS.ADD} ${BTNS.WATCHED}`;
}

function changeBtnTextQueue(btn) {
  btn.textContent = `${queued ? BTNS.REMOVE : BTNS.ADD} ${BTNS.QUEUE}`;
}

function changeBtnTextTrailer(btn) {
  btn.textContent = `${trailerShown ? BTNS.HIDE : BTNS.SHOW} ${BTNS.TRAILER}`;
}

function onModalCard() {
  // вешаем слушателя на общего родителя галерею
  movieListRef.addEventListener('click', onModalOpenClick);
}

function toggleBtnClass(btn){
btn.classList.toggle(BTNS.ON)
btn.classList.toggle(BTNS.OFF)
}

export default onModalCard;
