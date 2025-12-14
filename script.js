/* 
   Element Selectors
*/
const container = document.querySelector(".container");
const toggleTheme = document.getElementById("theme-toggle");
const timerEl = document.getElementById("timer");
const startBtn = document.getElementById("start-btn");
const submitBtn = document.getElementById("submit-btn");
const displayPara = document.getElementById("text-display");  
const inpPara = document.getElementById("input-area");
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
let toggleColor = true;  // starting will be lightTheme
let actualPara = "";
let inputPara = "";
let totalChar = 0;
let timerId;
let time = 60;

/* getter setter for the localStorage */

function getStats(){
    // Read stats from localStorage, return defaults if missing or corrupted
    try {
        const raw = localStorage.getItem('typingStats');
        if (!raw) {
            return {
                totalTests: 0,
                sumWpm: 0,
                bestWpm: 0,
                practiceTime: 0
            };
        }
        const parsed = JSON.parse(raw);
        // Normalize older shapes
        return {
            totalTests: Number(parsed.totalTests) || 0,
            sumWpm: Number(parsed.sumWpm ?? parsed.totalWpm) || 0,
            bestWpm: Number(parsed.bestWpm) || 0,
            practiceTime: Number(parsed.practiceTime) || 0
        };
    } catch (e) {
        console.error('Failed to read typingStats from localStorage:', e);
        return { totalTests: 0, sumWpm: 0, bestWpm: 0, practiceTime: 0 };
    }
}

function saveStates(stats){
    localStorage.setItem('typingStats', JSON.stringify(stats));
}

function populateStatsUI(stats) {
    const avgEl = document.getElementById('avg-wpm');
    const bestEl = document.getElementById('best-wpm');
    const totalEl = document.getElementById('total-tests');
    const timeEl = document.getElementById('practice-time');

    const avg = stats.totalTests > 0 ? (stats.sumWpm / stats.totalTests) : 0;

    if (avgEl) avgEl.textContent = avg.toFixed(0);
    if (bestEl) bestEl.textContent = stats.bestWpm.toFixed(0);
    if (totalEl) totalEl.textContent = stats.totalTests;
    if (timeEl) timeEl.textContent = stats.practiceTime + ' min';
}

function updateStatsWithResult(wpmCal, sessionSeconds) {
    const stats = getStats();
    stats.totalTests += 1;
    stats.sumWpm += Number(wpmCal) || 0;
    if ((Number(wpmCal) || 0) > stats.bestWpm) stats.bestWpm = Number(wpmCal) || 0;
    // store practice time in minutes (rounded)
    stats.practiceTime += Math.round((sessionSeconds || 0) / 60);
    saveStates(stats);
    return stats;
}
/*  backGround changer */

toggleTheme.addEventListener("click",()=>{
       
      if(!toggleColor){
        // LIGHT THEME
        document.body.style.backgroundColor = "#d6e0f3ff";
        document.body.style.color = "#1f2937";
        container.style.backgroundColor = "#ffffff";
        container.style.color = "#1f2937";
        console.log("Light theme activated");
      }
      else{
            // DARK THEME
            document.body.style.backgroundColor = "#111827";
            document.body.style.color = "#f3f4f6";
            container.style.backgroundColor = "#1f2937";
            container.style.color = "#1f2937";
            console.log("Dark theme activated");
      }
     toggleColor = !toggleColor;
});

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
    
    // Update persistent statistics and refresh UI
    try {
        const stats = updateStatsWithResult(wpmCal, usertimeTaken);
        populateStatsUI(stats);
    } catch (e) {
        console.error('Failed to update stats:', e);
    }
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


window.addEventListener("load", () => {
    // reset display text on load
    inpPara.value = "";
    displayPara.textContent = "Click (Start Test button) to begin the test...";
    const stats = getStats();
    populateStatsUI(stats);
});
