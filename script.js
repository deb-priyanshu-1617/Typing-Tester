/* 
   Element Selectors
*/
const timerEl = document.getElementById("timer");
const startBtn = document.getElementById("start-btn");
const submitBtn = document.getElementById("submit-btn");
const displayPara = document.getElementById("text-display");
const inputArea = document.getElementById("input-area");

const wpm = document.querySelectorAll(".wpm");
const userAccuracy = document.querySelectorAll(".accuracy");
const userWords = document.getElementById("total-words");
let timeTaken = document.getElementById("total-time");
const userError = document.querySelectorAll(".errors");

const resultSection = document.getElementById("results-section");

/* 
   Variables
*/
let actualPara = "";
let inputPara = "";
let totalChar = 0;
let timerId;

let time = 60;

/* 
   Start Button Click Event
*/
inputArea.disabled = true;
startBtn.addEventListener("click", startTest);

/* 
   Fetching Paragraph
*/
async function paraFetching() {
    let randomIndex = Math.floor(Math.random() * 5) + 1;

    try {
        const response = await fetch("texts.json");
        if (!response.ok) throw new Error("Failed to load JSON file");

        const data = await response.json();
        return data[randomIndex].text;
    } 
    catch (error) {
        console.error("Error loading JSON:", error);
    }
}

/* 
   Start Test Function
*/
async function startTest() {
    actualPara = "";
    inputPara = "";
    inputArea.value = "";
    time = 61;
    startBtn.disabled = true;
    inputArea.disabled = false;
    inputArea.focus();


    actualPara = await paraFetching();
    // Wrap each character in a span so we can color it
    displayPara.innerHTML = actualPara
        .split("")
        .map(char => `<span>${char}</span>`)
        .join("");

    timerId = setInterval(() => {
        time--;
        timerEl.textContent = time;

        if (time === 0) {
            clearInterval(timerId);
        }
    }, 1000);
}

/* 
   Submit Button Click Event
*/
submitBtn.addEventListener("click", resultUpdate);

/* 
   Character Stats Calculation
*/
function stastics() {
    let correctChar = 0;
    let inCorrectChar = 0;

    
    inputPara = inputArea.value;
    inputPara = inputArea.value.trim();

    for (let i = 0; i < inputPara.length; i++) {
        if (inputPara[i] === actualPara[i]) {
            correctChar++;
        } else {
            console.log("correct:", actualPara[i], "typo:", inputPara[i]);
            inCorrectChar++;
        }
    }

    return { correctChar, inCorrectChar };
}

/* 
   Result Update Function
*/
function resultUpdate() {
    clearInterval(timerId);
    inputArea.disabled = true;
    startBtn.disabled = false;


    let { correctChar, inCorrectChar } = stastics();
    let usertimeTaken = 60 - time;

    timeTaken.textContent = usertimeTaken + "s";

    totalChar = actualPara.length;

    // WPM Calculation
    let wpmCal = ((correctChar / 5) / (usertimeTaken / 60));

    wpm.forEach(el => {
        el.textContent = wpmCal.toFixed(0);
    });

    // Accuracy
    userAccuracy.forEach(el => {
        el.textContent = ((correctChar / totalChar) * 100).toFixed(2) + "%";
    });

    // Total Words
    userWords.textContent = ((correctChar + inCorrectChar) / 5).toFixed(0);

    // Errors
    userError.forEach(el => {
        el.textContent = inCorrectChar;
    });

    // Show Results
    resultSection.style.display = "block";
}

/* 
   updateKeyword color Function
*/


inputArea.addEventListener("input", updateKeyword);

function updateKeyword() {
    let typedText = inputArea.value;
    let spans = displayPara.querySelectorAll("span");
    
    for (let i = 0; i < typedText.length; i++) {
        if (typedText[i] === actualPara[i]) {
            spans[i].classList.add('correct');
            spans[i].classList.remove('incorrect');
        } else {
            spans[i].classList.add('incorrect');
            spans[i].classList.remove('correct');
        }
    }

}
