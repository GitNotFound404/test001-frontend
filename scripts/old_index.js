jsonPElement = document.getElementById("json");

const fetchAddr = "https://gnftest001-backend.onrender.com/api/get-sentences-on-random-topic";
const fetchAddrTest = "http://127.0.0.1:5000/api/get-sentences-on-random-topic";

let addrFetch = fetchAddrTest;

/*let prevTopic, cacheLeft, sentences, storedTopicSentences;

async function showJSONText() {
    jsonPElement.innerText = "Loading...";
    let response, jsonResponse, topic, randomSentence;

    /*let prevTopic = localStorage.getItem('prevTopic') || 'pencil';
    let cacheLeft = localStorage.getItem('cacheLeft') || 5;
    let topicSentences = localStorage.getItem('topicSentences');*//*

    if ((Number(cacheLeft) > 0) && sentences) {
        topic = prevTopic;
        randomSentence = chooseRandom(JSON.parse(sentences));
    } else {
        //localStorage.setItem('cacheLeft', 5);
        cacheLeft = 5;
        response = await fetch(addrFetch);
        jsonResponse = await response.json();
        //localStorage.setItem('topicSentences', JSON.stringify(jsonResponse[0]));
        sentences = JSON.stringify(jsonResponse[0]);
        prevTopic = jsonResponse[2];
    }

    randomSentence = randomSentence || chooseRandom(jsonResponse[0]);
    topic = topic || jsonResponse[2];
    /*localStorage.setItem('prevTopic', topic);
    localStorage.setItem('cacheLeft', Number(localStorage.getItem('cacheLeft'))-1);*//*
    cacheLeft--;

    jsonPElement.innerText = `Topic: ${topic}
Sentence: ${randomSentence}.`;

    /*storedTopicSentences 
    response = await fetch(addrFetch);
    jsonResponse = await response.json();
}*/

//showJSONText();

////////////////////////////////////////////////
function chooseRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/* TODO: Keep the objects set empty, and only insert when needed... */

let storedSentences = [
    /*{topic: null, sentences: null, memoryLeft: 0},
    {topic: null, sentences: null, memoryLeft: 0},
    {topic: null, sentences: null, memoryLeft: 0}*/
]

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

        //set.memoryLeft--;
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
        }, 250); // Check for a usable set every 250ms
    });
}

/* IT WORKS!!! */
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
    }/* else {
        set.memoryLeft--;
    }*/


    console.log(`Usable Set: ${JSON.stringify(set.sentences)}`);
    console.log(`got set: ${JSON.stringify(set)}`);

    // if (!fetchBusy) set.memoryLeft--;
    return [set.topic, chooseRandom(set.sentences)];
}

/*async function getUsableTopicSentence() {
    let set = getUsableSet();

    if (set) {
        // If a usable set is found immediately, return it.
        set.memoryLeft--;
        console.log(`Usable Set: ${JSON.stringify(set.sentences)}`);
        return [set.topic, chooseRandom(set.sentences)];
    }

    // If no usable set is found, we need to handle the fetch logic.
    // We will wait for a fetch to complete, whether it's an existing one or a new one.
    
    // This is the core logical change.
    // We use a promise to manage the "wait and resolve" behavior.
    return new Promise(async (resolve, reject) => {
        let intervalId;
        const checkAndResolve = () => {
            const usableSet = getUsableSet();
            if (usableSet) {
                if (intervalId) clearInterval(intervalId);
                usableSet.memoryLeft--;
                console.log(`Usable Set: ${JSON.stringify(usableSet.sentences)}`);
                resolve([usableSet.topic, chooseRandom(usableSet.sentences)]);
            }
        };

        // First, check if we can start a new fetch.
        if (!fetchBusy && storedSentences.length < maxStorage) {
            fetchBusy = true;
            try {
                let newSet = await fetchSet();
                storedSentences.push(newSet);
            } catch (error) {
                fetchBusy = false;
                reject(error); // Reject the promise if the fetch fails
                return;
            }
            fetchBusy = false;
        }

        // Check immediately after fetch, or if a fetch was already in progress.
        checkAndResolve();

        // If still no usable set, start polling.
        if (!getUsableSet()) {
            intervalId = setInterval(checkAndResolve, 250);
        }
    });
}*/

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
    jsonPElement.innerText = "Loading...";

    let [topic, sentence] = await getUsableTopicSentence(); // Get usable sentence (from storage or fetch)
    console.log(`Topic: ${topic}\nSentence: ${sentence}.`);
    removeUsedSet(); // Remove used set, if a set becomes used (memory left: 0)
    
    jsonPElement.innerText = `Topic: ${topic}\nSentence: ${sentence}${
        !(sentence.slice(-1).includes('.') || 
        sentence.slice(-1).includes('?') || 
        sentence.slice(-1).includes('!')) ? '.' : ''}`; // Display the topic & sentence

    await storeFetchedSet(); // Store new set of sentences for later (if not maxed out)
 
    /*storedSentences.forEach(set => {
        if (set.memoryLeft > 0) {
            sentenceAvailable = true;
            return;
        }
    });

    if (!sentenceAvailable) {
        response = await fetch(addrFetch);
        jsonResponse = await response.json();

        sentences = jsonResponse[0];
        
        storedSentences[0].topic = jsonResponse[2];
        storedSentences[0].sentences = sentences;
        storedSentences[0].memoryLeft = maxMemory;
    }

    let done = false;
    storedSentences.forEach((set) => {
        if ((set.memoryLeft > 0) && !done) {
            randomSentence = chooseRandom(set.sentences);
            jsonPElement.innerText = `Topic: ${set.topic}
Sentence: ${randomSentence}.`;
            set.memoryLeft = set.memoryLeft - 1;
            done = true;
        }
    })

    for (let i=0; i<storedSentences.length; i++) {
        console.log(`loop${i}`);
        if (storedSentences[i].memoryLeft <= 0) {
            response = await fetch(addrFetch);
            jsonResponse = await response.json();
            sentences = jsonResponse[0];
            console.log(`LOOPS: ${sentences}`);
            storedSentences[i].topic = jsonResponse[2];
            storedSentences[i].sentences = sentences;
            storedSentences[i].memoryLeft = maxMemory;
            console.log(`added in storedSentences = ${storedSentences}`);
        }
    };

    console.log(`done: ${storedSentences}`);*/
}
