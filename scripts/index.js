const sentenceElement = document.getElementById("sentence");
const scrambledSentenceElement = document.getElementById("scambled-sentence");
const userGuessInputElement = document.getElementById("user-guess");

const fetchAddr = "https://gnftest001-backend.onrender.com/toc128_api/get_sentences_list";
const fetchAddrTest = "http://127.0.0.1:10000/toc128_api/get_sentences_list/";

let addrFetch = fetchAddr; // Change this according to build.

let scrambled_sentence = [];
let sentences = [];
let wait_done = false;
let sentenceVisible = true;

function chooseRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

async function fetchSentences() {
    sentences = await (await fetch(addrFetch)).json();
}

function waitForArray(array) {
    return new Promise(resolve => {
        const intervalId = setInterval(() => {
            if (array.length>0) {
                clearInterval(intervalId);
                resolve(array);
            }
        }, 250);
    });
}

async function getRandomSentence() {
    if (!wait_done) {
        await waitForArray(sentences);
        wait_done = true;
    }

    return chooseRandom(sentences);
}

async function showSentence() {
    //toggleOriginalSentenceVisibility();
    sentenceVisible ? toggleOriginalSentenceVisibility() : null;
    userGuessInputElement.value = "";
    sentenceElement.innerText = "Loading...";
    scrambledSentenceElement.innerText = "Loading...";

    let sentence = await getRandomSentence();
    
    sentenceElement.innerText = `Sentence: ${sentence}${
        !(sentence.slice(-1).includes('.') || 
        sentence.slice(-1).includes('?') || 
        sentence.slice(-1).includes('!')) ? '.' : ''}`; // Display the topic & sentence`
    
    scrambled_sentence = scrambleSentence(sentence);
    scrambledSentenceElement.innerText = `Scramabled Sentence: ${scrambled_sentence.split(' ').length <= 5 ? scrambled_sentence.toLowerCase() : scrambled_sentence}`;
}

function scrambleSentence(sentence) {
    sentence = sentence.substring(0, sentence.length-1);

    const words = sentence.split(' ');
    const wordsLength = words.length;

    let scrambled_sentence = sentence;

    while (sentence.toLowerCase() === scrambled_sentence.toLowerCase()) {
        scrambled_sentence = [];

        for (let _ = 0; _ < wordsLength; _++) {
            const index = Math.floor(Math.random()*words.length);

            scrambled_sentence.push(words[index]);
            words.splice(index, 1);
        }

        scrambled_sentence = scrambled_sentence.join(' ');
    }

    return scrambled_sentence;
}

function toggleOriginalSentenceVisibility() {
    sentenceElement.style.opacity = sentenceVisible ? 0 : 1;
    sentenceVisible = !sentenceVisible;
}

function checkGuess(event) {
    if (event.key === 'Enter') {
        if (!sentenceVisible) {
            toggleOriginalSentenceVisibility();
        } else {
            showSentence();
        }
    }
}

userGuessInputElement.addEventListener('keydown', checkGuess);

fetchSentences();
