// Importing modules
import { bootAnimation } from "../gsap/loader";

// Array of loading messages to display randomly
const messages = [
  "indexing fragments…",
  "mapping debris field…",
  "rebuilding continuity…",
  "scrubbing noise floor…",
  "splicing memory shards…",
  "resolving parallax…",
  "masking distortion…",
  "aligning vectors…",
  "cooldown: nominal…",
  "finalizing handoff…"
];

// DOM elements for updating the UI
const progressPercentage = document.querySelector('.progress');
const loadingStatus = document.querySelector('.loading-status');

// Configuration settings
const progressInterval = 50;    // Update progress every 50ms
const messageInterval = 1000;   // New message every 1 second
const progressStep = 1;         // Increment progress by 1%
let currentStage = 0;          // Tracks current progress (0-100)

// Updates the progress percentage
function updateProgress(el, step, delay) {
    const progressTimer = setInterval(() => {
        currentStage += step;
        el.innerText = `${currentStage}%`;
        if (currentStage >= 100) {
            clearInterval(progressTimer);
        }
    }, delay);
}

// Displays random loading messages until progress is complete
function updateMessage(el, msg, delay) {
    let currentIndex = Math.floor(Math.random() * msg.length);
    el.innerText = msg[currentIndex];

    const displayMessage = setInterval(() => {
        if (currentStage < 100) {
            currentIndex = Math.floor(Math.random() * msg.length);
            el.innerText = msg[currentIndex];
        } else {
            clearInterval(displayMessage);
        }
    }, delay);
}

// Initializes both the progress bar and message display
export function bootLoader() {
    bootAnimation(() => currentStage);
    updateProgress(progressPercentage, progressStep, progressInterval);
    updateMessage(loadingStatus, messages, messageInterval);
}