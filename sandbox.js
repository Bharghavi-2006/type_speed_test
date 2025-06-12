const words = 'the series was originally published in english by bloomsbury in the united kingdom and scholastic press in the united states a series of many genres including fantasy drama coming of age fiction and the british school story which includes elements of mystery thriller adventure horror and romance the world of harry potter explores numerous themes and includes many cultural meanings and references major themes in the series include prejudice corruption madness love and death since the release of the first novel harry potter and the philosophers stone on the books have found immense popularity and commercial success worldwide they have attracted a wide adult audience as well as younger readers and are widely considered cornerstones of modern literature though the books have received mixed reviews from critics and literary scholars as of february the books have sold more than million copies worldwide making them the bestselling book series in history available in dozens of languages'.split(' ');
const wordsCount = words.length;
const gameTime = 60 * 1000;
let timer = null;
let gameStart = null;
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

function addClass(el, name) {
    if (el) el.classList.add(name);
}

function removeClass(el, name) {
    if (el) el.classList.remove(name);
}

function randomWord() {
    const randomIndex = Math.floor(Math.random() * wordsCount);
    return words[randomIndex];
}

function formatWord(word) {
    return `<div class="word"><span class="letter">${word.split('').join('</span><span class="letter">')}</span></div>`;
}

function startTimer() {
    gameStart = Date.now();
    updateTimer();
    timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
    const msPassed = Date.now() - gameStart;
    const sPassed = Math.floor(msPassed / 1000);
    const sLeft = (gameTime / 1000) - sPassed;
    const infoEl = document.getElementById('info');
    if (infoEl) {
        infoEl.innerHTML = Math.max(sLeft, 0) + '';
    }
    if (sLeft <= 0) {
        gameOver();
    }
}

function newGame() {
    clearInterval(timer);
    timer = null;
    gameStart = null;

    const container = document.getElementById('words');
    if (!container) return;
    
    container.innerHTML = '';
    container.style.marginTop = '0px';

    for (let i = 0; i < 200; i++) {
        container.innerHTML += formatWord(randomWord());
    }

    addClass(document.querySelector('.word'), 'current');
    addClass(document.querySelector('.letter'), 'current');
    
    const infoEl = document.getElementById('info');
    if (infoEl) {
        infoEl.innerHTML = (gameTime / 1000) + '';
    }
    
    const gameEl = document.getElementById('game');
    if (gameEl) {
        removeClass(gameEl, 'over');
    }
    
    const mobileInput = document.getElementById('mobile-input');
    if (mobileInput) {
        mobileInput.value = '';
    }
    
    updateCursor();
}

function calculateStats() {
    const allWords = [...document.querySelectorAll('.word')];
    const currentWord = document.querySelector('.word.current');
    const currentWordIndex = allWords.indexOf(currentWord);
    const typedWords = allWords.slice(0, currentWordIndex);

    let totalTypedChars = 0;
    let correctTypedChars = 0;
    let correctWords = 0;

    typedWords.forEach(word => {
        const letters = [...word.querySelectorAll('.letter')];
        let isWordCorrect = true;
        let hasTypedChar = false;

        letters.forEach(letter => {
            if (letter.classList.contains('correct') || 
                letter.classList.contains('incorrect') || 
                letter.classList.contains('extra')) {
                totalTypedChars++;
                hasTypedChar = true;
            }

            if (letter.classList.contains('correct')) {
                correctTypedChars++;
            }

            if (letter.classList.contains('incorrect')) {
                isWordCorrect = false;
            }
        });

        if (isWordCorrect && hasTypedChar) {
            correctWords++;
        }
    });

    const wpm = correctWords;
    const cpm = correctTypedChars;
    const accuracy = totalTypedChars > 0 ? Math.round((correctTypedChars / totalTypedChars) * 100) : 0;

    let category = 'Snail 🐌';
    if (wpm > 45) category = 'T-Rex 🦖';
    else if (wpm > 40) category = 'Octopus 🐙';

    return { wpm, cpm, accuracy, category };
}

function showResultsPopup({ wpm, cpm, accuracy, category }) {
    const popup = document.getElementById('result-popup');
    const content = document.getElementById('popup-content');

    if (!popup || !content) return;

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
    clearInterval(timer);
    const gameEl = document.getElementById('game');
    if (gameEl) {
        addClass(gameEl, 'over');
        removeClass(gameEl, 'focused');
    }
    
    const stats = calculateStats();
    showResultsPopup(stats);
}

function restartGame() {
    const popup = document.getElementById('result-popup');
    if (popup) {
        popup.style.display = 'none';
    }
    newGame();
    if (isMobile) {
        focusInput();
    }
}

function updateCursor() {
    const nextLetter = document.querySelector('.letter.current');
    const nextWord = document.querySelector('.word.current');
    const cursor = document.getElementById('cursor');
    const game = document.getElementById('game');

    if (!cursor || !game) return;

    if (nextLetter) {
        const rect = nextLetter.getBoundingClientRect();
        const gameRect = game.getBoundingClientRect();
        cursor.style.top = (rect.top - gameRect.top) + 'px';
        cursor.style.left = (rect.left - gameRect.left) + 'px';
    } else if (nextWord) {
        const rect = nextWord.getBoundingClientRect();
        const gameRect = game.getBoundingClientRect();
        cursor.style.top = (rect.top - gameRect.top) + 'px';
        cursor.style.left = (rect.right - gameRect.left) + 'px';
    }
}

function handleInput(inputValue) {
    const currentWord = document.querySelector('.word.current');
    if (!currentWord) return;
    
    const currentWordText = [...currentWord.querySelectorAll('.letter')].map(l => l.textContent).join('');
    
    [...currentWord.querySelectorAll('.letter')].forEach(letter => {
        letter.classList.remove('correct', 'incorrect', 'current');
    });
    
    [...currentWord.querySelectorAll('.letter.extra')].forEach(letter => {
        letter.remove();
    });

    for (let i = 0; i < Math.max(inputValue.length, currentWordText.length); i++) {
        const typedChar = inputValue[i];
        const expectedChar = currentWordText[i];
        
        if (i < currentWordText.length) {
            const letter = currentWord.children[i];
            if (i < inputValue.length) {
                addClass(letter, typedChar === expectedChar ? 'correct' : 'incorrect');
            }
        } else if (typedChar) {
            const extraLetter = document.createElement('span');
            extraLetter.textContent = typedChar;
            extraLetter.className = 'letter incorrect extra';
            currentWord.appendChild(extraLetter);
        }
    }

    if (inputValue.length < currentWord.children.length) {
        addClass(currentWord.children[inputValue.length], 'current');
    }

    updateCursor();
}

function moveToNextWord() {
    const currentWord = document.querySelector('.word.current');
    const nextWord = currentWord ? currentWord.nextElementSibling : null;
    
    if (!nextWord) return;

    [...currentWord.querySelectorAll('.letter:not(.correct):not(.incorrect)')].forEach(letter => {
        addClass(letter, 'incorrect');
    });

    removeClass(currentWord, 'current');
    addClass(nextWord, 'current');
    addClass(nextWord.firstElementChild, 'current');

    const game = document.getElementById('game');
    if (game) {
        const gameTop = game.getBoundingClientRect().top;
        if (nextWord.getBoundingClientRect().top - gameTop > 70) {
            const words = document.getElementById('words');
            if (words) {
                const margin = parseInt(words.style.marginTop || '0px');
                words.style.marginTop = (margin - 35) + 'px';
            }
        }
    }

    updateCursor();
}

function focusInput() {
    const mobileInput = document.getElementById('mobile-input');
    const game = document.getElementById('game');
    
    if (mobileInput && game) {
        addClass(game, 'focused');
        mobileInput.focus();
        
        if (!timer) {
            startTimer();
        }
    }
}

// Initialize the game when DOM is loaded
function initGame() {
    const gameEl = document.getElementById('game');
    const mobileInput = document.getElementById('mobile-input');
    
    if (!gameEl) {
        console.error('Game element not found');
        return;
    }

    // Desktop keyboard events
    gameEl.addEventListener('keyup', function(ev) {
        if (isMobile) return; 
        
        const key = ev.key;
        const currentWord = document.querySelector('.word.current');
        const currentLetter = document.querySelector('.letter.current');
        const expected = currentLetter?.innerHTML || ' ';
        const isLetter = key.length === 1 && key !== ' ';
        const isSpace = key === ' ';
        const isBackspace = key === 'Backspace';
        const isFirstLetter = currentLetter === currentWord?.firstChild;

        if (document.querySelector('#game.over')) return;

        if (!timer && isLetter) {
            startTimer();
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
            if (currentWord.nextSibling) {
                addClass(currentWord.nextSibling, 'current');
            }
            if (currentLetter) {
                removeClass(currentLetter, 'current');
            }
            if (currentWord.nextSibling && currentWord.nextSibling.firstChild) {
                addClass(currentWord.nextSibling.firstChild, 'current');
            }
        }

        if (isBackspace) {
            if (currentLetter && isFirstLetter) {
                removeClass(currentWord, 'current');
                if (currentWord.previousSibling) {
                    addClass(currentWord.previousSibling, 'current');
                    removeClass(currentLetter, 'current');
                    addClass(currentWord.previousSibling.lastChild, 'current');
                    removeClass(currentWord.previousSibling.lastChild, 'incorrect');
                    removeClass(currentWord.previousSibling.lastChild, 'correct');
                }
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

        const game = document.getElementById('game');
        if (game && currentWord) {
            const gameTop = game.getBoundingClientRect().top;
            if (currentWord.getBoundingClientRect().top - gameTop > 70) {
                const words = document.getElementById('words');
                if (words) {
                    const margin = parseInt(words.style.marginTop || '0px');
                    words.style.marginTop = (margin - 35) + 'px';
                }
            }
        }

        updateCursor();
    });

    // Focus events
    gameEl.addEventListener('click', function() {
        if (!isMobile) {
            addClass(this, 'focused');
            this.focus();
        }
    });

    gameEl.addEventListener('focus', function() {
        if (!isMobile) {
            addClass(this, 'focused');
        }
    });

    gameEl.addEventListener('blur', function() {
        if (!isMobile) {
            removeClass(this, 'focused');
        }
    });

    // Mobile events
    if (isMobile) {
        gameEl.addEventListener('click', focusInput);
        gameEl.addEventListener('touchstart', focusInput);
    }

    // Mobile input handling
    if (mobileInput) {
        let lastInputValue = '';

        mobileInput.addEventListener('input', function(e) {
            if (document.querySelector('#game.over')) return;
            
            const inputValue = e.target.value;
            const currentWord = document.querySelector('.word.current');
            
            if (!currentWord) return;

            if (inputValue.includes(' ')) {
                const wordPart = inputValue.substring(0, inputValue.indexOf(' '));
                handleInput(wordPart);
                moveToNextWord();
                e.target.value = inputValue.substring(inputValue.indexOf(' ') + 1);
                return;
            }

            handleInput(inputValue);
            lastInputValue = inputValue;
        });

        mobileInput.addEventListener('blur', function() {
            const gameEl = document.getElementById('game');
            if (gameEl) {
                removeClass(gameEl, 'focused');
            }
        });
    }

    // Initialize the game
    newGame();
}

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}
