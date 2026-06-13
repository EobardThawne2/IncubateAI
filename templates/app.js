document.addEventListener('DOMContentLoaded', () => {
    // History State
    let history = JSON.parse(localStorage.getItem('mabo_history')) || [];
    const historyList = document.getElementById('history-list');
    // Elements
    const promptInput = document.getElementById('prompt-input');
    const btnGenerate = document.getElementById('btn-generate');
    
    // States
    const stateIdle = document.getElementById('state-idle');
    const stateProcessing = document.getElementById('state-processing');
    const stateSuccess = document.getElementById('state-success');
    
    // Processing UI
    const echoPrompt = document.getElementById('echo-prompt');
    const orchestrationTracker = document.getElementById('orchestration-tracker');
    
    // Success UI
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const researchContent = document.getElementById('research-content');
    const tabCopy = document.getElementById('tab-copy');
    const codeContent = document.getElementById('code-content');
    const previewIframe = document.getElementById('preview-iframe');
    
    // Error Modal
    const errorModal = document.getElementById('error-modal');
    const errorMessage = document.getElementById('error-message');
    const btnReset = document.getElementById('btn-reset');

    let currentPrompt = '';

    // Step definitions for tracker
    const steps = [
        { id: 'step-1', name: 'Orchestrator', desc: 'Parsing intent & delegating missions...' },
        { id: 'step-2', name: 'Researcher', desc: 'Scouting live trends via DuckDuckGo...' },
        { id: 'step-3', name: 'Content Writer', desc: 'Drafting copy assets, naming, and taglines...' },
        { id: 'step-4', name: 'Developer', desc: 'Compiling responsive HTML and Tailwind CSS UI code...' }
    ];

    // Input validation
    promptInput.addEventListener('input', (e) => {
        const val = e.target.value;
        if (val.trim().length >= 15) {
            btnGenerate.removeAttribute('disabled');
        } else {
            btnGenerate.setAttribute('disabled', 'true');
        }
    });

    // Generate Button Click
    btnGenerate.addEventListener('click', async () => {
        currentPrompt = promptInput.value.trim();
        if (currentPrompt.length < 15) return;
        
        transitionTo('processing');
        
        try {
            // Simulate agent steps in UI
            simulateTracker();

            // API Call
            const response = await fetch('/api/generate-business', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ intent: currentPrompt })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'API request failed');
            }

            const data = await response.json();
            
            // Save to history
            saveToHistory({
                id: Date.now().toString(),
                prompt: currentPrompt,
                date: new Date().toLocaleDateString(),
                data: data.data || data
            });
            
            // Render data
            renderSuccessState(data.data || data);
            transitionTo('success');

        } catch (error) {
            console.error("Generation error:", error);
            showError(error.message);
        }
    });

    // Reset Button Click
    btnReset.addEventListener('click', () => {
        errorModal.classList.add('hidden');
        errorModal.classList.remove('flex');
        transitionTo('idle');
    });

    // Tab Switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Reset active
            tabBtns.forEach(b => {
                b.classList.remove('active', 'border-white', 'text-white');
                b.classList.add('border-transparent', 'text-zinc-500');
            });
            tabContents.forEach(c => c.classList.add('hidden'));

            // Set active
            btn.classList.add('active', 'border-white', 'text-white');
            btn.classList.remove('border-transparent', 'text-zinc-500');
            const targetId = `tab-${btn.getAttribute('data-tab')}`;
            document.getElementById(targetId).classList.remove('hidden');
        });
    });

    // Utility: Copy to Clipboard
    window.copyContent = function(elementId) {
        const el = document.getElementById(elementId);
        if(!el) return;
        let text = el.innerText;
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') text = el.value;
        navigator.clipboard.writeText(text);
    };

    window.copyText = function(text) {
        navigator.clipboard.writeText(text);
    };

    // Utility: Download File
    window.downloadContent = function(elementId, filename) {
        const el = document.getElementById(elementId);
        if(!el) return;
        const text = el.innerText;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Viewport Toggle
    window.setViewport = function(type) {
        const container = document.getElementById('iframe-container');
        const btnD = document.getElementById('btn-desktop');
        const btnM = document.getElementById('btn-mobile');
        
        if(type === 'mobile') {
            container.classList.add('max-w-[375px]', 'mx-auto');
            container.classList.remove('max-w-full');
            btnM.classList.add('bg-zinc-800', 'text-white');
            btnM.classList.remove('text-zinc-400');
            btnD.classList.remove('bg-zinc-800', 'text-white');
            btnD.classList.add('text-zinc-400');
        } else {
            container.classList.remove('max-w-[375px]', 'mx-auto');
            container.classList.add('max-w-full');
            btnD.classList.add('bg-zinc-800', 'text-white');
            btnD.classList.remove('text-zinc-400');
            btnM.classList.remove('bg-zinc-800', 'text-white');
            btnM.classList.add('text-zinc-400');
        }
    };

    window.resetToIdle = function() {
        transitionTo('idle');
    };

    // Resizer Logic
    const resizer = document.getElementById('resizer');
    const leftPanel = document.getElementById('split-left');
    let isResizing = false;

    if (resizer && leftPanel) {
        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            document.body.style.cursor = 'col-resize';
            // prevent iframe from eating mouse events during drag
            previewIframe.style.pointerEvents = 'none';
        });

        window.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            const containerWidth = document.getElementById('state-success').offsetWidth;
            // set left panel width in percentage
            const newWidth = (e.clientX / containerWidth) * 100;
            if (newWidth > 20 && newWidth < 80) { // constrain width
                leftPanel.style.width = `${newWidth}%`;
            }
        });

        window.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = 'default';
                previewIframe.style.pointerEvents = 'auto';
            }
        });
    }

    // History Logic
    function saveToHistory(entry) {
        history.unshift(entry);
        if (history.length > 10) history.pop(); // Keep last 10
        localStorage.setItem('mabo_history', JSON.stringify(history));
        renderHistory();
    }

    function renderHistory() {
        if(!historyList) return;
        historyList.innerHTML = '';
        history.forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'w-full text-left p-3 rounded-md hover:bg-zinc-800/50 transition-colors group relative border border-transparent hover:border-zinc-800';
            btn.innerHTML = `
                <div class="text-sm font-medium text-zinc-300 truncate pr-6">${item.prompt}</div>
                <div class="text-xs text-zinc-600 mt-1">${item.date}</div>
            `;
            btn.onclick = () => {
                currentPrompt = item.prompt;
                renderSuccessState(item.data);
                transitionTo('success');
            };
            historyList.appendChild(btn);
        });
    }

    // Initial render
    renderHistory();

    function transitionTo(state) {
        [stateIdle, stateProcessing, stateSuccess].forEach(el => el.classList.add('hidden'));
        if (state === 'idle') stateIdle.classList.remove('hidden');
        if (state === 'processing') {
            stateProcessing.classList.remove('hidden');
            echoPrompt.innerText = `"${currentPrompt.substring(0, 80)}${currentPrompt.length > 80 ? '...' : ''}"`;
            initTracker();
        }
        if (state === 'success') {
            stateSuccess.classList.remove('hidden');
            stateSuccess.classList.add('flex');
        }
    }

    function showError(msg) {
        errorMessage.innerText = msg || "Free API rate limits were exceeded during multi-agent token exchange.";
        errorModal.classList.remove('hidden');
        errorModal.classList.add('flex');
    }

    function initTracker() {
        orchestrationTracker.innerHTML = '';
        steps.forEach((step, i) => {
            const el = document.createElement('div');
            el.className = 'flex items-center gap-4 p-4 rounded-md border border-zinc-800 bg-zinc-900/50 opacity-50';
            el.id = step.id;
            el.innerHTML = `
                <div class="w-6 h-6 rounded-full flex items-center justify-center bg-zinc-800 status-icon">
                    <span class="w-2 h-2 rounded-full bg-zinc-600"></span>
                </div>
                <div class="flex-1">
                    <div class="font-medium text-sm text-zinc-300 name-text">${step.name}</div>
                    <div class="text-xs text-zinc-500 desc-text">Waiting...</div>
                </div>
            `;
            orchestrationTracker.appendChild(el);
        });
    }

    function simulateTracker() {
        // Since we don't have real-time sockets in V1, we simulate the UI progression
        // The API request is pending in the background.
        let currentStepIndex = 0;
        
        const advanceStep = () => {
            if (currentStepIndex >= steps.length) return;
            
            // Mark previous as done
            if (currentStepIndex > 0) {
                const prevEl = document.getElementById(steps[currentStepIndex-1].id);
                prevEl.classList.remove('animate-pulse');
                prevEl.querySelector('.status-icon').innerHTML = `<svg class="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
                prevEl.querySelector('.name-text').classList.replace('text-zinc-300', 'text-zinc-500');
                prevEl.querySelector('.desc-text').innerText = 'Complete';
            }

            // Mark current as active
            if (currentStepIndex < steps.length) {
                const curEl = document.getElementById(steps[currentStepIndex].id);
                curEl.classList.remove('opacity-50', 'bg-zinc-900/50');
                curEl.classList.add('opacity-100', 'bg-zinc-900', 'animate-pulse');
                curEl.querySelector('.status-icon').innerHTML = `<div class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>`;
                curEl.querySelector('.name-text').classList.replace('text-zinc-300', 'text-white');
                curEl.querySelector('.desc-text').classList.replace('text-zinc-500', 'text-blue-400');
                curEl.querySelector('.desc-text').innerText = steps[currentStepIndex].desc;
            }
            
            currentStepIndex++;
            if (currentStepIndex < steps.length) {
                setTimeout(advanceStep, 8000 + Math.random() * 5000); // Simulate processing time
            }
        };

        advanceStep();
    }

    function renderSuccessState(data) {
        if(!data) return;

        // Render Research
        const researchRaw = document.getElementById('research-raw');
        researchRaw.innerText = data.research_markdown || "";
        researchContent.innerHTML = marked.parse(data.research_markdown || "No research data generated.");

        // Render Copy
        tabCopy.innerHTML = '';
        if (data.copy_assets) {
            const assets = [
                { label: 'Brand Name', value: data.copy_assets.title },
                { label: 'Tagline', value: data.copy_assets.tagline },
                { label: 'Welcome Email', value: data.copy_assets.welcome_email }
            ];
            
            assets.forEach(a => {
                tabCopy.innerHTML += `
                    <div class="bg-zinc-800/50 border border-zinc-800 rounded p-4 relative group">
                        <button class="absolute top-2 right-2 p-1.5 rounded bg-zinc-700 hover:bg-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" onclick="copyText(this.nextElementSibling.innerText)" title="Copy">
                            <svg class="w-4 h-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                        </button>
                        <div class="text-xs text-zinc-500 mb-1 font-medium uppercase tracking-wider">${a.label}</div>
                        <div class="text-sm text-white">${a.value || ''}</div>
                    </div>
                `;
            });

            if (data.copy_assets.social_posts && data.copy_assets.social_posts.length > 0) {
                let postsHtml = data.copy_assets.social_posts.map((p, i) => `
                    <div class="text-sm text-white mb-2 pb-2 border-b border-zinc-700/50 last:border-0 last:pb-0 last:mb-0 relative pr-8">
                        ${p}
                        <button class="absolute top-0 right-0 p-1 rounded hover:bg-zinc-600" onclick="copyText('${p.replace(/'/g, "\\'")}')">
                            <svg class="w-3 h-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                        </button>
                    </div>
                `).join('');
                tabCopy.innerHTML += `
                    <div class="bg-zinc-800/50 border border-zinc-800 rounded p-4">
                        <div class="text-xs text-zinc-500 mb-3 font-medium uppercase tracking-wider">Social Posts</div>
                        ${postsHtml}
                    </div>
                `;
            }
        }

        // Render Code
        const htmlContent = data.landing_page_html || "<!-- No HTML generated -->";
        const codeRaw = document.getElementById('code-raw');
        codeRaw.innerText = htmlContent;
        codeContent.textContent = htmlContent;
        
        // Highlight.js
        if(window.hljs) {
            delete codeContent.dataset.highlighted;
            hljs.highlightElement(codeContent);
        }

        // Render Iframe
        previewIframe.srcdoc = htmlContent;
    }
});
