// --- GLOBAL STATE & TYPE DEFINITIONS (JavaScript Structure) ---

// TypeScript interfaces removed for JavaScript

let state = {
    participants: [],
    displayParticipants: [],
    previousWinners: [], // Array of { name: string, timestamp: string }
    removedWinners: [],
    isSpinning: false,
    isSoundOn: true, 
    isRemoveWinnerEnabled: true, // Default checked
    isCountdownEnabled: false,
    isSingleDisplay: true, // Default checked
    darkMode: true, // Default dark mode
};


// --- LOCAL STORAGE KEYS ---
const PARTICIPANTS_KEY = 'fabtrixParticipants';
const WINNERS_KEY = 'fabtrixWinners';
const REMOVED_WINNERS_KEY = 'fabtrixRemovedWinners';
const SETTINGS_KEY = 'fabtrixSettings';

// --- UTILITY FUNCTIONS ---

/**
 * Loads state from localStorage.
 */
function loadState() {
    const savedWinners = localStorage.getItem(WINNERS_KEY);
    const savedRemoved = localStorage.getItem(REMOVED_WINNERS_KEY);
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    
    if (savedWinners) {
        state.previousWinners = JSON.parse(savedWinners);
    }
    if (savedRemoved) {
        state.removedWinners = JSON.parse(savedRemoved);
    }
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        state.isSoundOn = settings.isSoundOn ?? true;
        state.isRemoveWinnerEnabled = settings.isRemoveWinnerEnabled ?? true;
        state.isCountdownEnabled = settings.isCountdownEnabled ?? false;
        state.isSingleDisplay = settings.isSingleDisplay ?? true;
        state.darkMode = settings.darkMode ?? true;

        // Apply loaded settings to UI toggles
        const soundToggle = document.getElementById('sound-toggle');
        const removeWinnerToggle = document.getElementById('remove-winner-toggle');
        const countdownToggle = document.getElementById('countdown-toggle');
        const displayToggle = document.getElementById('display-toggle');

        if (soundToggle) soundToggle.checked = state.isSoundOn;
        if (removeWinnerToggle) removeWinnerToggle.checked = state.isRemoveWinnerEnabled;
        if (countdownToggle) countdownToggle.checked = state.isCountdownEnabled;
        if (displayToggle) displayToggle.checked = state.isSingleDisplay;
        
        // Apply dark mode immediately
        updateDarkMode(state.darkMode);
    }
    
    renderPreviousWinners();
}

/**
 * Saves relevant state to localStorage.
 */
function saveState() {
    localStorage.setItem(WINNERS_KEY, JSON.stringify(state.previousWinners));
    localStorage.setItem(REMOVED_WINNERS_KEY, JSON.stringify(state.removedWinners));
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
        isSoundOn: state.isSoundOn,
        isRemoveWinnerEnabled: state.isRemoveWinnerEnabled,
        isCountdownEnabled: state.isCountdownEnabled,
        isSingleDisplay: state.isSingleDisplay,
        darkMode: state.darkMode,
    }));
}

/**
 * Updates the array of participants available for the current draw.
 */
function updateDisplayParticipants() {
    if (state.isRemoveWinnerEnabled) {
        // Filter out names that are in the removedWinners list
        state.displayParticipants = state.participants.filter(name => !state.removedWinners.includes(name));
    } else {
        // All uploaded participants are available
        state.displayParticipants = [...state.participants];
    }
    const participantCountElement = document.getElementById('participant-count');
    if (participantCountElement) {
        participantCountElement.textContent = state.displayParticipants.length.toString();
    }
    
    // মডালের বাটন কাউন্ট আপডেট করা
    const modalCountElement = document.getElementById('participant-count-modal');
    if (modalCountElement) {
         modalCountElement.textContent = `(মোট: ${state.displayParticipants.length} জন)`;
    }
    
    renderParticipantList();
}

/**
 * Plays a sound effect if sound is enabled.
 * @param {string} elementId The ID of the audio element.
 */
function playSound(elementId) {
    if (state.isSoundOn) {
        const audio = document.getElementById(elementId);
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.error("Audio play failed:", e));
        }
    }
}

// --- RENDERING & UI FUNCTIONS ---

/**
 * Renders the list of current participants inside the modal.
 */
function renderParticipantList() {
    const listElement = document.getElementById('participant-list');
    
    // ✨ পরিবর্তন: মডাল প্লেসহোল্ডার এবং কাউন্ট এলিমেন্ট ব্যবহার করা হয়েছে
    const placeholder = document.getElementById('list-placeholder-modal'); 
    
    if (!listElement || !placeholder) return;

    if (state.participants.length === 0) {
        listElement.innerHTML = '';
        placeholder.style.display = 'block';
        return;
    }
    
    placeholder.style.display = 'none';

    // শুধুমাত্র মডালের তালিকাটি রেন্ডার করা
    listElement.className = 'grid grid-cols-2 md:grid-cols-3 gap-2';
    listElement.innerHTML = state.displayParticipants
        .map(name => `<span class="bg-fab-primary/10 dark:bg-fab-primary/30 p-2 rounded-lg text-sm truncate hover:bg-fab-primary/20 dark:hover:bg-fab-primary/40 transition">${name}</span>`)
        .join('');

    renderWheelPlaceholder();
}

/**
 * Placeholder for the wheel rendering logic.
 */
function renderWheelPlaceholder() {
    const spinningContent = document.getElementById('spinning-content');
    const segmentCount = state.displayParticipants.length;
    if (spinningContent && segmentCount > 0) {
        const anglePerSegment = 360 / segmentCount;
        
        // Create a simple conic-gradient to represent segments
        let gradientStops = [];
        for (let i = 0; i < segmentCount; i++) {
            const start = i * anglePerSegment;
            const end = (i + 1) * anglePerSegment;
            // Note: Colors are hardcoded here, ideally they should be dynamic based on Tailwind theme
            const color = i % 2 === 0 ? 'var(--tw-colors-fab-accent, #6EE7B7)' : 'var(--tw-colors-fab-primary, #10B981)'; 
            gradientStops.push(`${color} ${start}deg ${end}deg`);
        }
        
        spinningContent.style.backgroundImage = `conic-gradient(from 0deg, ${gradientStops.join(', ')})`;
        spinningContent.innerHTML = `<span class="bg-white/70 dark:bg-gray-900/70 p-4 rounded-full shadow-lg text-center">মোট ${segmentCount} টি সেগমেন্ট</span>`;

    } else if (spinningContent) {
        spinningContent.style.backgroundImage = 'none';
        spinningContent.innerHTML = `<span class="bg-white/70 dark:bg-gray-900/70 p-4 rounded-full shadow-lg">চাকা লোড হবে এখানে</span>`;
    }
}

/**
 * Renders the list of previous winners from localStorage.
 */
function renderPreviousWinners() {
    const listElement = document.getElementById('previous-winners-list');
    const noWinnersMsg = document.getElementById('no-winners-msg');
    if (!listElement || !noWinnersMsg) return;

    if (state.previousWinners.length === 0) {
        listElement.innerHTML = '';
        noWinnersMsg.style.display = 'list-item';
        return;
    }

    noWinnersMsg.style.display = 'none';
    listElement.innerHTML = state.previousWinners.map(winner => `
        <li class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center shadow-sm">
            <span class="text-lg font-semibold text-fab-primary dark:text-fab-accent">${winner.name}</span>
            <span class="text-sm text-gray-500 dark:text-gray-400"> ${winner.timestamp}</span>
        </li>
    `).reverse().join(''); 
}

/**
 * Clears the winner reveal UI.
 */
function clearWinnerReveal() {
    const winnerReveal = document.getElementById('winner-reveal');
    const spinBtn = document.getElementById('spin-btn');
    const drawStateHeader = document.getElementById('draw-state-header');
    
    if (winnerReveal) winnerReveal.classList.add('hidden');
    if (spinBtn) spinBtn.style.display = 'block';
    if (drawStateHeader) drawStateHeader.textContent = 'চাকা ঘোরানোর জন্য প্রস্তুত';
}

/**
 * Handles toggling dark mode.
 * @param {boolean} [enable] Boolean to explicitly set mode.
 */
function updateDarkMode(enable) {
    const isDark = enable !== undefined ? enable : document.documentElement.classList.contains('dark');
    state.darkMode = !isDark;
    
    if (state.darkMode) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    
    saveState();
}


// --- নতুন MODAL/OVERLAY লজিক ---

/**
 * মডাল ওপেন করার ফাংশন
 */
function openParticipantsModal() {
    const modal = document.getElementById('participants-modal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // স্ক্রল লক করার জন্য
        renderParticipantList(); // নিশ্চিত করে যে মডাল খোলার সময় তালিকা আপডেট হয়
    }
}

/**
 * মডাল বন্ধ করার ফাংশন
 */
function closeParticipantsModal() {
    const modal = document.getElementById('participants-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = ''; // স্ক্রল আনলক
    }
}


// --- CORE LOGIC HANDLERS ---

/**
 * Handles the file upload and parsing of participant names (Updated for robustness).
 * @param {Event} event The file change event.
 */
function handleFileUpload(event) {
    const input = event.target;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
        let text = e.target.result;
        
        // --- সমস্ত লাইন ব্রেক (\r\n বা \r) কে \n এ রূপান্তর করা ---
        text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n'); 
        
        // Split by line break, trim whitespace, and filter out empty lines
        const names = text.split('\n')
                      .map(name => name.trim())
                      .filter(name => name.length > 0);
                      
        state.participants = names;
        updateDisplayParticipants(); 
        
        if (state.participants.length > 0) {
            alert(`মোট ${state.participants.length} জন অংশগ্রহণকারী সফলভাবে লোড হয়েছে!`);
            // ✨ পরিবর্তন: ফাইল আপলোডের পর এখন মডাল ওপেন হবে
            openParticipantsModal(); 
        } else {
            alert('ফাইলে কোনো নাম পাওয়া যায়নি।');
        }
    };

    reader.onerror = () => {
        console.error('File reading failed.'); 
        alert('ফাইল লোড করার সময় একটি ত্রুটি হয়েছে।');
    };

    reader.readAsText(file);
}

/**
 * Initiates the raffle draw process (countdown or direct spin).
 */
function startDraw() {
    if (state.isSpinning || state.displayParticipants.length === 0) return;
    
    clearWinnerReveal(); 
    state.isSpinning = true;
    const spinBtn = document.getElementById('spin-btn');
    if (spinBtn) spinBtn.disabled = true;

    const drawStateHeader = document.getElementById('draw-state-header');
    if (drawStateHeader) drawStateHeader.textContent = 'ড্র প্রক্রিয়া চলছে...';
    
    playSound('spin-sound');

    if (state.isCountdownEnabled) {
        startCountdown();
    } else {
        setTimeout(handleSpin, 100);
    }
}

/**
 * Handles the countdown animation and then calls the spin logic.
 */
function startCountdown() {
    const countdownDisplay = document.getElementById('countdown-display');
    if (!countdownDisplay) return;

    countdownDisplay.classList.remove('hidden');
    let count = 10;

    const interval = setInterval(() => {
        if (count < 1) {
            clearInterval(interval);
            countdownDisplay.classList.add('hidden');
            handleSpin();
            return;
        }

        // Use the CSS class for scaling animation
        countdownDisplay.innerHTML = `<div class="animate-countdown-scale">${count}</div>`; 
        playSound('spin-sound'); 
        count--;
    }, 1000);
}

/**
 * Simulates the wheel spin and determines the winner.
 */
function handleSpin() {
    const participants = state.displayParticipants;
    if (participants.length === 0) {
        alert('অংশগ্রহণকারী কেউ অবশিষ্ট নেই।');
        state.isSpinning = false;
        const spinBtn = document.getElementById('spin-btn');
        if (spinBtn) spinBtn.disabled = false;
        const drawStateHeader = document.getElementById('draw-state-header');
        if (drawStateHeader) drawStateHeader.textContent = 'চাকা ঘোরানোর জন্য প্রস্তুত';
        return;
    }

    // 1. Randomly select the winner
    const winnerIndex = Math.floor(Math.random() * participants.length);
    const winnerName = participants[winnerIndex];
    
    // 2. Calculate the rotation required for the winner
    const segmentCount = participants.length;
    const anglePerSegment = 360 / segmentCount;
    // (360 * 5) ensures at least 5 full rotations, plus the winner segment, plus half the segment to center the pointer.
    const targetRotation = (360 * 5) + (anglePerSegment * winnerIndex) + (anglePerSegment / 2);

    const spinningContent = document.getElementById('spinning-content');
    if (spinningContent) {
        // Apply the CSS rotation to start the spin animation
        spinningContent.style.transform = `rotate(${targetRotation}deg)`;
    }

    // 3. Wait for the spin animation to finish 
    setTimeout(() => {
        revealWinner(winnerName);
    }, 4500); // Wait for 4.5 seconds (4000ms transition + buffer)
}

/**
 * Generates a random name from the display list or a default message.
 * @param {string[]} participantList The list of names to scramble from.
 * @returns {string} A randomly selected name.
 */
function getRandomScrambleName(participantList) {
    if (participantList.length === 0) return "ফলাফল আসছে...";
    const randomIndex = Math.floor(Math.random() * participantList.length);
    return participantList[randomIndex];
}

/**
 * Displays the winner and updates history/state.
 * @param {string} winnerName The name of the winner.
 */
function revealWinner(winnerName) {
    playSound('win-sound');
    
    // 1. Update UI and Scramble Animation Logic
    const winnerReveal = document.getElementById('winner-reveal');
    const winnerNameElement = document.getElementById('winner-name');
    const spinBtn = document.getElementById('spin-btn');
    const drawStateHeader = document.getElementById('draw-state-header');
    
    if (winnerReveal && winnerNameElement && spinBtn) {
        // শুরুতে বিজয়ীর নাম লুকিয়ে ফেলুন
        winnerNameElement.textContent = "ফল প্রকাশ চলছে..."; 
        winnerReveal.classList.remove('hidden');
        spinBtn.style.display = 'none';

        // Reset the spinning content's transition property
        const spinningContent = document.getElementById('spinning-content');
        if (spinningContent) {
            // এই লাইনটি ট্রানজিশন শেষে চাকাটিকে আবার রিসেট করে দেয় (অপশনাল)
            // spinningContent.style.transform = ''; 
        }
    }

    // স্ক্র্যাম্বলিং ইন্টারভ্যাল (নাম কত দ্রুত পরিবর্তন হবে)
    const initialScrambleIntervalTime = 100; // 100 মিলিসেকেন্ড
    // স্ক্র্যাম্বলিং এর মোট সময় (স্পিন শেষ হওয়ার পর)
    const scrambleDuration = 3000; // 3 সেকেন্ড ধরে স্ক্র্যাম্বল হবে 
    let startTime = Date.now();

    const scrambleInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        
        if (elapsedTime < scrambleDuration) {
            // অ্যানিমেশন চলাকালীন র‍্যান্ডম নাম দেখান
            const scrambledName = getRandomScrambleName(state.displayParticipants);
            if (winnerNameElement) winnerNameElement.textContent = scrambledName;

        } else {
            // স্ক্র্যাম্বলিং সময় শেষ: বিজয়ীর নাম দেখান
            clearInterval(scrambleInterval);
            if (winnerNameElement) winnerNameElement.textContent = winnerName;
            
            // পোস্ট-স্ক্র্যাম্বল লজিক
            if (drawStateHeader) drawStateHeader.textContent = `বিজয়ী: ${winnerName}`;
            state.isSpinning = false;
            if (spinBtn) spinBtn.disabled = false;
            
            // 2. Update Previous Winners History
            const now = new Date();
            const bangladeshTime = now.toLocaleTimeString('bn-BD', {
                timeZone: 'Asia/Dhaka',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            
            const newWinner = { name: winnerName, timestamp: bangladeshTime };
            state.previousWinners.push(newWinner);
            
            // 3. Handle 'Remove Winner' rule
            if (state.isRemoveWinnerEnabled) {
                state.removedWinners.push(winnerName);
                updateDisplayParticipants(); 
            }
            
            saveState();
            renderPreviousWinners();
            
            // 4. Confetti Animation (Placeholder)
        }
    }, initialScrambleIntervalTime);
}


// --- ADMIN & RESET HANDLERS ---

/**
 * Resets the current draw, keeping all uploaded names but restoring removed winners.
 */
function resetDraw() {
    if (!confirm('আপনি কি নিশ্চিত যে ড্র পুনরায় শুরু করতে চান? এটি এই রাউন্ডের বিজয়ীদের তালিকায় কোনো পরিবর্তন আনবে না, তবে এই রাউন্ডের জন্য সরিয়ে রাখা নামগুলো আবার ফিরিয়ে আনবে।')) return;
    
    state.removedWinners = [];
    localStorage.removeItem(REMOVED_WINNERS_KEY);
    updateDisplayParticipants();
    clearWinnerReveal();
    alert('ড্র সফলভাবে পুনরায় শুরু হয়েছে।');
}

/**
 * Clears the entire winners history from localStorage.
 */
function clearWinnersHistory() {
    if (!confirm('আপনি কি নিশ্চিত যে আপনি বিজয়ীদের সম্পূর্ণ ইতিহাস মুছে ফেলতে চান? এই কাজটি আর ফেরানো যাবে না।')) return;
    
    state.previousWinners = [];
    state.removedWinners = []; 
    localStorage.removeItem(WINNERS_KEY);
    localStorage.removeItem(REMOVED_WINNERS_KEY);
    
    // Re-render
    updateDisplayParticipants();
    renderPreviousWinners();
    clearWinnerReveal();
    alert('বিজয়ীদের ইতিহাস সফলভাবে মুছে ফেলা হয়েছে।');
}


// --- Initialization & Event Listeners ---

document.addEventListener('DOMContentLoaded', () => {
    
    loadState(); // ১. পূর্ববর্তী বিজয়ীদের তালিকা অটো লোড করা

    // FILE UPLOAD LISTENER
    const fileUpload = document.getElementById('file-upload');
    if (fileUpload) fileUpload.addEventListener('change', handleFileUpload); 

    // RULE & OPTION LISTENERS 
    const removeWinnerToggle = document.getElementById('remove-winner-toggle');
    if (removeWinnerToggle) removeWinnerToggle.addEventListener('change', (e) => {
        state.isRemoveWinnerEnabled = e.target.checked;
        updateDisplayParticipants(); 
        saveState();
    });
    
    const displayToggle = document.getElementById('display-toggle');
    if (displayToggle) displayToggle.addEventListener('change', (e) => {
        state.isSingleDisplay = e.target.checked;
        // রেন্ডারিং এখন মডাল খোলার সময় হবে, তাই এখানে শুধু সেটিং সেভ হবে।
        saveState();
    });

    const countdownToggle = document.getElementById('countdown-toggle');
    if (countdownToggle) countdownToggle.addEventListener('change', (e) => {
        state.isCountdownEnabled = e.target.checked;
        saveState();
    });

    const soundToggle = document.getElementById('sound-toggle');
    if (soundToggle) soundToggle.addEventListener('change', (e) => {
        state.isSoundOn = e.target.checked;
        saveState();
    });

    // DRAW BUTTON LISTENERS
    const spinBtn = document.getElementById('spin-btn');
    if (spinBtn) spinBtn.addEventListener('click', startDraw);
    
    const resetWheelBtn = document.getElementById('reset-wheel-btn');
    if (resetWheelBtn) resetWheelBtn.addEventListener('click', clearWinnerReveal); 

    // ADMIN CONTROLS LISTENERS
    const resetDrawBtn = document.getElementById('reset-draw-btn');
    if (resetDrawBtn) resetDrawBtn.addEventListener('click', resetDraw);

    const clearWinnersBtn = document.getElementById('clear-winners-btn');
    if (clearWinnersBtn) clearWinnersBtn.addEventListener('click', clearWinnersHistory);
    
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) darkModeToggle.addEventListener('click', () => updateDarkMode());

    // ✨ পরিবর্তন: PARTICIPANT MODAL LISTENERS
    const showParticipantsBtn = document.getElementById('show-participants-btn');
    const closeModalBtn = document.getElementById('close-modal-btn'); // X বাটন
    const closeModalFooterBtn = document.getElementById('close-modal-footer-btn'); // বন্ধ করুন বাটন
    const modal = document.getElementById('participants-modal');

    if (showParticipantsBtn) {
        showParticipantsBtn.addEventListener('click', openParticipantsModal);
    }
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeParticipantsModal);
    if (closeModalFooterBtn) closeModalFooterBtn.addEventListener('click', closeParticipantsModal);
    
    // ESC চাপলে মডাল বন্ধ করা
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
            closeParticipantsModal();
        }
    });

    // মডালের বাইরে ক্লিক করলে বন্ধ করা (ব্যাকড্রপ ক্লিক)
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeParticipantsModal();
            }
        });
    }

    // Initial render
    updateDisplayParticipants();
});