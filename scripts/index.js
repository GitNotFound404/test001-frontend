const topicElement = document.getElementById("topic");
const sentenceElement = document.getElementById("sentence");
const scrambledSentenceElement = document.getElementById("scambled-sentence");
const userGuessInputElement = document.getElementById("user-guess");

const fetchAddr = "https://gnftest001-backend.onrender.com/api/get-sentences-on-random-topic";
const fetchAddrTest = "http://127.0.0.1:5000/api/get-sentences-on-random-topic";

let scrambled_sentence = [];

let addrFetch = fetchAddrTest;

function chooseRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

let storedSentences = [];

const maxMemory = 3;
const maxStorage = 3;
let fetchBusy = false;

function newSet(topic, sentences) {
    return {topic: topic, sentences: sentences, memoryLeft: Math.min(sentences.length, maxMemory)};
}

function removeUsedSet() {
    for (let i = storedSentences.length-1; i >= 0; i--) {
        console.log(`remove: ${JSON.stringify(storedSentences)}`);
        if (storedSentences[i].memoryLeft <= 0) {
            storedSentences.splice(i, 1);
        }
        console.log(`removed?: ${JSON.stringify(storedSentences)}`);
    }
}

async function fetchSetAndStore() {
    console.log(`Fetch Busy: ${fetchBusy}`);

    if ((storedSentences.length < maxStorage) && !fetchBusy) {
        fetchBusy = true;
        let set = await fetchSet();
        fetchBusy = false;

        storedSentences.push(set);
        return getUsableSet();
    }
}

async function storeFetchedSet() {
    console.log(`Fetch Busy: ${fetchBusy}`);

    if ((storedSentences.length < maxStorage) && !fetchBusy) {
        fetchBusy = true;
        let set = await fetchSet();
        fetchBusy = false;

        storedSentences.push(set);
    }
}

function waitForUsableSet() {
    return new Promise(resolve => {
        const intervalId = setInterval(() => {
            const usableSet = checkUsableSet();
            if (usableSet) {
                clearInterval(intervalId);
                resolve(usableSet);
            }
        }, 250);
    });
}

let waitedForUsableSet = false;
async function getUsableTopicSentence() {
    let set = getUsableSet();

    // If there is no usable set, and a fetch is busy, wait for it.
    if (!set) {
        if (fetchBusy) {
            set = await waitForUsableSet();
        } else {
            // Otherwise, fetch a new set (and store it).
            set = await fetchSetAndStore();
        }
    }


    console.log(`Usable Set: ${JSON.stringify(set.sentences)}`);
    console.log(`got set: ${JSON.stringify(set)}`);

    return [set.topic, chooseRandom(set.sentences)];
}

function getUsableSet() {
    for (let i = 0; i < storedSentences.length; i++) {
        if (storedSentences[i].memoryLeft > 0) {
            storedSentences[i].memoryLeft--;
            return storedSentences[i];
        }
    }
}

function checkUsableSet() {
    for (let i = 0; i < storedSentences.length; i++) {
        if (storedSentences[i].memoryLeft > 0) {
            return storedSentences[i];
        }
    }
}

async function fetchSet() {
    let response = await fetch(addrFetch);
    let jsonResponse = await response.json();
    return newSet(jsonResponse[2], jsonResponse[0]);
}


async function showSentence() {
    sentenceElement.style.opacity = 0;
    userGuessInputElement.value = "";
    topicElement.innerText = "Loading...";
    sentenceElement.innerText = "Loading...";
    scrambledSentenceElement.innerText = "Loading...";

    let [topic, sentence] = await getUsableTopicSentence(); // Get usable sentence (from storage or fetch)
    console.log(`Topic: ${topic}\nSentence: ${sentence}.`);
    removeUsedSet(); // Remove used set, if a set becomes used (memory left: 0)
    
    topicElement.innerText = `Topic: ${topic}\n`
    sentenceElement.innerText = `Sentence: ${sentence}${
        !(sentence.slice(-1).includes('.') || 
        sentence.slice(-1).includes('?') || 
        sentence.slice(-1).includes('!')) ? '.' : ''}`; // Display the topic & sentence`
    
    scrambled_sentence = scrambleSentence(sentence);
    scrambledSentenceElement.innerText = `Scramabled Sentence: ${scrambled_sentence}`;

    await storeFetchedSet(); // Store new set of sentences for later (if not maxed out)
}

function scrambleSentence(sentence) {
    const words = sentence.split(' ');
    const wordsLength = words.length;

    let scrambled_sentence = [];

    for (let _ = 0; _ < wordsLength; _++) {
        const index = Math.floor(Math.random()*words.length);
        console.log(index);

        scrambled_sentence.push(words[index]);
        words.splice(index, 1);   
    }
    

    return scrambled_sentence.join(' ');
}

function checkGuess(event) {
    if (event.key === 'Enter') {
        console.log('Pressed Enter')
        sentenceElement.style.opacity = 1;
    }
}

userGuessInputElement.addEventListener('keydown', checkGuess);

/*
function wordsUsed(scrambled_sentence) {
    words = scrambled_sentence.split(' ');
    user_word = userGuessInputElement.value.split(' ');

    for (i in (user_word.length < words.length ? user_word : words)) {
        used_words = 0

        if (user_word[i] === words[i]) {
            used_words++;
            console.log(used_words)
        }
    }
}

while (topicElement.innerText !== "Loading..." || topicElement.innerText !== "Click Get Sentence" || sentenceElement.innerText !== "Loading..." || sentenceElement.innerText !== "Click Get Sentence") {
    wordsUsed();
}
*/