// === Loader Core Logic ===
// Tracks real load progress of the hero's first-paint assets (photo,
// fracture tile, fonts) instead of a fake timer, paired with randomized
// status messages synced to milestone thresholds.

// Importing the GSAP boot animation sequence
import { bootAnimation } from "../gsap/loader";
import photoUrl from "../../../assets/photo-1.jpg";
import fractureUrl from "../../../assets/fracture1.webp";

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
const messageInterval = 100;   // Frequency of milestone checks (ms)
// Floor so a cache-hit load doesn't flash, and paces the simulated climb
// below — real load time can only stretch this longer, never shorter.
const minDisplayTime = 1500;
// Simulated climb caps here so the bar always reads as "loading" even on
// a near-instant load — only crosses this once real assets are confirmed.
const simulatedCeiling = 90;
let currentStage = 0;          // Tracks overall progress (0–100)
let milestoneIndex = 0;        // Tracks which milestone we’re currently on
let lastMessageIndex = -1;     // Prevents repeating the same message twice in a row
let displayMessageTimer = null // Global variable for checking active intervals

// Resolves once an image has either loaded or failed — a failed asset
// shouldn't hang the loader forever.
function loadImage(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = resolve;
        img.src = src;
    });
}

// --- Progress Tracker ---
// Simulated climb to simulatedCeiling for visible motion; the jump to 100
// only fires once the real assets resolve and minDisplayTime has passed.
function trackCriticalAssets(el) {
    const tasks = [
        loadImage(photoUrl),
        loadImage(fractureUrl),
        document.fonts?.ready ?? Promise.resolve(),
    ];

    const climbStart = performance.now();
    const climbTimer = setInterval(() => {
        const elapsed = performance.now() - climbStart;
        const target = Math.min(simulatedCeiling, (elapsed / minDisplayTime) * simulatedCeiling);
        if (target > currentStage) {
            currentStage = target;
            el.innerText = `${Math.round(currentStage)}%`;
        }
    }, 50);

    const realDone = Promise.all(tasks);
    const minDisplay = new Promise((resolve) => setTimeout(resolve, minDisplayTime));

    Promise.all([realDone, minDisplay]).then(() => {
        clearInterval(climbTimer);
        currentStage = 100;
        el.innerText = "100%";
    });
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
    trackCriticalAssets(progressPercentage);
    updateMessage(loadingStatus, messageInterval);
}