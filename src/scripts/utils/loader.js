// === Loader Core Logic ===
// Simulates system boot progress with randomized status messages
// and a percentage counter synced to milestone thresholds.

// Importing the GSAP boot animation sequence
import { bootAnimation } from "../gsap/loader";

// Percentage milestones that trigger new status messages
const milestones = [0, 15, 30, 45, 60, 75, 90];

// Pool of diagnostic-style loading messages displayed during the boot sequence
const messages = [
  "indexing fragments",
  "mapping debris field",
  "rebuilding continuity",
  "scrubbing noise floor",
  "splicing memory shards",
  "resolving parallax",
  "masking distortion",
  "aligning vectors",
  "cooldown: nominal",
  "finalizing handoff"
];

// DOM elements for live UI updates
const progressPercentage = document.querySelector('.progress');
const loadingStatus = document.querySelector('.loading-status');

// Loader configuration
const progressInterval = 50;   // Frequency of progress updates (ms)
const messageInterval = 100;   // Frequency of milestone checks (ms)
const progressStep = 1;        // Increment per tick (%)
let currentStage = 0;          // Tracks overall progress (0–100)
let milestoneIndex = 0;        // Tracks which milestone we’re currently on
let lastMessageIndex = -1;     // Prevents repeating the same message twice in a row
let progressTimer = null;    // Global variable for checking active intervals
let displayMessageTimer = null // Global variable for checking active intervals

// ---- Check if we have active intervals ----
function finishLoading() {
    if (progressTimer) {
        clearInterval(progressTimer);
        progressTimer = null;
    }

    if (displayMessageTimer) {
        clearInterval(displayMessageTimer);
        displayMessageTimer = null;
    }
} 

// --- Progress Counter ---
// Increments the percentage value until full completion.
function updateProgress(el, step, delay) {
    // Check if we have active interval already
    if (progressTimer) {
        clearInterval(progressTimer); // Clear it if we do
        progressTimer = null;
    }

    // Start a new interval
    progressTimer = setInterval(() => {
        // Clamp currentStage between 0 and 100
        currentStage = Math.min(100, Math.max(0, currentStage + step));
        el.innerText = `${currentStage}%`;

        // Stop once loading reaches 100%
        if (currentStage >= 100) {
            finishLoading(); // Clean up all intervals
            // Ensure exact final value for visual consistency
            el.innerText = "100%";
        }
    }, delay);
}

// --- Message Selector ---
// Picks a random message different from the last one shown.
const pickMessage = () => {
    let currentIndex;

    do {
        currentIndex = Math.floor(Math.random() * messages.length);
    } while (currentIndex === lastMessageIndex && messages.length > 1);

    lastMessageIndex = currentIndex;
    return messages[currentIndex];
};

// --- Message Updater ---
// Displays a new message each time a milestone threshold is crossed.
function updateMessage(el, delay) {
    el.innerText = pickMessage();
    // Check if we have active interval already
    if (displayMessageTimer) {
        clearInterval(displayMessageTimer); // Clear it if we do
        displayMessageTimer = null;
    }

     displayMessageTimer = setInterval(() => {
        if (currentStage >= milestones[milestoneIndex]) {
            // If this is the final milestone, display one last message and stop.
            if (milestoneIndex === milestones.length - 1) {
                el.innerText = pickMessage();
                clearInterval(displayMessageTimer);
                displayMessageTimer = null;  
            } else {
                milestoneIndex++;
                el.innerText = pickMessage();
            }
        } 
    }, delay);
}

// --- Boot Sequence Launcher ---
// Initializes the GSAP boot animation and both progress systems.
export function bootLoader() {
    bootAnimation(() => currentStage);
    updateProgress(progressPercentage, progressStep, progressInterval);
    updateMessage(loadingStatus, messageInterval);
}