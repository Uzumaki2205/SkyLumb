let currentLang = 'vi';
let history = [];
let uploadedImageUrl = null;
let lastResult = null;

const backgroundImages = [
    { id: 'bg1', path: 'images/bg1.png' },
    { id: 'bg2', path: 'images/bg2.png' },
    { id: 'bg3', path: 'images/bg3.png' },
    { id: 'bg4', path: 'images/bg4.png' },
    { id: 'bg5', path: 'images/bg5.png' },
    { id: 'bg6', path: 'images/bg6.png' },
    { id: 'bg7', path: 'images/bg7.png' },
    { id: 'bg8', path: 'images/bg8.png' }
];

const backgroundGradients = [
    { id: 'daylight', colors: ['#a1c4fd', '#c2e9fb'] },
    { id: 'dawn', colors: ['#f6d365', '#fda085'] },
    { id: 'valley', colors: ['#f093fb', '#f5576c'] },
    { id: 'night', colors: ['#2c3e50', '#1a293f'] },
];

function renderChangelog() {
    const listContainer = document.getElementById('changelog-list');
    if (!listContainer || typeof versionData === 'undefined') return;

    listContainer.innerHTML = versionData.map(item => {
        const contentList = item.changes[currentLang] || item.changes['en'] || item.changes['zh-Hant'];
        const listHtml = contentList.map(text => `<li>${text}</li>`).join('');

        return `
            <div class="version-item">
                <div class="version-header">
                    <span class="version-tag">${item.ver}</span>
                    <span class="version-date">${item.date}</span>
                </div>
                <ul class="version-content">
                    ${listHtml}
                </ul>
            </div>
        `;
    }).join('');
}

function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-lang-key]').forEach(el => {
        const key = el.getAttribute('data-lang-key');
        if (translations[lang] && translations[lang][key] !== undefined) {
            const translation = translations[lang][key];
            if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
                el.placeholder = translation;
            } else if (key.startsWith('inst_') || key.startsWith('faq_') || 
                       key === 'status_error_general' || key === 'sim_desc' || 
                       key === 'sim_disclaimer_text' || key === 'measurement_notice_body') {
                el.innerHTML = translation;
            } else {
                el.textContent = translation;
            }
        }
    });
    document.querySelectorAll('.lang-option').forEach(span => {
        span.classList.toggle('active', span.dataset.lang === lang);
    });
    renderChangelog();
}

function t(key) {
    return (translations[currentLang] && translations[currentLang][key]) || 
           (translations['en'] && translations['en'][key]) || 
           key;
}

function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        element.textContent = (progress * (end - start) + start).toFixed(4);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// ══════════════════════════════════════════════════
// BACKGROUND SYNC (APP WALLPAPER + CARD PREVIEW)
// ══════════════════════════════════════════════════
function applyPageBackground(type, source) {
    if (type === 'image' || type === 'uploaded') {
        document.body.style.background = `url("${source}") center / cover no-repeat fixed`;
        localStorage.setItem('skyThemeBgImage', JSON.stringify({ type, source }));
    }
}

function loadSavedPageBackground() {
    // Clear legacy gradient background setting if any existed
    const legacy = localStorage.getItem('skyThemeBg');
    if (legacy) {
        try {
            const d = JSON.parse(legacy);
            if (d.type === 'image' || d.type === 'uploaded') {
                localStorage.setItem('skyThemeBgImage', JSON.stringify({ type: d.type, source: d.source }));
            }
        } catch(e) {}
        localStorage.removeItem('skyThemeBg');
    }

    const saved = localStorage.getItem('skyThemeBgImage');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            applyPageBackground(data.type, data.source);
            return data;
        } catch (e) {
            console.error('Failed to parse saved background', e);
        }
    } else {
        document.body.style.background = `url("images/bg.jpg") center / cover no-repeat fixed`;
    }
    return null;
}

document.addEventListener('DOMContentLoaded', () => {
    const dom = {
        calculateBtn: document.getElementById('calculate-btn'),
        b64Input: document.getElementById('b64-input'),
        resCurrent: document.getElementById('res-current'),
        resTallest: document.getElementById('res-tallest'),
        resShortest: document.getElementById('res-shortest'),
        resJson: document.getElementById('res-json'),
        statusEl: document.getElementById('status'),
        copyBtn: document.getElementById('copy-btn'),
        imageBtn: document.getElementById('image-btn'),
        resultActions: document.getElementById('result-actions'),
        langSwitcherHeader: document.getElementById('lang-switcher-header'),
        langMenuHeader: document.getElementById('lang-menu-header'),
        themeSwitcher: document.getElementById('theme-switcher'),
        themeIconLight: document.getElementById('theme-icon-light'),
        themeIconDark: document.getElementById('theme-icon-dark'),
        historyList: document.getElementById('history-list'),
        historyBadge: document.getElementById('history-badge'),
        historyEmptyMessage: document.getElementById('history-empty-message'),
        clearHistoryBtn: document.getElementById('clear-history-btn'),
        docHtml: document.documentElement,
        bgSelector: document.getElementById('bg-selector'),
        gradientSelector: document.getElementById('gradient-selector'),
        textColorSelector: document.getElementById('text-color-selector'),
        playerNameInput: document.getElementById('player-name'),
        customizationOptions: document.querySelector('.customization-options'),
        uploadBgInput: document.getElementById('upload-bg'),
        uploadedImagePreview: document.getElementById('uploaded-image-preview'),
        previewCanvas: document.getElementById('preview-canvas'),
        textAlignSelector: document.getElementById('text-align-selector'),
        showRangeToggle: document.getElementById('show-range-toggle'),
        qrUploadArea: document.getElementById('qr-upload-area'),
        qrUploadBtn: document.getElementById('qr-upload-btn'),
        qrCameraBtn: document.getElementById('qr-camera-btn'),
        qrFileInput: document.getElementById('qr-file-input'),
        qrCameraInput: document.getElementById('qr-camera-input'),
        qrCanvas: document.getElementById('qr-canvas'),
        cameraModal: document.getElementById('camera-modal'),
        cameraVideo: document.getElementById('camera-video'),
        closeCameraBtn: document.getElementById('close-camera-btn'),
        stopCameraBtn: document.getElementById('stop-camera-btn'),
        switchCameraBtn: document.getElementById('switch-camera-btn'),
        changelogBtn: document.getElementById('changelog-btn'),
        changelogModal: document.getElementById('changelog-modal'),
        closeModalBtn: document.getElementById('close-modal-btn'),
        bottomNav: document.querySelector('.bottom-nav')
    };

    // ── Tab Navigation ──
    function switchTab(tabName) {
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `panel-${tabName}`);
        });
        document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (dom.bottomNav) {
        dom.bottomNav.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem && navItem.dataset.tab) {
                switchTab(navItem.dataset.tab);
            }
        });
    }

    // ── Changelog Modal ──
    function openChangelogModal() {
        if (dom.changelogModal) {
            dom.changelogModal.style.display = 'flex';
            renderChangelog();
            setTimeout(() => {
                dom.changelogModal.classList.add('open');
            }, 10);
        }
    }

    function closeChangelogModal() {
        if (dom.changelogModal) {
            dom.changelogModal.classList.remove('open');
            setTimeout(() => {
                dom.changelogModal.style.display = 'none';
            }, 250);
        }
    }

    if (dom.changelogBtn) {
        dom.changelogBtn.addEventListener('click', openChangelogModal);
    }
    if (dom.closeModalBtn) {
        dom.closeModalBtn.addEventListener('click', closeChangelogModal);
    }
    if (dom.changelogModal) {
        dom.changelogModal.addEventListener('click', (e) => {
            if (e.target === dom.changelogModal) {
                closeChangelogModal();
            }
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (dom.changelogModal && dom.changelogModal.classList.contains('open')) {
                closeChangelogModal();
            }
            if (dom.cameraModal && dom.cameraModal.classList.contains('open')) {
                stopCamera();
            }
        }
    });

    // ── History Management ──
    function saveHistory() {
        localStorage.setItem('skyHeightHistory', JSON.stringify(history));
    }

    function loadHistory() {
        const savedHistory = localStorage.getItem('skyHeightHistory');
        history = savedHistory ? JSON.parse(savedHistory) : [];
        renderHistory();
    }

    function renderHistory() {
        if (!dom.historyList) return;
        dom.historyList.innerHTML = '';

        if (history.length === 0) {
            if (dom.historyBadge) dom.historyBadge.style.display = 'none';
            if (dom.historyEmptyMessage) dom.historyEmptyMessage.style.display = 'block';
            return;
        }

        if (dom.historyBadge) {
            dom.historyBadge.textContent = history.length;
            dom.historyBadge.style.display = 'flex';
        }
        if (dom.historyEmptyMessage) dom.historyEmptyMessage.style.display = 'none';

        history.forEach((item, index) => {
            const currentHeightDisplay = item.current ? item.current.toFixed(4) : 'N/A';
            const li = document.createElement('li');
            const date = new Date(item.timestamp).toLocaleString();
            li.innerHTML = `
                <button class="delete-history-item" data-index="${index}" title="${t('confirm_delete_item')}">×</button>
                <div class="history-item-main">
                    <span class="history-value">${t('history_current_label')}: ${currentHeightDisplay}</span>
                    <span class="timestamp">${date}</span>
                </div>
                <button class="history-note" data-index="${index}">${item.note || t('history_note_placeholder')}</button>
            `;
            dom.historyList.appendChild(li);
        });
    }

    // ── Theme Management ──
    function applyTheme(theme) {
        dom.docHtml.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        dom.themeIconLight.style.display = theme === 'dark' ? 'none' : 'block';
        dom.themeIconDark.style.display = theme === 'dark' ? 'block' : 'none';
    }

    // ── Background Selector Population ──
    function populateBgSelectors() {
        const savedBg = loadSavedPageBackground();
        let matchedActive = false;

        dom.bgSelector.innerHTML = '';
        backgroundImages.forEach((img, index) => {
            const imgEl = document.createElement('button');
            imgEl.type = 'button';
            imgEl.style.backgroundImage = `url("${img.path}")`;
            imgEl.classList.add('selectable-option', 'bg-selection');
            imgEl.dataset.type = 'image';
            imgEl.dataset.source = img.path;

            if (savedBg && savedBg.type === 'image' && savedBg.source === img.path) {
                imgEl.classList.add('active');
                matchedActive = true;
            } else if (!savedBg && index === 0) {
                imgEl.classList.add('active');
                matchedActive = true;
            }
            dom.bgSelector.appendChild(imgEl);
        });

        dom.gradientSelector.innerHTML = '';
        backgroundGradients.forEach((grad) => {
            const gradEl = document.createElement('button');
            gradEl.type = 'button';
            gradEl.classList.add('selectable-option', 'bg-selection', 'gradient-option');
            gradEl.style.background = `linear-gradient(to bottom right, ${grad.colors[0]}, ${grad.colors[1]})`;
            gradEl.dataset.type = 'gradient';
            gradEl.dataset.colors = grad.colors.join(',');

            if (savedBg && savedBg.type === 'gradient' && savedBg.colors === grad.colors.join(',')) {
                gradEl.classList.add('active');
                matchedActive = true;
            }
            dom.gradientSelector.appendChild(gradEl);
        });

        if (savedBg && savedBg.type === 'uploaded' && savedBg.source) {
            uploadedImageUrl = savedBg.source;
            dom.uploadedImagePreview.innerHTML = '';
            const previewBtn = document.createElement('button');
            previewBtn.type = 'button';
            previewBtn.classList.add('selectable-option', 'bg-selection', 'active');
            previewBtn.dataset.type = 'uploaded';
            previewBtn.dataset.source = uploadedImageUrl;
            previewBtn.style.backgroundImage = `url("${uploadedImageUrl}")`;
            dom.uploadedImagePreview.appendChild(previewBtn);
            document.querySelectorAll('.bg-selection').forEach(el => {
                if (el !== previewBtn) el.classList.remove('active');
            });
        } else if (!matchedActive) {
            const firstOption = dom.bgSelector.querySelector('.bg-selection');
            if (firstOption) firstOption.classList.add('active');
        }
    }

    // ── Canvas Preview & Export Content ──
    const drawCanvasContent = (ctx, canvas) => {
        const isSample = !lastResult;
        const currentVal = lastResult ? lastResult.current.toFixed(4) : "0.0000";
        const tallestVal = lastResult ? lastResult.tallest.toFixed(4) : "2.0000";
        const shortestVal = lastResult ? lastResult.shortest.toFixed(4) : "-2.0000";

        const playerName = dom.playerNameInput.value.trim() || (isSample ? `(${t('preview_sample')})` : "");
        const activeTextColor = document.querySelector('.text-color-option.active');
        const textColor = activeTextColor ? activeTextColor.dataset.color : 'white';
        const activeTextAlign = document.querySelector('.text-align-option.active');
        const textAlign = activeTextAlign ? activeTextAlign.dataset.align : 'center';

        ctx.fillStyle = textColor === 'white' ? '#FFFFFF' : '#1A202C';
        ctx.textAlign = textAlign;
        ctx.textBaseline = 'top';
        ctx.shadowColor = textColor === 'white' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)';
        ctx.shadowBlur = 6;

        let x;
        if (textAlign === 'left') x = 30;
        else if (textAlign === 'right') x = canvas.width - 30;
        else x = canvas.width / 2;

        const baseFont = '"Noto Sans TC", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

        if (playerName) {
            ctx.font = `600 20px ${baseFont}`;
            ctx.fillText(playerName, x, 22);
        }

        ctx.font = `bold 28px ${baseFont}`;
        ctx.fillText(t('res_current'), x, playerName ? 58 : 46);

        ctx.font = `bold 66px "Courier New", Courier, monospace`;
        ctx.fillText(currentVal, x, 94);

        if (dom.showRangeToggle.checked) {
            ctx.font = `600 17px ${baseFont}`;
            const rangeText = `${t('res_tallest')} ${tallestVal}  |  ${t('res_shortest')} ${shortestVal}`;
            ctx.fillText(rangeText, x, 178);
        }

        ctx.font = `500 12px ${baseFont}`;
        ctx.globalAlpha = 0.85;
        ctx.textAlign = 'center';
        ctx.fillText('Generated by Sky Height Tool', canvas.width / 2, 222);
        ctx.globalAlpha = 1.0;
    };

    // ── Safe Image Loader for Canvas (Handles local file:// and data URLs) ──
    const updatePreview = () => {
        if (!dom.previewCanvas) return;
        const ctx = dom.previewCanvas.getContext('2d');
        const activeBg = document.querySelector('.bg-selection.active');

        ctx.clearRect(0, 0, dom.previewCanvas.width, dom.previewCanvas.height);
        if (!activeBg) {
            drawCanvasContent(ctx, dom.previewCanvas);
            return;
        }

        if (activeBg.dataset.type === 'image' || activeBg.dataset.type === 'uploaded') {
            const bgImage = new Image();
            // Only set crossOrigin if loading from remote http/https
            if (activeBg.dataset.source.startsWith('http://') || activeBg.dataset.source.startsWith('https://')) {
                bgImage.crossOrigin = "Anonymous";
            }
            bgImage.onload = () => {
                ctx.drawImage(bgImage, 0, 0, dom.previewCanvas.width, dom.previewCanvas.height);
                ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
                ctx.fillRect(0, 0, dom.previewCanvas.width, dom.previewCanvas.height);
                drawCanvasContent(ctx, dom.previewCanvas);
            };
            bgImage.onerror = () => {
                ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--details-bg');
                ctx.fillRect(0, 0, dom.previewCanvas.width, dom.previewCanvas.height);
                drawCanvasContent(ctx, dom.previewCanvas);
            };
            bgImage.src = activeBg.dataset.source;
        } else {
            const colors = activeBg.dataset.colors.split(',');
            const gradient = ctx.createLinearGradient(0, 0, dom.previewCanvas.width, dom.previewCanvas.height);
            gradient.addColorStop(0, colors[0]);
            gradient.addColorStop(1, colors[1]);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, dom.previewCanvas.width, dom.previewCanvas.height);
            drawCanvasContent(ctx, dom.previewCanvas);
        }
    };

    // ── History Click Events ──
    if (dom.historyList) {
        dom.historyList.addEventListener('click', (e) => {
            if (e.target && e.target.classList.contains('history-note')) {
                const index = e.target.dataset.index;
                const currentNote = history[index].note || "";
                const newNote = prompt(t('history_note_placeholder'), currentNote);
                if (newNote !== null) {
                    history[index].note = newNote.trim();
                    saveHistory();
                    renderHistory();
                }
            }
            if (e.target && e.target.classList.contains('delete-history-item')) {
                const index = parseInt(e.target.dataset.index, 10);
                history.splice(index, 1);
                saveHistory();
                renderHistory();
                dom.statusEl.innerHTML = t('item_deleted');
            }
        });
    }

    if (dom.clearHistoryBtn) {
        dom.clearHistoryBtn.addEventListener('click', () => {
            if (history.length === 0) return;
            history = [];
            saveHistory();
            renderHistory();
        });
    }

    // ── Theme Switcher ──
    dom.themeSwitcher.addEventListener('click', () => {
        applyTheme(dom.docHtml.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
        updatePreview();
    });

    // ── Language Switcher (Header) ──
    dom.langSwitcherHeader.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = dom.langMenuHeader.style.display === 'none';
        dom.langMenuHeader.style.display = isHidden ? 'block' : 'none';
    });

    dom.langMenuHeader.addEventListener('click', (e) => {
        const langToggle = e.target.closest('.lang-option');
        if (langToggle) {
            setLanguage(langToggle.dataset.lang);
            renderHistory();
            updatePreview();
            dom.langMenuHeader.style.display = 'none';
        }
    });

    document.addEventListener('click', (e) => {
        if (!dom.langMenuHeader.contains(e.target) && !dom.langSwitcherHeader.contains(e.target)) {
            dom.langMenuHeader.style.display = 'none';
        }
    });

    // ── Customization Controls (Syncs both App Wallpaper and Card Preview) ──
    dom.customizationOptions.addEventListener('click', (e) => {
        const target = e.target.closest('.selectable-option');
        if (target) {
            const parent = target.parentElement;
            if (parent.classList.contains('image-selector') || parent.id === 'gradient-selector') {
                document.querySelectorAll('.bg-selection').forEach(btn => btn.classList.remove('active'));
                target.classList.add('active');

                // Image backgrounds sync with webpage wallpaper; Gradients ONLY apply to card preview
                if (target.dataset.type === 'image' || target.dataset.type === 'uploaded') {
                    applyPageBackground(target.dataset.type, target.dataset.source);
                } else if (target.dataset.type === 'gradient') {
                    // Ensure the outside page background stays on the selected/default image
                    const savedImg = localStorage.getItem('skyThemeBgImage');
                    if (savedImg) {
                        try {
                            const d = JSON.parse(savedImg);
                            document.body.style.background = `url("${d.source}") center / cover no-repeat fixed`;
                        } catch (e) {}
                    } else {
                        document.body.style.background = `url("images/bg.jpg") center / cover no-repeat fixed`;
                    }
                }
            } else if (parent.id === 'text-color-selector' || parent.id === 'text-align-selector') {
                parent.querySelectorAll('.selectable-option').forEach(btn => btn.classList.remove('active'));
                target.classList.add('active');
            }
            updatePreview();
        }
    });

    // ── Upload Custom Background ──
    dom.uploadBgInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                uploadedImageUrl = event.target.result;
                dom.uploadedImagePreview.innerHTML = '';
                const previewBtn = document.createElement('button');
                previewBtn.type = 'button';
                previewBtn.classList.add('selectable-option', 'bg-selection', 'active');
                previewBtn.dataset.type = 'uploaded';
                previewBtn.dataset.source = uploadedImageUrl;
                previewBtn.style.backgroundImage = `url("${uploadedImageUrl}")`;
                dom.uploadedImagePreview.appendChild(previewBtn);
                document.querySelectorAll('.bg-selection').forEach(el => {
                    if (el !== previewBtn) el.classList.remove('active');
                });

                // Apply uploaded background to website as well
                applyPageBackground('uploaded', uploadedImageUrl);
                updatePreview();
            };
            reader.readAsDataURL(file);
        }
    });

    dom.playerNameInput.addEventListener('input', updatePreview);
    dom.showRangeToggle.addEventListener('change', updatePreview);

    // ── Height Calculation ──
    dom.calculateBtn.addEventListener('click', () => {
        dom.resCurrent.textContent = '...'; 
        dom.resTallest.textContent = '...'; 
        dom.resShortest.textContent = '...';
        if (dom.resJson) dom.resJson.textContent = '';
        dom.resultActions.style.display = 'none';
        lastResult = null;
        dom.statusEl.innerHTML = t('status_calculating'); 
        dom.statusEl.className = '';
        
        const rawData = dom.b64Input.value.trim();
        if (!rawData) {
            dom.statusEl.innerHTML = t('status_error_empty'); 
            dom.statusEl.className = 'status-error';
            return;
        }

        const results = decodeAndCalculate(rawData);

        if (results.error) {
            dom.statusEl.innerHTML = t(results.error); 
            dom.statusEl.className = 'status-error';
        } else {
            lastResult = results;
            animateValue(dom.resCurrent, parseFloat(dom.resCurrent.textContent) || 0, results.current, 500);
            animateValue(dom.resTallest, parseFloat(dom.resTallest.textContent) || 0, results.tallest, 500);
            animateValue(dom.resShortest, parseFloat(dom.resShortest.textContent) || 0, results.shortest, 500);

            if (dom.resJson && results.json) {
                if (typeof versionData !== 'undefined' && versionData.length > 0) {
                    results.json.tool_version = versionData[0].ver;
                }
                dom.resJson.textContent = JSON.stringify(results.json, null, 2);
            }

            dom.statusEl.innerHTML = t('status_success'); 
            dom.statusEl.className = 'status-success';
            dom.resultActions.style.display = 'block';

            // Deduplicate: If same calculation exists, update timestamp and move to top
            const existingIndex = history.findIndex(item => {
                if (item.json && results.json && item.json.height_raw !== undefined && results.json.height_raw !== undefined) {
                    return item.json.height_raw === results.json.height_raw && item.json.scale_raw === results.json.scale_raw;
                }
                return Math.abs(item.current - results.current) < 0.0001;
            });

            if (existingIndex !== -1) {
                if (history[existingIndex].note) {
                    results.note = history[existingIndex].note;
                }
                history.splice(existingIndex, 1);
            }

            results.timestamp = new Date().getTime();
            history.unshift(results);
            if (history.length > 20) history.pop();
            saveHistory();
            renderHistory();
            setTimeout(updatePreview, 100);
        }
    });

    dom.b64Input.addEventListener('paste', () => {
        setTimeout(() => { dom.calculateBtn.click(); }, 50);
    });

    // ── Copy Result ──
    dom.copyBtn.addEventListener('click', () => {
        if (!lastResult) {
            dom.statusEl.innerHTML = t('status_copy_empty');
            dom.statusEl.className = 'status-error';
            return;
        }
        const copyText = `${t('res_current')} ${lastResult.current.toFixed(4)}\n${t('res_tallest')} ${lastResult.tallest.toFixed(4)}\n${t('res_shortest')} ${lastResult.shortest.toFixed(4)}`;
        navigator.clipboard.writeText(copyText).then(() => {
            dom.statusEl.innerHTML = t('status_copy_success'); 
            dom.statusEl.className = 'status-success';
            const originalText = t('copy_btn');
            dom.copyBtn.textContent = t('copy_btn_copied');
            setTimeout(() => { dom.copyBtn.textContent = originalText; }, 2000);
        }).catch(() => {
            dom.statusEl.innerHTML = t('status_copy_fail'); 
            dom.statusEl.className = 'status-error';
        });
    });

    // ── Download Share Image ──
    dom.imageBtn.addEventListener('click', () => {
        const downloadCanvas = document.createElement('canvas');
        downloadCanvas.width = 500; 
        downloadCanvas.height = 250;
        const ctx = downloadCanvas.getContext('2d');
        const activeBg = document.querySelector('.bg-selection.active');
        
        const triggerDownload = () => {
            const now = new Date();
            const pad = (num) => num.toString().padStart(2, '0');
            const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
            const link = document.createElement('a');
            link.download = `sky-height-card_${timestamp}.png`;
            link.href = downloadCanvas.toDataURL('image/png');
            link.click();
        };

        if (activeBg && (activeBg.dataset.type === 'image' || activeBg.dataset.type === 'uploaded')) {
            const bgImage = new Image();
            if (activeBg.dataset.source.startsWith('http://') || activeBg.dataset.source.startsWith('https://')) {
                bgImage.crossOrigin = "Anonymous";
            }
            bgImage.onload = () => {
                ctx.drawImage(bgImage, 0, 0, downloadCanvas.width, downloadCanvas.height);
                ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
                ctx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);
                drawCanvasContent(ctx, downloadCanvas);
                triggerDownload();
            };
            bgImage.onerror = () => {
                ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--details-bg');
                ctx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);
                drawCanvasContent(ctx, downloadCanvas);
                triggerDownload();
            };
            bgImage.src = activeBg.dataset.source;
        } else if (activeBg && activeBg.dataset.type === 'gradient') {
            const colors = activeBg.dataset.colors.split(',');
            const gradient = ctx.createLinearGradient(0, 0, downloadCanvas.width, downloadCanvas.height);
            gradient.addColorStop(0, colors[0]);
            gradient.addColorStop(1, colors[1]);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);
            drawCanvasContent(ctx, downloadCanvas);
            triggerDownload();
        } else {
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--details-bg');
            ctx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);
            drawCanvasContent(ctx, downloadCanvas);
            triggerDownload();
        }
    });

    // ── QR Scanner (jsQR) ──
    function loadImageToCanvas(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    function preprocessImageData(imageData, contrast, brightness) {
        const data = new Uint8ClampedArray(imageData.data);
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        for (let i = 0; i < data.length; i += 4) {
            let gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            gray = factor * (gray - 128) + 128 + brightness;
            gray = Math.max(0, Math.min(255, gray));
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
        }
        return new ImageData(data, imageData.width, imageData.height);
    }

    function binarize(imageData, threshold) {
        const data = new Uint8ClampedArray(imageData.data);
        for (let i = 0; i < data.length; i += 4) {
            let gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            let val = gray > threshold ? 255 : 0;
            data[i] = val;
            data[i + 1] = val;
            data[i + 2] = val;
        }
        return new ImageData(data, imageData.width, imageData.height);
    }

    async function handleQrUpload(file) {
        if (!file || !file.type.startsWith('image/')) {
            dom.statusEl.innerHTML = t('status_error_general');
            dom.statusEl.className = 'status-error';
            return;
        }

        dom.statusEl.innerHTML = t('status_qr_reading');
        dom.statusEl.className = '';

        if (typeof jsQR === 'undefined') {
            dom.statusEl.innerHTML = "Lỗi: Không tải được thư viện quét QR, vui lòng làm mới trang.";
            dom.statusEl.className = 'status-error';
            return;
        }

        try {
            dom.statusEl.innerHTML = t('status_qr_scanning');
            const img = await loadImageToCanvas(file);
            const canvas = dom.qrCanvas;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            
            let code = null;
            const scales = [1, 0.5, 0.25, 0.75, 1.5]; 
            const processings = [
                (imgData) => imgData,
                (imgData) => preprocessImageData(imgData, 50, 0),
                (imgData) => preprocessImageData(imgData, 100, 20),
                (imgData) => preprocessImageData(imgData, 80, -20),
                (imgData) => binarize(imgData, 128),
                (imgData) => binarize(imgData, 100),
                (imgData) => binarize(imgData, 150)
            ];

            for (const scale of scales) {
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                for (const process of processings) {
                    const processedData = process(originalImageData);
                    code = jsQR(processedData.data, processedData.width, processedData.height, {
                        inversionAttempts: "attemptBoth",
                    });
                    if (code && code.data) break;
                }
                if (code && code.data) break;
            }

            if (code && code.data) {
                dom.statusEl.innerHTML = t('status_qr_success');
                dom.statusEl.className = 'status-success';
                dom.b64Input.value = code.data;
                setTimeout(() => { dom.calculateBtn.click(); }, 100);
            } else {
                dom.statusEl.innerHTML = t('status_qr_fail');
                dom.statusEl.className = 'status-error';
            }

        } catch (err) {
            dom.statusEl.innerHTML = `Quét thất bại: ${err.message || t('status_error_general')}`;
            dom.statusEl.className = 'status-error';
        }
    }

    // ── Live Camera QR Scanner (with native fallback) ──
    let cameraStream = null;
    let cameraAnimId = null;
    let currentFacingMode = "environment";
    const scanCanvas = document.createElement('canvas');
    const scanCtx = scanCanvas.getContext('2d', { willReadFrequently: true });

    function stopCamera() {
        if (cameraAnimId) {
            cancelAnimationFrame(cameraAnimId);
            cameraAnimId = null;
        }
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            cameraStream = null;
        }
        if (dom.cameraVideo) {
            dom.cameraVideo.srcObject = null;
        }
        if (dom.cameraModal) {
            dom.cameraModal.classList.remove('open');
            setTimeout(() => {
                dom.cameraModal.style.display = 'none';
            }, 250);
        }
    }

    function scanFrame() {
        if (!cameraStream || !dom.cameraVideo || dom.cameraVideo.readyState !== dom.cameraVideo.HAVE_ENOUGH_DATA) {
            cameraAnimId = requestAnimationFrame(scanFrame);
            return;
        }

        const video = dom.cameraVideo;
        scanCanvas.width = video.videoWidth;
        scanCanvas.height = video.videoHeight;
        scanCtx.drawImage(video, 0, 0, scanCanvas.width, scanCanvas.height);

        const imgData = scanCtx.getImageData(0, 0, scanCanvas.width, scanCanvas.height);
        const code = typeof jsQR !== 'undefined' ? jsQR(imgData.data, imgData.width, imgData.height, {
            inversionAttempts: "attemptBoth"
        }) : null;

        if (code && code.data) {
            stopCamera();
            dom.statusEl.innerHTML = t('status_qr_success');
            dom.statusEl.className = 'status-success';
            dom.b64Input.value = code.data;
            setTimeout(() => { dom.calculateBtn.click(); }, 100);
            return;
        }

        cameraAnimId = requestAnimationFrame(scanFrame);
    }

    async function startCamera(facingMode = "environment") {
        currentFacingMode = facingMode;

        // If getUserMedia is not supported, fallback directly to camera capture input
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            if (dom.qrCameraInput) {
                dom.qrCameraInput.click();
            } else {
                alert(t('camera_error'));
            }
            return;
        }

        try {
            stopCamera();

            if (dom.cameraModal) {
                dom.cameraModal.style.display = 'flex';
                setTimeout(() => {
                    dom.cameraModal.classList.add('open');
                }, 10);
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: currentFacingMode },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            });

            cameraStream = stream;
            dom.cameraVideo.srcObject = stream;
            await dom.cameraVideo.play();

            // Detect multiple cameras for switch button
            if (navigator.mediaDevices.enumerateDevices && dom.switchCameraBtn) {
                try {
                    const devices = await navigator.mediaDevices.enumerateDevices();
                    const videoDevices = devices.filter(d => d.kind === 'videoinput');
                    if (videoDevices.length > 1) {
                        dom.switchCameraBtn.style.display = 'block';
                    }
                } catch(e) {}
            }

            cameraAnimId = requestAnimationFrame(scanFrame);

        } catch (err) {
            console.warn('Camera stream unavailable, opening native camera capture:', err);
            stopCamera();
            if (dom.qrCameraInput) {
                dom.qrCameraInput.click();
            } else {
                alert(t('camera_error'));
            }
        }
    }

    if (dom.qrUploadBtn) {
        dom.qrUploadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dom.qrFileInput.click();
        });
    }

    if (dom.qrCameraBtn) {
        dom.qrCameraBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            startCamera("environment");
        });
    }

    if (dom.qrCameraInput) {
        dom.qrCameraInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                handleQrUpload(e.target.files[0]);
            }
        });
    }

    if (dom.closeCameraBtn) {
        dom.closeCameraBtn.addEventListener('click', stopCamera);
    }
    if (dom.stopCameraBtn) {
        dom.stopCameraBtn.addEventListener('click', stopCamera);
    }
    if (dom.switchCameraBtn) {
        dom.switchCameraBtn.addEventListener('click', () => {
            const nextMode = currentFacingMode === "environment" ? "user" : "environment";
            startCamera(nextMode);
        });
    }
    if (dom.cameraModal) {
        dom.cameraModal.addEventListener('click', (e) => {
            if (e.target === dom.cameraModal) {
                stopCamera();
            }
        });
    }

    dom.qrUploadArea.addEventListener('click', (e) => {
        if (e.target.closest('#qr-camera-btn')) return;
        dom.qrFileInput.click();
    });

    dom.qrFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleQrUpload(e.target.files[0]);
        }
    });

    dom.qrUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dom.qrUploadArea.classList.add('dragover');
    });

    dom.qrUploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dom.qrUploadArea.classList.remove('dragover');
    });

    dom.qrUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dom.qrUploadArea.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleQrUpload(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    });

    document.addEventListener('paste', (e) => {
        if (e.clipboardData && e.clipboardData.items) {
            const items = e.clipboardData.items;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    e.preventDefault(); 
                    const file = items[i].getAsFile();
                    if (file) {
                        handleQrUpload(file);
                    }
                    break;
                }
            }
        }
    });

    // ── Initialization ──
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

    populateBgSelectors();
    loadHistory();
    setLanguage(currentLang);
    renderChangelog();
    updatePreview();

    const footerVersion = document.getElementById('footer-version');
    if (footerVersion && typeof versionData !== 'undefined' && versionData.length > 0) {
        footerVersion.textContent = versionData[0].ver;
    }
});
