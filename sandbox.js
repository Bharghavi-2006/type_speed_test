const words = 'the series was originally published in english by bloomsbury in the united kingdom and scholastic press in the united states a series of many genres including fantasy drama coming of age fiction and the british school story which includes elements of mystery thriller adventure horror and romance the world of harry potter explores numerous themes and includes many cultural meanings and references major themes in the series include prejudice corruption madness love and death since the release of the first novel harry potter and the philosophers stone on the books have found immense popularity and commercial success worldwide they have attracted a wide adult audience as well as younger readers and are widely considered cornerstones of modern literature though the books have received mixed reviews from critics and literary scholars as of february the books have sold more than million copies worldwide making them the bestselling book series in history available in dozens of languages'.split(' ');
const wordsCount = words.length;
const gameTime = 60 * 1000;
window.timer = null;
window.gameStart = null;

function addClass(el, name) {
  el.classList.add(name);
}

function removeClass(el, name) {
  el.classList.remove(name);
}

function randomWord() {
  const randomIndex = Math.floor(Math.random() * wordsCount);
  return words[randomIndex];
}

function formatWord(word) {
  return `<div class="word"><span class="letter">${word.split('').join('</span><span class="letter">')}</span></div>`;
}

function startTimer() {
  window.gameStart = Date.now();
  updateTimer(); // ⏱️ Immediately show first value
  window.timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
  const msPassed = Date.now() - window.gameStart;
  const sPassed = Math.floor(msPassed / 1000);
  const sLeft = (gameTime / 1000) - sPassed;
  document.getElementById('info').innerHTML = Math.max(sLeft, 0) + '';
  if (sLeft <= 0) {
    gameOver();
  }
}

function newGame() {
  clearInterval(window.timer);
  window.timer = null;
  window.gameStart = null;

  const container = document.getElementById('words');
  container.innerHTML = '';
  container.style.marginTop = '0px';

  for (let i = 0; i < 200; i++) {
    container.innerHTML += formatWord(randomWord());
  }

  addClass(document.querySelector('.word'), 'current');
  addClass(document.querySelector('.letter'), 'current');
  document.getElementById('info').innerHTML = (gameTime / 1000) + '';
}

function calculateStats() {
  const words = [...document.querySelectorAll('.word')];
  const currentWord = document.querySelector('.word.current');
  const currentWordIndex = words.indexOf(currentWord);
  const typedWords = words.slice(0, currentWordIndex + 1); // include current word

  let totalTypedChars = 0;
  let correctTypedChars = 0;
  let correctWords = 0;

  typedWords.forEach(word => {
    const letters = [...word.querySelectorAll('.letter')];

    let isWordCorrect = true;

    letters.forEach(letter => {
      if (
        letter.classList.contains('correct') ||
        letter.classList.contains('incorrect') ||
        letter.classList.contains('extra')
      ) {
        totalTypedChars++;
      }

      if (letter.classList.contains('correct')) {
        correctTypedChars++;
      }

      if (letter.classList.contains('incorrect')) {
        isWordCorrect = false;
      }
    });

    if (isWordCorrect) {
      correctWords++;
    }
  });

  const wpm = correctWords;
  const cpm = correctTypedChars;
  const accuracy = totalTypedChars > 0
    ? Math.round((correctTypedChars / totalTypedChars) * 100)
    : 0;

  let category = 'Snail 🐌';
  if (wpm > 45) category = 'T-Rex 🦖';
  else if (wpm > 40) category = 'Octopus 🐙';

  return { wpm, cpm, accuracy, category };
}

function showResultsPopup({ wpm, cpm, accuracy, category }) {
  const popup = document.getElementById('result-popup');
  const content = document.getElementById('popup-content');

  content.innerHTML = `
    <h2>You're a ${category}!</h2>
    <p><strong>Words per minute:</strong> ${wpm}</p>
    <p><strong>Characters per minute:</strong> ${cpm}</p>
    <p><strong>Accuracy:</strong> ${accuracy}%</p>
    <p>Keep practicing to improve your speed and precision!</p>
    <button onclick="restartGame()">Play Again</button>
  `;

  popup.style.display = 'block';
}


function gameOver() {
  clearInterval(window.timer);
  addClass(document.getElementById('game'), 'over');
  
  const stats = calculateStats();
  showResultsPopup(stats);
}

function restartGame() {
  document.getElementById('result-popup').style.display = 'none';
  removeClass(document.getElementById('game'), 'over');
  newGame();
}


document.getElementById('game').addEventListener('keyup', ev => {
  const key = ev.key;
  const currentWord = document.querySelector('.word.current');
  const currentLetter = document.querySelector('.letter.current');
  const expected = currentLetter?.innerHTML || ' ';
  const isLetter = key.length === 1 && key !== ' ';
  const isSpace = key === ' ';
  const isBackspace = key === 'Backspace';
  const isFirstLetter = currentLetter === currentWord.firstChild;

  if (document.querySelector('#game.over')) return;

  if (!window.timer && isLetter) {
    startTimer(); // ✅ Starts and updates immediately
  }

  if (isLetter) {
    if (currentLetter) {
      addClass(currentLetter, key === expected ? 'correct' : 'incorrect');
      removeClass(currentLetter, 'current');
      if (currentLetter.nextSibling) {
        addClass(currentLetter.nextSibling, 'current');
      }
    } else {
      const incorrectLetter = document.createElement('span');
      incorrectLetter.innerHTML = key;
      incorrectLetter.className = 'letter incorrect extra';
      currentWord.appendChild(incorrectLetter);
    }
  }

  if (isSpace) {
    if (expected !== ' ') {
      const lettersToInvalidate = [...document.querySelectorAll('.word.current .letter:not(.correct)')];
      lettersToInvalidate.forEach(letter => {
        addClass(letter, 'incorrect');
      });
    }
    removeClass(currentWord, 'current');
    addClass(currentWord.nextSibling, 'current');
    if (currentLetter) {
      removeClass(currentLetter, 'current');
    }
    addClass(currentWord.nextSibling.firstChild, 'current');
  }

  if (isBackspace) {
    if (currentLetter && isFirstLetter) {
      removeClass(currentWord, 'current');
      addClass(currentWord.previousSibling, 'current');
      removeClass(currentLetter, 'current');
      addClass(currentWord.previousSibling.lastChild, 'current');
      removeClass(currentWord.previousSibling.lastChild, 'incorrect');
      removeClass(currentWord.previousSibling.lastChild, 'correct');
    }
    if (currentLetter && !isFirstLetter) {
      removeClass(currentLetter, 'current');
      addClass(currentLetter.previousSibling, 'current');
      removeClass(currentLetter.previousSibling, 'incorrect');
      removeClass(currentLetter.previousSibling, 'correct');
    }
    if (!currentLetter) {
      addClass(currentWord.lastChild, 'current');
      removeClass(currentWord.lastChild, 'incorrect');
      removeClass(currentWord.lastChild, 'correct');
    }
  }

  // scroll logic
  const gameTop = document.getElementById('game').getBoundingClientRect().top;
  if (currentWord.getBoundingClientRect().top - gameTop > 70) {
    const words = document.getElementById('words');
    const margin = parseInt(words.style.marginTop || '0px');
    words.style.marginTop = (margin - 35) + 'px';
  }

  // cursor movement
  const nextLetter = document.querySelector('.letter.current');
  const nextWord = document.querySelector('.word.current');
  const cursor = document.getElementById('cursor');

  if (nextLetter) {
    const rect = nextLetter.getBoundingClientRect();
    const gameRect = document.getElementById('game').getBoundingClientRect();
    cursor.style.top = (rect.top - gameRect.top) + 'px';
    cursor.style.left = (rect.left - gameRect.left) + 'px';
  } else {
    const rect = nextWord.getBoundingClientRect();
    const gameRect = document.getElementById('game').getBoundingClientRect();
    cursor.style.top = (rect.top - gameRect.top) + 'px';
    cursor.style.left = (rect.right - gameRect.left) + 'px';
  }
});

newGame();
