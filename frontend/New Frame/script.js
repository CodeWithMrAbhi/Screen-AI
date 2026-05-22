// ==========================================
// 1. CONFIGURATION & DOM ELEMENTS
// ==========================================
const BACKEND_URL = "http://127.0.0.1:8000";

// The Memory Bank: Holds files so they aren't overwritten
let selectedFilesArray = []; 

// Inputs & Buttons
const fileInput = document.getElementById('cv-upload');
const browseBtn = document.getElementById('browse-btn');
const jdTextarea = document.querySelector('.jd-textarea');
const analyzeBtn = document.querySelector('.btn-analyse');
const analyzeBtnText = analyzeBtn.querySelector('span');

// Display Areas
const fileCountLabel = document.getElementById('file-count-label');
const fileListContainer = document.getElementById('file-list-container');
const resultsContainer = document.getElementById('results-container');
const emptyState = document.getElementById('empty-state');


// ==========================================
// 2. INITIALIZATION & EVENT LISTENERS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    checkBackendConnection();
});

// Open file dialog when clicking the upload box
browseBtn.addEventListener('click', () => {
    fileInput.click();
});

// Watch for file selection
fileInput.addEventListener('change', handleFileSelection);

// Watch for the analyze button click
analyzeBtn.addEventListener('click', processResumes);


// ==========================================
// 3. CORE FUNCTIONS
// ==========================================

/**
 * Pings the backend on load to ensure it's running
 */
async function checkBackendConnection() {
    try {
        const response = await fetch(BACKEND_URL + "/");
        const data = await response.json();
        console.log("✅ Backend connected:", data.status);
    } catch {
        console.warn("⚠️ Backend not reachable on " + BACKEND_URL);
    }
}

/**
 * Handles adding new files to our memory array and triggering a UI update
 */
function handleFileSelection() {
    const newFiles = Array.from(fileInput.files);
    
    // Merge new files with existing ones, capping at 10
    selectedFilesArray = [...selectedFilesArray, ...newFiles].slice(0, 10);
    
    // Clear the hidden input so the browser doesn't get "stuck"
    fileInput.value = ""; 
    
    // Update the UI
    renderFileList();
}

/**
 * Removes a file from the memory array when the user clicks 'X'
 */
window.removeFile = function(index) {
    selectedFilesArray.splice(index, 1); // Remove the specific file
    renderFileList(); // Re-paint the UI
};

/**
 * Paints the list of uploaded files onto the screen
 */
function renderFileList() {
    fileCountLabel.textContent = `Uploaded Files (${selectedFilesArray.length}/10)`;
    const colors = ['#3ecf8e','#60a5fa','#f472b6','#a78bfa','#fb923c'];
    
    const html = selectedFilesArray.map((file, i) => {
        const color = colors[i % colors.length];
        const sizeKB = (file.size / 1024).toFixed(0);
        
        return `
        <div class="flex items-center gap-3 p-3 bg-gray-800/40 rounded-lg border-l-4 mb-2" style="border-color: ${color};">
            <div class="w-2 h-2 rounded-full shrink-0" style="background-color: ${color}; box-shadow: 0 0 8px ${color};"></div>
            <span class="text-sm text-gray-300 flex-1 overflow-hidden whitespace-nowrap text-ellipsis">${file.name}</span>
            <span class="text-xs text-gray-500">${sizeKB} KB</span>
            
            <button onclick="removeFile(${i})" class="text-gray-500 hover:text-red-400 font-bold ml-2 transition" title="Remove file">✕</button>
        </div>`;
    }).join('');

    fileListContainer.innerHTML = html;
}

/**
 * Handles sending data to the backend and managing loading states
 */
async function processResumes() {
    // Pull the files directly from our memory array
    const files = selectedFilesArray; 
    const jdText = jdTextarea.value.trim();

    // 1. Validation
    if (files.length === 0) return alert('⚠️ Please upload at least 1 CV PDF!');
    if (files.length > 10) return alert('⚠️ Maximum 10 CVs allowed!');
    if (!jdText) return alert('⚠️ Please enter a job description!');

    // 2. Set UI to "Loading"
    analyzeBtnText.textContent = '⏳ Analysing CVs...';
    analyzeBtn.disabled = true;

    // 3. Prepare data for the backend
    const formData = new FormData();
    for (let file of files) formData.append('cvs', file);
    formData.append('jd', jdText);

    try {
        // Setup a 2-minute timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); 

        // Send Request
        const response = await fetch(BACKEND_URL + "/screen", {
            method: 'POST',
            body: formData,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId); // Clear timeout if request succeeds

        // Handle Backend Errors
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.detail || 'Backend returned an error.');
        }

        // 4. Success! Render the results
        const data = await response.json();
        renderResults(data.results);

        // ✅ THE FIX: Clear the memory and UI so old files aren't sent again
        selectedFilesArray = [];
        fileListContainer.innerHTML = '';
        fileCountLabel.textContent = `Uploaded Files (0/10)`;

    } catch (error) {
        alert('❌ Connection failed or timed out. Make sure your Python backend is running!');
        console.error('API Error:', error);
    } finally {
        // 5. Reset button state regardless of success or failure
        analyzeBtnText.textContent = '✦ Analyse All CVs →';
        analyzeBtn.disabled = false;
    }
}

/**
 * Handles painting the AI results onto the screen
 */
function renderResults(results) {
    if (!results || results.length === 0) return alert('No results returned.');

    // Hide the "Awaiting Data" empty state
    emptyState.style.display = 'none';

    const rankStyles = {
        1: { gradient: 'from-yellow-400 to-yellow-600', text: 'text-yellow-400', shadow: 'shadow-yellow-500/50', hex: '#f5c842' },
        2: { gradient: 'from-gray-300 to-gray-500', text: 'text-gray-300', shadow: 'shadow-gray-400/40', hex: '#c0c0c0' },
        3: { gradient: 'from-orange-400 to-orange-700', text: 'text-orange-500', shadow: 'shadow-orange-500/40', hex: '#cd7f32' }
    };

    // Build HTML for the Candidate Cards
    const cardsHTML = results.map((cv, i) => {
        const rankNum = cv.rank || (i + 1);
        const style = rankStyles[rankNum] || rankStyles[3]; // Default to bronze style for ranks 4+
        const barWidth = Math.min((cv.score / 10) * 100, 100).toFixed(1);
        
        // Build Skill Tags
        const matchedTags = (cv.matched_skills || []).map(s => `<span class="bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-1 rounded-md text-xs">${s}</span>`).join('');
        const missingTags = (cv.missing_skills || []).map(s => `<span class="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-1 rounded-md text-xs">${s}</span>`).join('');

        return `
        <div class="bg-gray-800/60 backdrop-blur-md border border-gray-700 rounded-xl p-5 animate-fade-up" style="animation-delay: ${i * 0.1}s;">
            
            <div class="flex justify-between items-start mb-3">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br ${style.gradient} ${style.shadow} flex items-center justify-center font-bold text-black text-xs shadow-lg shrink-0">
                        #${rankNum}
                    </div>
                    <div>
                        <h3 class="text-base font-bold text-white leading-tight">${cv.name}</h3>
                        <p class="text-xs text-gray-400">${cv.filename}</p>
                    </div>
                </div>
                <div class="text-right shrink-0">
                    <div class="text-2xl font-bold ${style.text} drop-shadow-md">${parseFloat(cv.score).toFixed(1)}</div>
                    <div class="text-xs text-gray-500 -mt-1">/10</div>
                </div>
            </div>
            
            <div class="w-full h-1.5 bg-gray-700 rounded-full mb-4 overflow-hidden">
                <div class="h-full rounded-full transition-all duration-1000 ease-out" style="width: ${barWidth}%; background: linear-gradient(90deg, #7c6af7, ${style.hex}); box-shadow: 0 0 8px ${style.hex};"></div>
            </div>
            
            <p class="text-sm text-gray-300 leading-relaxed mb-4">${cv.reason}</p>
            <div class="flex flex-wrap gap-2">${matchedTags}${missingTags}</div>

        </div>`;
    }).join('');

    // Build HTML for the Bottom Stats
    const topScore = results.length > 0 ? parseFloat(results[0].score).toFixed(1) : '—';
    const strongMatches = results.filter(r => r.score >= 7).length;

    const statsHTML = `
    <div class="grid grid-cols-3 gap-3 mt-4">
        <div class="bg-gray-800/40 border border-gray-700 rounded-xl p-4 text-center">
            <span class="text-xl font-bold text-green-400">${strongMatches}</span>
            <p class="text-[10px] uppercase tracking-wider text-gray-400 mt-1">Strong Matches</p>
        </div>
        <div class="bg-gray-800/40 border border-gray-700 rounded-xl p-4 text-center">
            <span class="text-xl font-bold text-yellow-400">${topScore}</span>
            <p class="text-[10px] uppercase tracking-wider text-gray-400 mt-1">Top Score</p>
        </div>
        <div class="bg-gray-800/40 border border-gray-700 rounded-xl p-4 text-center">
            <span class="text-xl font-bold text-white">${results.length}</span>
            <p class="text-[10px] uppercase tracking-wider text-gray-400 mt-1">CVs Ranked</p>
        </div>
    </div>`;

    // Inject everything into the page
    resultsContainer.innerHTML = cardsHTML + statsHTML;
}