const fromText = document.querySelector(".from-text"),
    toText = document.querySelector(".to-text"),
    exchangeIcon = document.querySelector(".exchange"),
    selectTag = document.querySelectorAll("select"),
    icons = document.querySelectorAll(".row i"),
    translateBtn = document.querySelector("button"),
    micFrom = document.querySelector("#from-mic");

// Populate language select options
selectTag.forEach((tag, id) => {
    for (let country_code in countries) {
        let selected = id == 0
            ? country_code == "en-GB" ? "selected" : ""
            : country_code == "hi-IN" ? "selected" : "";
        let option = `<option ${selected} value="${country_code}">${countries[country_code]}</option>`;
        tag.insertAdjacentHTML("beforeend", option);
    }
});

// Exchange text and languages between input and output areas
exchangeIcon.addEventListener("click", () => {
    let tempText = fromText.value,
        tempLang = selectTag[0].value;
    fromText.value = toText.value;
    toText.value = tempText;
    selectTag[0].value = selectTag[1].value;
    selectTag[1].value = tempLang;
});

// Clear translation when there is no input text
fromText.addEventListener("keyup", () => {
    if (!fromText.value) {
        toText.value = "";
    }
});

// Translate the text using MyMemory API
translateBtn.addEventListener("click", () => {
    let text = fromText.value.trim(),
        translateFrom = selectTag[0].value,
        translateTo = selectTag[1].value;

    if (!text) return;

    toText.setAttribute("placeholder", "Translating...");
    let apiUrl = `https://api.mymemory.translated.net/get?q=${text}&langpair=${translateFrom}|${translateTo}`;

    fetch(apiUrl).then(res => res.json()).then(data => {
        toText.value = data.responseData.translatedText;
        data.matches.forEach(match => {
            if (match.id === 0) {
                toText.value = match.translation;
            }
        });
        toText.setAttribute("placeholder", "Translation");
    });
});

// Speech-to-text functionality
function startSpeechToText() {
    if (!("webkitSpeechRecognition" in window)) {
        alert("Your browser does not support speech recognition. Please use Chrome.");
        return;
    }

    const speechRecognizer = new webkitSpeechRecognition();
    speechRecognizer.continuous = true;
    speechRecognizer.interimResults = true;
    speechRecognizer.lang = selectTag[0].value; // Source language

    let finalTranscript = "";

    // Start speech recognition
    micFrom.classList.add("listening");
    micFrom.style.color = "red";
    speechRecognizer.start();

    speechRecognizer.onresult = (event) => {
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
            let transcript = event.results[i][0].transcript;
            transcript = transcript.replace("\n", "<br>");
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        fromText.value = finalTranscript + interimTranscript;
    };

    speechRecognizer.onend = () => {
        micFrom.classList.remove("listening");
        micFrom.style.color = ""; // Reset mic color
    };

    speechRecognizer.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        alert("Speech recognition error: " + event.error);
        micFrom.classList.remove("listening");
        micFrom.style.color = ""; // Reset mic color
    };
}

// Add event listener to microphone button
micFrom.addEventListener("click", () => {
    startSpeechToText();
});

// Icon functionalities (copy or speech synthesis)
icons.forEach(icon => {
    icon.addEventListener("click", ({ target }) => {
        if (!fromText.value && !toText.value) return;

        // Copy to clipboard functionality
        if (target.classList.contains("fa-copy")) {
            if (target.id === "from-copy") {
                navigator.clipboard.writeText(fromText.value);
            } else {
                navigator.clipboard.writeText(toText.value);
            }
        }
        // Speech synthesis (text-to-speech)
        else if (target.classList.contains("fa-volume-up")) {
            let utterance;
            if (target.id === "from-volume") {
                utterance = new SpeechSynthesisUtterance(fromText.value);
                utterance.lang = selectTag[0].value;
            } else {
                utterance = new SpeechSynthesisUtterance(toText.value);
                utterance.lang = selectTag[1].value;
            }
            speechSynthesis.speak(utterance);
        }
    });
});
