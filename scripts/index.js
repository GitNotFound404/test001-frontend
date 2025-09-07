jsonPElement = document.getElementById("json");

const fetchAddr = "http://10.159.129.169:5000/api/random_nick";

async function showJSONText() {
    const response = await fetch(fetchAddr);
    const jsonResponse = await response.json();
    jsonPElement.innerText = `Your ID: ${jsonResponse.id} - Your Nickname: ${jsonResponse.nickname}`;
}

showJSONText();