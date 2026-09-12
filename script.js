const yesButton = document.querySelector('#yesButton');
const noButton = document.querySelector('#noButton');
const answer = document.querySelector('#answer');
const hearts = document.querySelector('#hearts');
const loadingScreen = document.querySelector('#loadingScreen');

const noResponses = [
  'Không thật á. Em chắc chưa',
  'À không, em ấn nhầm. Em đồng ý ạaa'
];

let noClickCount = 0;

setTimeout(() => {
  document.body.classList.remove('is-loading');
  document.body.classList.add('is-ready');
  loadingScreen.setAttribute('aria-hidden', 'true');
}, 1800);

function showYesMessage() {
  window.location.href = 'success.html';
}

yesButton.addEventListener('click', showYesMessage);

noButton.addEventListener('click', () => {
  if (noClickCount < noResponses.length) {
    noButton.textContent = noResponses[noClickCount];
    noClickCount += 1;
    return;
  }

  showYesMessage();
});

function createHeart() {
  const heart = document.createElement('span');
  heart.className = 'floating-heart';
  heart.textContent = Math.random() > 0.25 ? '♥' : '♡';
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.setProperty('--size', `${0.8 + Math.random() * 1.2}rem`);
  heart.style.setProperty('--duration', `${5 + Math.random() * 5}s`);
  hearts.appendChild(heart);

  heart.addEventListener('animationend', () => heart.remove());
}

setInterval(createHeart, 650);
for (let index = 0; index < 8; index += 1) {
  setTimeout(createHeart, index * 350);
}
