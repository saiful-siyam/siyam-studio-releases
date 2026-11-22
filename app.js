(function () {
    "use strict";

    // Live Supabase Config
    const SUPABASE_URL = "https://llxpnjrujcpotvevpmzt.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxseHBuanJ1amNwb3R2ZXZwbXp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ0NjMwNTMsImV4cCI6MjExMDAzOTA1M30.RHJAt-XBbY3uMQsTFM3stT4Ko3dHVOC1Yeiet9qBsxQ";

    // Default downloadable installer packages (GitHub Releases)
    const DEFAULT_MAC_DOWNLOAD = "https://github.com/saiful-siyam/siyam-studio-releases/releases/latest/download/SiyamStudio_macOS_Installer.dmg";
    const DEFAULT_WIN_DOWNLOAD = "https://github.com/saiful-siyam/siyam-studio-releases/releases/latest/download/SiyamStudio_Windows_64bit_Setup.exe";

    // Payment Merchant & Support Details
    const MERCHANT_PAY_NUMBER = "+8801580653736";
    const SUPPORT_EMAIL = "saifulsheum@gmail.com";
    const SUPPORT_WHATSAPP = "+8801580653736";

    // Real Premiere Pro Demo Video Embed URL (Change anytime to your YouTube embed or demo URL)
    const DEMO_VIDEO_URL = "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0";

    const el = (id) => document.getElementById(id);

    let pollTimer = null;
    let countdownTimer = null;
    let countdownSec = 10;
    let activeLookupQuery = "";

    function toast(msg) {
        const t = el("toast");
        if (!t) return;
        t.textContent = msg;
        t.classList.add("show");
        clearTimeout(window.__siyamToast);
        window.__siyamToast = setTimeout(() => t.classList.remove("show"), 2800);
    }

    function copyText(text, label) {
        if (!text) return;
        const done = () => toast(label || ("Copied: " + text));
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done).catch(() => {});
        } else {
            const tmp = document.createElement("textarea");
            tmp.value = text;
            document.body.appendChild(tmp);
            tmp.select();
            try { document.execCommand("copy"); } catch (e) {}
            tmp.remove();
            done();
        }
    }

    async function sbFetch(method, endpoint, bodyObj) {
        const opts = {
            method: method,
            headers: {
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": "Bearer " + SUPABASE_ANON_KEY,
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            }
        };
        if (bodyObj !== undefined) {
            opts.body = JSON.stringify(bodyObj);
        }
        const res = await fetch(SUPABASE_URL.replace(/\/+$/, "") + endpoint, opts);
        const text = await res.text();
        let data = null;
        try { data = text ? JSON.parse(text) : null; } catch (e) {}
        if (!res.ok) {
            const errMsg = (data && (data.message || data.error || data.hint)) || ("Supabase HTTP " + res.status);
            throw new Error(errMsg);
        }
        return data;
    }

    // ==================== INTERACTIVE HERO SIMULATOR ====================
    let onHeroMapTabChange = function () {};

    function initHeroSimulator() {
        const tabBtns = document.querySelectorAll(".sim-tab-btn");
        const panels = {
            library: el("sim-panel-library"),
            silence: el("sim-panel-silence"),
            png: el("sim-panel-png"),
            organizer: el("sim-panel-organizer"),
            music: el("sim-panel-music"),
            voice: el("sim-panel-voice"),
            ease: el("sim-panel-ease"),
            captions: el("sim-panel-captions"),
            autoedit: el("sim-panel-autoedit"),
            map: el("sim-panel-map"),
            highlighter: el("sim-panel-highlighter"),
            downloader: el("sim-panel-downloader")
        };

        function switchSimTab(tabKey) {
            tabBtns.forEach((btn) => btn.classList.toggle("active", btn.dataset.simTab === tabKey));
            Object.keys(panels).forEach((k) => {
                const p = panels[k];
                if (p) {
                    p.classList.toggle("active", k === tabKey);
                }
            });
            if (typeof onHeroMapTabChange === "function") {
                onHeroMapTabChange(tabKey === "map");
            }
        }

        tabBtns.forEach((btn) => {
            btn.addEventListener("click", () => switchSimTab(btn.dataset.simTab));
        });

        // 1. User Library micro-interactions (Upgraded Full Browser)
        const libPlayWhoosh = el("sim-lib-play-whoosh");
        const libPlayBoom = el("sim-lib-play-boom");
        const waveWhoosh = el("waveform-whoosh");
        const waveBoom = el("waveform-boom");
        let activeAudioPlaying = null;

        function toggleAudioPlay(btn, wave, audioId, title) {
            if (!btn || !wave) return;
            const isCurrentPlaying = (activeAudioPlaying === audioId);

            // Stop any playing
            if (libPlayWhoosh) libPlayWhoosh.textContent = "▶";
            if (libPlayBoom) libPlayBoom.textContent = "▶";
            if (waveWhoosh) waveWhoosh.classList.remove("playing");
            if (waveBoom) waveBoom.classList.remove("playing");

            if (isCurrentPlaying) {
                activeAudioPlaying = null;
                toast("Audio preview paused");
            } else {
                activeAudioPlaying = audioId;
                btn.textContent = "⏸";
                wave.classList.add("playing");
                toast("Previewing: " + title);
            }
        }

        if (libPlayWhoosh && waveWhoosh) {
            libPlayWhoosh.addEventListener("click", () => {
                toggleAudioPlay(libPlayWhoosh, waveWhoosh, "whoosh", "Cinematic_Whoosh_Deep_02.wav");
            });
        }
        if (libPlayBoom && waveBoom) {
            libPlayBoom.addEventListener("click", () => {
                toggleAudioPlay(libPlayBoom, waveBoom, "boom", "Sub_Bass_Impact_Boom.wav");
            });
        }

        // Category Filter Pills
        const libFilterPills = document.querySelectorAll(".sim-filter-pill[data-lib-filter]");
        const assetCards = document.querySelectorAll(".sim-asset-card");
        libFilterPills.forEach((pill) => {
            pill.addEventListener("click", () => {
                libFilterPills.forEach((p) => p.classList.remove("active"));
                pill.classList.add("active");
                const filter = pill.dataset.libFilter;

                assetCards.forEach((card) => {
                    const cat = card.dataset.assetCat;
                    const show = (filter === "all" || cat === filter);
                    card.style.display = show ? "flex" : "none";
                });
                toast("Filtered: " + pill.textContent.trim());
            });
        });

        // Grid / List View Toggle
        const libGridBtn = el("sim-lib-grid-btn");
        const libListBtn = el("sim-lib-list-btn");
        const libGridContainer = el("sim-lib-assets-grid");
        if (libGridBtn && libListBtn && libGridContainer) {
            libGridBtn.addEventListener("click", () => {
                libGridBtn.classList.add("active");
                libListBtn.classList.remove("active");
                libGridContainer.classList.remove("view-list");
                toast("View: Grid Mode");
            });
            libListBtn.addEventListener("click", () => {
                libListBtn.classList.add("active");
                libGridBtn.classList.remove("active");
                libGridContainer.classList.add("view-list");
                toast("View: List Mode");
            });
        }

        // 1-Click Insert Buttons
        const libInsertBtns = document.querySelectorAll(".btn-lib-insert");
        libInsertBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
                const name = btn.dataset.insertName || "Asset";
                const track = btn.dataset.track || "Timeline";
                btn.style.transform = "scale(0.92)";
                setTimeout(() => {
                    btn.style.transform = "";
                }, 160);
                toast(`✓ Inserted ${name} directly onto Track ${track}!`);
            });
        });

        // Search Input Filter
        const libSearchInput = el("sim-lib-search-input");
        if (libSearchInput) {
            libSearchInput.addEventListener("input", (e) => {
                const q = e.target.value.toLowerCase().trim();
                assetCards.forEach((card) => {
                    const name = card.querySelector(".asset-name") ? card.querySelector(".asset-name").textContent.toLowerCase() : "";
                    const sub = card.querySelector(".asset-sub") ? card.querySelector(".asset-sub").textContent.toLowerCase() : "";
                    const match = !q || name.includes(q) || sub.includes(q);
                    card.style.display = match ? "flex" : "none";
                });
            });
        }

        // 2. Silence Remover micro-interactions
        const btnTrimSilence = el("btn-sim-trim-silence");
        const btnResetSilence = el("btn-sim-reset-silence");
        const silenceGap1 = el("silence-gap-1");
        const silenceGap2 = el("silence-gap-2");
        const silenceCountLabel = el("silence-count-label");

        if (btnTrimSilence && btnResetSilence) {
            btnTrimSilence.addEventListener("click", () => {
                if (silenceGap1) silenceGap1.classList.add("collapsed");
                if (silenceGap2) silenceGap2.classList.add("collapsed");
                if (silenceCountLabel) silenceCountLabel.textContent = "Trimmed 14 Pauses! (Saved 4.8s Dead Air)";
                btnTrimSilence.style.display = "none";
                btnResetSilence.style.display = "inline-flex";
                toast("Trimmed 4.8s dead air & ripple deleted in 0.4s!");
            });

            btnResetSilence.addEventListener("click", () => {
                if (silenceGap1) silenceGap1.classList.remove("collapsed");
                if (silenceGap2) silenceGap2.classList.remove("collapsed");
                if (silenceCountLabel) silenceCountLabel.textContent = "Detected: 14 Pauses (4.8s Dead Air)";
                btnTrimSilence.style.display = "inline-flex";
                btnResetSilence.style.display = "none";
                toast("Reset silence detection timeline");
            });
        }

        // 3. PNG Maker micro-interactions
        const pngTarget = el("sim-png-target");
        const toggleOutline = el("toggle-png-outline");
        const toggleGlow = el("toggle-png-glow");
        const toggleShadow = el("toggle-png-shadow");
        const btnExportPng = el("btn-export-png-demo");

        if (pngTarget) {
            if (toggleOutline) {
                toggleOutline.addEventListener("click", () => {
                    pngTarget.classList.toggle("has-outline");
                    toggleOutline.classList.toggle("active");
                });
            }
            if (toggleGlow) {
                toggleGlow.addEventListener("click", () => {
                    pngTarget.classList.toggle("has-glow");
                    toggleGlow.classList.toggle("active");
                });
            }
            if (toggleShadow) {
                toggleShadow.addEventListener("click", () => {
                    pngTarget.classList.toggle("has-shadow");
                    toggleShadow.classList.toggle("active");
                });
            }
            if (btnExportPng) {
                btnExportPng.addEventListener("click", () => {
                    toast("Exported Freeze-Frame PNG with transparent alpha cutout!");
                });
            }
        }

        // 4. Project Organizer micro-interactions
        const btnRunOrganizer = el("btn-run-organizer-demo");
        const orgStatusText = el("org-status-text");
        const orgGrid = el("sim-org-grid");
        if (btnRunOrganizer) {
            btnRunOrganizer.addEventListener("click", () => {
                if (orgGrid) {
                    orgGrid.style.transform = "scale(0.98)";
                    setTimeout(() => {
                        orgGrid.style.transform = "scale(1)";
                    }, 180);
                }
                if (orgStatusText) {
                    orgStatusText.textContent = "✓ 41 Assets sorted into 5 color-coded bins!";
                }
                toast("Project organized: 5 Premiere bins created & footage sorted!");
            });
        }

        // 5. Music Remover micro-interactions
        const stemBtns = document.querySelectorAll(".stem-btn[data-stem]");
        const stemTracks = {
            vocals: el("stem-track-vocals"),
            music: el("stem-track-music"),
            drums: el("stem-track-drums")
        };
        const stemStatus = el("stem-status-text");
        const btnExportStems = el("btn-export-stems-demo");

        stemBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
                const stemType = btn.dataset.stem;
                const isSolo = btn.classList.contains("solo-btn");
                const track = stemTracks[stemType];

                if (isSolo) {
                    // Solo this stem: unmute this, mute others
                    Object.keys(stemTracks).forEach((k) => {
                        const tr = stemTracks[k];
                        if (!tr) return;
                        const sBtn = tr.querySelector(".solo-btn");
                        const mBtn = tr.querySelector(".mute-btn");
                        if (k === stemType) {
                            tr.classList.remove("is-muted");
                            if (sBtn) sBtn.classList.add("active");
                            if (mBtn) {
                                mBtn.classList.remove("active");
                                mBtn.textContent = "MUTE";
                            }
                        } else {
                            tr.classList.add("is-muted");
                            if (sBtn) sBtn.classList.remove("active");
                            if (mBtn) {
                                mBtn.classList.add("active");
                                mBtn.textContent = "MUTED";
                            }
                        }
                    });
                    if (stemStatus) stemStatus.textContent = `✓ Stem "${stemType}" soloed (others muted)`;
                    toast(`Soloed stem: ${stemType}`);
                } else {
                    // Toggle Mute
                    if (track) {
                        const isNowMuted = !track.classList.contains("is-muted");
                        track.classList.toggle("is-muted", isNowMuted);
                        btn.classList.toggle("active", isNowMuted);
                        btn.textContent = isNowMuted ? "MUTED" : "MUTE";
                        if (stemStatus) {
                            stemStatus.textContent = isNowMuted ? `✓ ${stemType} muted` : `✓ ${stemType} active`;
                        }
                        toast(isNowMuted ? `Muted: ${stemType}` : `Unmuted: ${stemType}`);
                    }
                }
            });
        });

        if (btnExportStems) {
            btnExportStems.addEventListener("click", () => {
                toast("Separated stems placed on timeline audio tracks A1-A3!");
            });
        }

        // 6. Voice Leveler micro-interactions
        const btnToggleVoice = el("btn-toggle-vocal-rider");
        const voiceLeveledBox = el("sim-voice-leveled-box");
        let voiceLeveledActive = true;
        if (btnToggleVoice && voiceLeveledBox) {
            btnToggleVoice.addEventListener("click", () => {
                voiceLeveledActive = !voiceLeveledActive;
                voiceLeveledBox.classList.toggle("active", voiceLeveledActive);
                btnToggleVoice.textContent = voiceLeveledActive ? "⚡ Auto Vocal Rider Active (-14 LUFS)" : "Enable Auto Vocal Rider";
                toast(voiceLeveledActive ? "Vocal Rider ON: Leveled to -14.0 LUFS broadcast target" : "Vocal Rider OFF: Raw uneven audio");
            });
        }

        // 7. Smooth Ease Curve preset pills in simulator
        const curvePills = document.querySelectorAll(".sim-curve-pill");
        const curveLabel = el("sim-ease-curve-label");
        const curvePresets = {
            "⚡ Whip Ease": "Whip-Snap (0.32, 0.02, 0.18, 1.0)",
            "🚀 Expo Out": "Expo Out (0.16, 1.0, 0.3, 1.0)",
            "🎯 Smooth Pop": "Smooth Pop (0.34, 1.56, 0.64, 1.0)",
            "🌊 Deep Elastic": "Deep Elastic (0.22, 1.25, 0.36, 1.0)"
        };
        curvePills.forEach((pill) => {
            pill.addEventListener("click", () => {
                curvePills.forEach((p) => p.classList.remove("active"));
                pill.classList.add("active");
                const name = pill.textContent.trim();
                if (curveLabel && curvePresets[name]) {
                    curveLabel.textContent = curvePresets[name];
                }
                toast("Ease Preset Selected: " + name);
            });
        });

        // Quick Move Cards preview
        const moveCards = document.querySelectorAll(".sim-move-card");
        moveCards.forEach((card) => {
            card.addEventListener("click", () => {
                const name = card.querySelector(".sim-move-name") ? card.querySelector(".sim-move-name").textContent : "Move";
                card.style.transform = "scale(0.95)";
                setTimeout(() => {
                    card.style.transform = "";
                }, 160);
                toast(`Applied Quick Move: ${name} to clip`);
            });
        });

        // 8. Interactive Word highlight in Captions simulator
        const capWords = document.querySelectorAll(".sim-caption-live-text .cap-word");
        capWords.forEach((word) => {
            word.addEventListener("click", () => {
                capWords.forEach((w) => w.classList.remove("star-highlight"));
                word.classList.add("star-highlight");
                toast("Highlighted word: " + word.textContent.trim());
            });
        });

        const capStylePills = document.querySelectorAll(".sim-style-pill");
        capStylePills.forEach((pill) => {
            pill.addEventListener("click", () => {
                capStylePills.forEach((p) => p.classList.remove("active"));
                pill.classList.add("active");
                const styleName = pill.textContent.trim();
                const styleTag = document.querySelector(".sim-caption-style-tag");
                if (styleTag) styleTag.textContent = "Style: " + styleName;
                toast("Selected Caption Style: " + styleName);
            });
        });

        // 9. AI Auto Edit MCP micro-interactions
        const btnRunMcp = el("btn-run-mcp-demo");
        const mcpLines = document.querySelectorAll(".mcp-log-line");
        if (btnRunMcp) {
            btnRunMcp.addEventListener("click", () => {
                btnRunMcp.disabled = true;
                btnRunMcp.textContent = "Agent Executing...";
                mcpLines.forEach((line) => {
                    line.style.opacity = "0.3";
                });
                let idx = 0;
                function stepLine() {
                    if (idx < mcpLines.length) {
                        mcpLines[idx].style.opacity = "1";
                        idx++;
                        setTimeout(stepLine, 350);
                    } else {
                        btnRunMcp.disabled = false;
                        btnRunMcp.textContent = "Run MCP Agent";
                        toast("AI Auto Edit complete: 18 cuts, 4 zooms & audio ducked!");
                    }
                }
                stepLine();
            });
        }

        // 11. 3D Highlighter Color Swatches
        const hlSwatches = document.querySelectorAll(".hl-swatch[data-hl-color]");
        const hlText = el("sim-highlight-text");
        hlSwatches.forEach((swatch) => {
            swatch.addEventListener("click", () => {
                hlSwatches.forEach((s) => s.classList.remove("active"));
                swatch.classList.add("active");
                const color = swatch.dataset.hlColor;
                if (hlText) {
                    hlText.style.background = color;
                    hlText.style.boxShadow = `0 0 12px ${color}`;
                    hlText.style.color = color === "#facc15" ? "#0f172a" : (color === "#38bdf8" ? "#041b2c" : "#ffffff");
                }
                toast(`Highlight Color: ${swatch.title || color}`);
            });
        });

        // 12. Video Downloader micro-interactions
        const btnDlGrab = el("btn-sim-dl-grab");
        const dlText = el("sim-dl-text");
        if (btnDlGrab) {
            btnDlGrab.addEventListener("click", () => {
                btnDlGrab.disabled = true;
                btnDlGrab.textContent = "Downloading 1080p (45%)...";
                setTimeout(() => {
                    btnDlGrab.textContent = "Converting ProRes...";
                    setTimeout(() => {
                        btnDlGrab.disabled = false;
                        btnDlGrab.textContent = "📥 Grab 1080p Clip";
                        if (dlText) dlText.textContent = "✓ In/Out Range (00:25) downloaded to '03_Footage' bin!";
                        toast("Downloaded 00:25 ProRes clip straight to Premiere Pro bin!");
                    }, 500);
                }, 500);
            });
        }
    }

    // ==================== REAL 3D MAP ANIMATOR SIMULATOR ====================
    function initHeroMapAnimator() {
        const container = el("hero-maplibre");
        const hudCanvas = el("heroMapHud");
        const replayBtn = el("hero-map-replay");
        const themeBtns = document.querySelectorAll(".sim-theme-badge[data-map-theme]");
        const telemZoom = el("hero-telem-zoom");
        const telemPitch = el("hero-telem-pitch");
        const telemBearing = el("hero-telem-bearing");
        const telemBlur = el("hero-telem-blur");

        if (!container || !hudCanvas) return;

        const DHAKA_COORDS = [90.4125, 23.8103];
        let currentTheme = "satellite";
        let mapInstance = null;
        let isTabActive = false;
        let animFrameId = null;
        let startTime = performance.now();
        let fallbackGridPhase = 0;

        const THEMES = {
            satellite: {
                id: "satellite",
                filter: "contrast(1.15) brightness(0.92)",
                accentColor: "#00e676",
                cardBg: "rgba(10, 12, 18, 0.92)",
                textColor: "#ffffff",
                subColor: "#00e676",
                highlighter: false
            },
            vox_navy: {
                id: "vox_navy",
                filter: "sepia(0.6) hue-rotate(165deg) saturate(3.2) contrast(1.25) brightness(0.92)",
                accentColor: "#38bdf8",
                cardBg: "rgba(6, 16, 28, 0.92)",
                textColor: "#ffffff",
                subColor: "#38bdf8",
                highlighter: false
            },
            newspaper_print: {
                id: "newspaper_print",
                filter: "contrast(1.25) grayscale(0.8) brightness(0.97)",
                accentColor: "#facc15",
                cardBg: "transparent",
                textColor: "#0f172a",
                subColor: "#475569",
                highlighter: true
            },
            apple_emerald: {
                id: "apple_emerald",
                filter: "contrast(1.2) brightness(0.95)",
                accentColor: "#00e676",
                cardBg: "rgba(12, 15, 20, 0.92)",
                textColor: "#ffffff",
                subColor: "#00e676",
                highlighter: false
            }
        };

        function buildMapStyle(themeId) {
            if (themeId === "newspaper_print") {
                return "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
            }
            if (themeId === "vox_navy" || themeId === "apple_emerald") {
                return "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
            }
            // Satellite Hybrid (Esri World Imagery + Reference)
            return {
                version: 8,
                sources: {
                    "esri-sat": {
                        type: "raster",
                        tiles: [
                            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        ],
                        tileSize: 256,
                        maxzoom: 18
                    },
                    "esri-ref": {
                        type: "raster",
                        tiles: [
                            "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                        ],
                        tileSize: 256,
                        maxzoom: 16
                    }
                },
                layers: [
                    { id: "bg", type: "background", paint: { "background-color": "#07090e" } },
                    { id: "sat-layer", type: "raster", source: "esri-sat" },
                    { id: "ref-layer", type: "raster", source: "esri-ref" }
                ]
            };
        }

        function easeOutExpo(t) {
            return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
        }

        function whipSpeedRamp(t) {
            if (t < 0.22) return 0.08 * Math.pow(t / 0.22, 3);
            const p = (t - 0.22) / 0.78;
            return 0.08 + 0.92 * (1 - Math.pow(1 - p, 4.5));
        }

        function lerp(a, b, t) {
            return a + (b - a) * t;
        }

        function applyTheme(themeId) {
            currentTheme = themeId;
            const cfg = THEMES[themeId] || THEMES.satellite;
            container.style.filter = cfg.filter;

            themeBtns.forEach((btn) => {
                btn.classList.toggle("active", btn.dataset.mapTheme === themeId);
            });

            if (mapInstance) {
                try {
                    mapInstance.setStyle(buildMapStyle(themeId));
                } catch (e) {}
            }
        }

        function initMapInstance() {
            if (mapInstance) return;
            if (!window.maplibregl) {
                setTimeout(initMapInstance, 200);
                return;
            }
            try {
                mapInstance = new window.maplibregl.Map({
                    container: container,
                    style: buildMapStyle(currentTheme),
                    center: DHAKA_COORDS,
                    zoom: 2.2,
                    pitch: 0,
                    bearing: 0,
                    interactive: false,
                    attributionControl: false
                });

                mapInstance.on("load", () => {
                    container.style.filter = THEMES[currentTheme].filter;
                });
            } catch (e) {
                mapInstance = null;
            }
        }

        function drawHud(timeSec, isDive, diveProgress, targetPos) {
            const rect = hudCanvas.getBoundingClientRect();
            const width = rect.width || 600;
            const height = rect.height || 230;
            const dpr = window.devicePixelRatio || 1;

            if (hudCanvas.width !== Math.round(width * dpr) || hudCanvas.height !== Math.round(height * dpr)) {
                hudCanvas.width = Math.round(width * dpr);
                hudCanvas.height = Math.round(height * dpr);
            }

            const ctx = hudCanvas.getContext("2d");
            ctx.save();
            ctx.scale(dpr, dpr);
            ctx.clearRect(0, 0, width, height);

            const cfg = THEMES[currentTheme] || THEMES.satellite;

            // 1. Vector Fallback Grid if WebGL/MapLibre tiles are blocked
            if (!mapInstance) {
                fallbackGridPhase += 0.015;
                ctx.save();
                ctx.strokeStyle = "rgba(56, 189, 248, 0.08)";
                ctx.lineWidth = 1;
                const gridSize = 32;
                const offsetX = (fallbackGridPhase * 40) % gridSize;
                for (let x = -gridSize + offsetX; x < width + gridSize; x += gridSize) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, height);
                    ctx.stroke();
                }
                for (let y = 0; y < height; y += gridSize) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(width, y);
                    ctx.stroke();
                }
                ctx.restore();
            }

            // 2. Cinematic Vignette
            const vigGrad = ctx.createRadialGradient(width / 2, height / 2, width * 0.15, width / 2, height / 2, width * 0.7);
            if (cfg.highlighter) {
                vigGrad.addColorStop(0, "rgba(255,255,255,0)");
                vigGrad.addColorStop(1, "rgba(15, 23, 42, 0.28)");
            } else {
                vigGrad.addColorStop(0, "rgba(0,0,0,0)");
                vigGrad.addColorStop(1, "rgba(3, 5, 8, 0.65)");
            }
            ctx.fillStyle = vigGrad;
            ctx.fillRect(0, 0, width, height);

            // 3. Target Coordinates Center
            let cx = width / 2;
            let cy = height / 2;
            if (targetPos && typeof targetPos.x === "number" && typeof targetPos.y === "number") {
                cx = targetPos.x;
                cy = targetPos.y;
            }

            // Pulsating Radar Ring
            const pulseRate = 1.6;
            const pulseT = (timeSec % pulseRate) / pulseRate;
            const pulseRadius = 10 + pulseT * 26;
            const pulseAlpha = Math.max(0, 1 - pulseT);

            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2);
            ctx.strokeStyle = cfg.accentColor;
            ctx.globalAlpha = pulseAlpha * 0.75;
            ctx.lineWidth = 1.8;
            ctx.stroke();
            ctx.restore();

            // Center Pin Dot
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, 4, 0, Math.PI * 2);
            ctx.fillStyle = cfg.accentColor;
            ctx.shadowColor = cfg.accentColor;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.restore();

            // 4. Callout Card
            const cardX = cx + 14;
            const cardY = cy - 22;

            if (cfg.highlighter) {
                // Editorial Newspaper Print: Animated Yellow Highlighter sweep behind bold Georgia Serif text
                const titleText = "DHAKA, BANGLADESH";
                const subText = "LAT 23.81° N • LON 90.41° E";

                ctx.save();
                ctx.font = "900 13px Georgia, serif";
                const titleW = ctx.measureText(titleText).width;

                // Yellow Highlighter strip
                ctx.fillStyle = "#facc15";
                ctx.fillRect(cardX, cardY - 4, titleW + 10, 18);

                // Bold dark serif title
                ctx.fillStyle = "#0f172a";
                ctx.fillText(titleText, cardX + 5, cardY + 10);

                // Subtitle
                ctx.font = "600 9.5px -apple-system, BlinkMacSystemFont, sans-serif";
                ctx.fillStyle = "#334155";
                ctx.fillText(subText, cardX + 5, cardY + 26);
                ctx.restore();
            } else {
                // Standard Modern Callout Card (Satellite, Vox Navy, Apple Emerald)
                const titleText = "DHAKA, BANGLADESH";
                const subText = "LAT 23.81° N • LON 90.41° E";

                ctx.save();
                ctx.font = "800 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
                const titleW = ctx.measureText(titleText).width;
                const cardW = Math.max(160, titleW + 24);
                const cardH = 38;

                // Dark Card Box
                ctx.fillStyle = cfg.cardBg;
                ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
                ctx.lineWidth = 1;
                ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
                ctx.shadowBlur = 14;
                ctx.beginPath();
                ctx.roundRect(cardX, cardY - 6, cardW, cardH, 6);
                ctx.fill();
                ctx.stroke();

                // Left Accent Strip
                ctx.fillStyle = cfg.accentColor;
                ctx.shadowColor = cfg.accentColor;
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.roundRect(cardX, cardY - 6, 3.5, cardH, [6, 0, 0, 6]);
                ctx.fill();

                // Text
                ctx.shadowBlur = 0;
                ctx.fillStyle = cfg.textColor;
                ctx.fillText(titleText, cardX + 12, cardY + 10);

                ctx.font = "600 9px 'JetBrains Mono', monospace";
                ctx.fillStyle = cfg.subColor;
                ctx.fillText(subText, cardX + 12, cardY + 24);
                ctx.restore();
            }

            ctx.restore();
        }

        function loop(now) {
            if (!isTabActive) {
                animFrameId = null;
                return;
            }

            const elapsed = now - startTime;
            const diveDur = 3400; // 3.4s fast whip-dive
            let curZoom = 2.2;
            let curPitch = 0;
            let curBearing = 0;
            let blurPx = 0;
            let isDive = true;
            let diveP = 0;

            if (elapsed < diveDur) {
                // 1. WHIP-DIVE PHASE
                diveP = Math.min(1, elapsed / diveDur);
                const ramp = whipSpeedRamp(diveP);
                curZoom = lerp(2.2, 11.4, ramp);
                curPitch = lerp(0, 58, easeOutExpo(diveP));
                curBearing = lerp(0, 32, ramp);
                if (diveP < 0.8) {
                    blurPx = Math.sin(diveP * Math.PI) * 4.2;
                } else {
                    blurPx = lerp(1.2, 0.3, (diveP - 0.8) / 0.2);
                }
            } else {
                // 2. CONTINUOUS 360° DRONE ORBIT PHASE
                isDive = false;
                diveP = 1;
                const orbitElapsed = elapsed - diveDur;
                curBearing = (32 + (orbitElapsed / 42000) * 360) % 360;
                curZoom = 11.4 + Math.sin(orbitElapsed / 3200) * 0.12;
                curPitch = 58 + Math.cos(orbitElapsed / 3800) * 2.2;
                blurPx = 0.4 + Math.abs(Math.sin(orbitElapsed / 2200)) * 0.3;
            }

            // Update MapLibre camera pose
            let targetScreenPos = null;
            if (mapInstance) {
                try {
                    mapInstance.jumpTo({
                        center: DHAKA_COORDS,
                        zoom: curZoom,
                        pitch: curPitch,
                        bearing: curBearing
                    });
                    const p = mapInstance.project(DHAKA_COORDS);
                    if (p) targetScreenPos = { x: p.x, y: p.y };
                } catch (e) {}
            }

            // Update Telemetry indicators
            if (telemZoom) telemZoom.textContent = curZoom.toFixed(1);
            if (telemPitch) telemPitch.textContent = Math.round(curPitch) + "°";
            if (telemBearing) telemBearing.textContent = Math.round(curBearing) + "°";
            if (telemBlur) telemBlur.textContent = blurPx.toFixed(1) + "px";

            // Draw HUD Overlay
            drawHud(elapsed / 1000, isDive, diveP, targetScreenPos);

            animFrameId = requestAnimationFrame(loop);
        }

        function restartAnimation() {
            startTime = performance.now();
            if (isTabActive && !animFrameId) {
                animFrameId = requestAnimationFrame(loop);
            }
        }

        // Wire Replay Button
        if (replayBtn) {
            replayBtn.addEventListener("click", (e) => {
                e.preventDefault();
                restartAnimation();
            });
        }

        // Wire Theme Buttons
        themeBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
                const t = btn.dataset.mapTheme;
                if (t) applyTheme(t);
            });
        });

        // External Hook for Hero Simulator Tab Switching
        onHeroMapTabChange = function (active) {
            isTabActive = !!active;
            if (isTabActive) {
                if (!mapInstance) {
                    initMapInstance();
                } else {
                    try { mapInstance.resize(); } catch (e) {}
                }
                restartAnimation();
            } else {
                if (animFrameId) {
                    cancelAnimationFrame(animFrameId);
                    animFrameId = null;
                }
            }
        };

        // Initialize default theme
        applyTheme("satellite");
    }

    // ==================== BENTO CATEGORY FILTER ====================
    function initBentoFilters() {
        const filterBtns = document.querySelectorAll(".bento-filter-btn");
        const bentoCards = document.querySelectorAll(".bento-card");

        filterBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
                filterBtns.forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");

                const targetFilter = btn.dataset.bentoFilter; // 'all', 'ai', 'motion', 'workflow'
                bentoCards.forEach((card) => {
                    const cardCat = card.dataset.cat;
                    if (targetFilter === "all" || cardCat === targetFilter) {
                        card.classList.remove("is-hidden");
                    } else {
                        card.classList.add("is-hidden");
                    }
                });
            });
        });
    }

    // ==================== FAQ ACCORDION ====================
    function initFaqAccordion() {
        const triggers = document.querySelectorAll(".faq-trigger");
        triggers.forEach((trigger) => {
            trigger.addEventListener("click", () => {
                const item = trigger.closest(".faq-item");
                if (!item) return;
                const wasActive = item.classList.contains("active");

                // Optional: close other open items for cleaner accordion
                document.querySelectorAll(".faq-item").forEach((other) => {
                    if (other !== item) other.classList.remove("active");
                });

                item.classList.toggle("active", !wasActive);
            });
        });
    }

    // ==================== INSTALL GUIDE TABS ====================
    function initInstallTabs() {
        const tabBtns = document.querySelectorAll(".os-tab-btn");
        if (!tabBtns.length) return;
        const macPanel = el("install-panel-mac");
        const winPanel = el("install-panel-win");

        function switchOs(target) {
            tabBtns.forEach((b) => b.classList.toggle("active", b.dataset.os === target));
            if (macPanel) macPanel.classList.toggle("active", target === "mac");
            if (winPanel) winPanel.classList.toggle("active", target === "win");
        }

        tabBtns.forEach((btn) => {
            btn.addEventListener("click", () => switchOs(btn.dataset.os));
        });

        // Auto-detect visitor OS
        if (/Win/i.test(navigator.platform || navigator.userAgent || "")) {
            switchOs("win");
        }
    }

    // ==================== SYNC DOWNLOAD LINKS FROM APP CONFIG ====================
    async function syncDownloadLinksFromConfig() {
        const macBtns = [el("btn-download-mac"), el("footer-btn-mac")].filter(Boolean);
        const winBtns = [el("btn-download-win"), el("footer-btn-win")].filter(Boolean);
        macBtns.forEach(b => { b.href = DEFAULT_MAC_DOWNLOAD; });
        winBtns.forEach(b => { b.href = DEFAULT_WIN_DOWNLOAD; });

        try {
            const rows = await sbFetch("GET", "/rest/v1/app_config?id=eq.1&limit=1");
            const cfg = Array.isArray(rows) && rows[0] ? rows[0] : null;
            if (!cfg) return;

            let macUrl = cfg.mac_download_url || "";
            let winUrl = cfg.win_download_url || "";

            // Fallback: allow download_url to store JSON {"mac":"...","win":"..."}
            if ((!macUrl || !winUrl) && cfg.download_url && cfg.download_url.trim().startsWith("{")) {
                try {
                    const parsed = JSON.parse(cfg.download_url);
                    if (!macUrl && parsed.mac) macUrl = parsed.mac;
                    if (!winUrl && parsed.win) winUrl = parsed.win;
                } catch (e) {}
            }

            if (macUrl) macBtns.forEach(b => { b.href = macUrl; });
            if (winUrl) winBtns.forEach(b => { b.href = winUrl; });
            if (!macUrl && cfg.download_url && /mac/i.test(cfg.download_url)) {
                macBtns.forEach(b => { b.href = cfg.download_url; });
            }
            if (!winUrl && cfg.download_url && /win/i.test(cfg.download_url)) {
                winBtns.forEach(b => { b.href = cfg.download_url; });
            }
        } catch (e) {
            // Keep safe default GitHub Release links on error
        }
    }

    // ==================== REAL PREMIERE PRO DEMO VIDEO MODAL ====================
    function initDemoVideoModal() {
        const modal = el("demo-video-modal");
        const iframe = el("demo-video-iframe");
        const closeBtn = el("btn-close-demo-modal");
        const tryFreeBtn = el("btn-demo-try-free");
        const triggerBtns = document.querySelectorAll('[data-open-demo="true"], #btn-watch-demo, #footer-btn-demo');

        if (!modal || !iframe) return;

        function openModal() {
            iframe.src = DEMO_VIDEO_URL;
            modal.classList.add("open");
            document.body.style.overflow = "hidden";
        }

        function closeModal() {
            modal.classList.remove("open");
            iframe.src = ""; // Stop video playback and audio immediately
            document.body.style.overflow = "";
        }

        triggerBtns.forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                openModal();
            });
        });

        if (closeBtn) {
            closeBtn.addEventListener("click", closeModal);
        }

        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal();
        });

        if (tryFreeBtn) {
            tryFreeBtn.addEventListener("click", () => {
                closeModal();
            });
        }

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.classList.contains("open")) {
                closeModal();
            }
        });
    }

    // ==================== WHAT'S NEW CHANGELOG MODAL ====================
    function initChangelogModal() {
        const modal = el("changelog-modal");
        const openBtns = [el("btn-whats-new"), el("footer-btn-whats-new")].filter(Boolean);
        const closeBtn = el("btn-close-changelog-modal");

        if (!modal) return;

        function openModal() {
            modal.classList.add("open");
            document.body.style.overflow = "hidden";
        }

        function closeModal() {
            modal.classList.remove("open");
            document.body.style.overflow = "";
        }

        openBtns.forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                openModal();
            });
        });

        if (closeBtn) {
            closeBtn.addEventListener("click", closeModal);
        }

        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.classList.contains("open")) {
                closeModal();
            }
        });
    }

    // ==================== MOBILE NAVIGATION DRAWER ====================
    function initMobileMenu() {
        const toggleBtn = el("btn-mobile-menu-toggle");
        const drawer = el("mobile-nav-drawer");
        const closeBtn = el("btn-close-mobile-menu");
        const backdrop = el("mobile-nav-backdrop");
        const mobileLinks = document.querySelectorAll(".mobile-nav-link, .mobile-download-btn, #mobile-brand-link");

        if (!toggleBtn || !drawer) return;

        function openDrawer() {
            drawer.classList.add("open");
            toggleBtn.classList.add("is-active");
            toggleBtn.setAttribute("aria-expanded", "true");
            document.body.style.overflow = "hidden";
        }

        function closeDrawer() {
            drawer.classList.remove("open");
            toggleBtn.classList.remove("is-active");
            toggleBtn.setAttribute("aria-expanded", "false");
            document.body.style.overflow = "";
        }

        toggleBtn.addEventListener("click", () => {
            if (drawer.classList.contains("open")) {
                closeDrawer();
            } else {
                openDrawer();
            }
        });

        if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
        if (backdrop) backdrop.addEventListener("click", closeDrawer);

        mobileLinks.forEach((link) => {
            link.addEventListener("click", () => {
                closeDrawer();
            });
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && drawer.classList.contains("open")) {
                closeDrawer();
            }
        });
    }

    // ==================== SCROLLSPY (ACTIVE MENU ITEM) ====================
    function initScrollspy() {
        const sectionIds = [
            "features",
            "simulator",
            "why-siyam",
            "reviews",
            "pricing",
            "faq",
            "lookup"
        ];

        const sections = sectionIds.map(id => el(id)).filter(Boolean);
        const navLinks = document.querySelectorAll(".nav-links .nav-link");
        const mobileLinks = document.querySelectorAll(".mobile-nav-link");

        if (!sections.length) return;

        function onScroll() {
            const scrollPos = window.scrollY + 130;
            let currentId = "";

            sections.forEach(sec => {
                const top = sec.offsetTop;
                const height = sec.offsetHeight;
                if (scrollPos >= top && scrollPos < top + height) {
                    currentId = sec.id;
                }
            });

            if (!currentId && window.scrollY < 200) {
                currentId = "";
            }

            navLinks.forEach(link => {
                const href = link.getAttribute("href") || "";
                link.classList.toggle("active", href === "#" + currentId);
            });

            mobileLinks.forEach(link => {
                const href = link.getAttribute("href") || "";
                link.classList.toggle("active", href === "#" + currentId);
            });
        }

        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
    }

    // ==================== LIVE LICENSE KEY LOOKUP ====================
    function stopLookupPolling() {
        if (pollTimer) {
            clearInterval(pollTimer);
            pollTimer = null;
        }
        if (countdownTimer) {
            clearInterval(countdownTimer);
            countdownTimer = null;
        }
    }

    function renderLookupLicense(lic, queryValue) {
        const box = el("lookup-result-box");
        const titleEl = el("lookup-status-title");
        const badgeEl = el("lookup-status-badge");
        const descEl = el("lookup-status-desc");
        const keyWrap = el("lookup-key-wrap");
        const keyCodeEl = el("lookup-issued-key");
        const pollNoteEl = el("lookup-poll-note");

        if (!box) return;
        stopLookupPolling();
        box.className = "lookup-status show approved";

        const isTrial = !!lic.is_trial || (lic.plan === "trial");
        const cycle = String(lic.billing_cycle || "").toLowerCase();
        const userName = lic.customer_name || "Creator";
        const emailInfo = lic.customer_email ? ` (${lic.customer_email})` : "";
        const isLifetime = cycle === "lifetime" || (!lic.expires_at && !isTrial);

        let planTitle = "Pro Lifetime";
        let badgeText = "LIFETIME PRO";
        let statusClass = "tier-pro";
        let validityNote = "";

        if (isTrial) {
            planTitle = "7-Day Free Trial";
            badgeText = "TRIAL";
            statusClass = "tier-free";
        } else if (cycle === "yearly") {
            planTitle = "Pro Yearly";
            badgeText = "PRO YEARLY";
        } else if (cycle === "monthly" || lic.expires_at) {
            planTitle = "Pro Monthly";
            badgeText = "PRO MONTHLY";
        }

        if (lic.expires_at) {
            const expMs = Date.parse(lic.expires_at);
            if (!isNaN(expMs)) {
                const remMs = expMs - Date.now();
                const expDate = new Date(expMs);
                const expStr = expDate.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
                if (remMs <= 0) {
                    box.className = "lookup-status show rejected";
                    titleEl.textContent = `${planTitle} Expired`;
                    badgeEl.textContent = "EXPIRED";
                    badgeEl.className = "mockup-tier-pill tier-free";
                    descEl.textContent = `Hi ${userName}, your ${planTitle} license expired on ${expStr}. Please renew your subscription to restore immediate Pro access.`;
                    keyCodeEl.textContent = lic.license_key || "-";
                    keyWrap.style.display = "flex";
                    pollNoteEl.textContent = `Expired on: ${expStr} • Renew your key anytime at siyamstudio.com/#pricing`;
                    return;
                } else {
                    const daysLeft = Math.max(1, Math.ceil(remMs / 86400000));
                    badgeText = `${badgeText} • ${daysLeft}D LEFT`;
                    validityNote = ` Valid until ${expStr} (${daysLeft} days remaining).`;
                }
            }
        }

        titleEl.textContent = `${planTitle} License Active`;
        badgeEl.textContent = badgeText;
        badgeEl.className = "mockup-tier-pill " + statusClass;
        descEl.textContent = `Hi ${userName}, your Siyam Studio ${planTitle} license is verified and active${emailInfo}.${validityNote} Copy your key below and paste it into Premiere Pro > Window > Extensions > Siyam Studio.`;
        keyCodeEl.textContent = lic.license_key || "-";
        keyWrap.style.display = "flex";

        if (lic.hwid) {
            const hwidShort = String(lic.hwid).slice(0, 8) + "...";
            pollNoteEl.textContent = `Bound Workstation: ${lic.os_type || "Mac/Win PC"} (HWID: ${hwidShort}) • Status: ${String(lic.status || "active").toUpperCase()}`;
        } else {
            pollNoteEl.textContent = `Ready to bind on your Mac or Windows Premiere Pro workstation.`;
        }
    }

    function renderLookupOrder(order, queryValue) {
        const box = el("lookup-result-box");
        const titleEl = el("lookup-status-title");
        const badgeEl = el("lookup-status-badge");
        const descEl = el("lookup-status-desc");
        const keyWrap = el("lookup-key-wrap");
        const keyCodeEl = el("lookup-issued-key");
        const pollNoteEl = el("lookup-poll-note");

        if (!box) return;
        box.className = "lookup-status show";

        if (!order) {
            stopLookupPolling();
            box.classList.add("notfound");
            titleEl.textContent = "No Matching License or Order Found";
            badgeEl.textContent = "Not Found";
            badgeEl.className = "mockup-tier-pill tier-free";
            descEl.textContent = `We could not find an active license or pending order matching "${queryValue}". Double-check your Email Address or Transaction ID (TrxID), or message support on WhatsApp (+8801580653736).`;
            keyWrap.style.display = "none";
            pollNoteEl.textContent = "";
            return;
        }

        const st = String(order.status || "pending").toLowerCase();
        if ((st === "approved" || st === "active") && order.issued_license_key) {
            stopLookupPolling();
            box.classList.add("approved");
            const ordAmt = String(order.amount || "");
            const ordCycle = String(order.billing_cycle || "").toLowerCase();
            const planName = (ordCycle === "yearly" || ordAmt.includes("Yearly") || ordAmt.includes("9590") || ordAmt.includes("96"))
                ? "Pro Yearly"
                : "Pro Monthly";
            titleEl.textContent = "License Ready — Payment Approved";
            badgeEl.textContent = "APPROVED";
            badgeEl.className = "mockup-tier-pill tier-pro";
            descEl.textContent = `Hi ${order.customer_name || "Creator"}, your ${planName} License key is active and ready to bind to 1 Mac or Windows PC.`;
            keyCodeEl.textContent = order.issued_license_key;
            keyWrap.style.display = "flex";
            pollNoteEl.textContent = `Order TrxID: ${order.trx_id || "-"} (${order.payment_method || planName})`;
            return;
        }

        if (st === "rejected") {
            stopLookupPolling();
            box.classList.add("rejected");
            titleEl.textContent = "Order Verification Declined";
            badgeEl.textContent = "REJECTED";
            badgeEl.className = "mockup-tier-pill tier-free";
            descEl.textContent = `Order TrxID "${order.trx_id || "-"}" could not be verified. Please check your transaction details or contact support.`;
            keyWrap.style.display = "none";
            pollNoteEl.textContent = "";
            return;
        }

        // Pending state: auto-refresh every 10 seconds
        box.classList.add("pending");
        titleEl.textContent = "Payment Verification in Progress (10-30 mins)...";
        badgeEl.textContent = "PENDING";
        badgeEl.className = "mockup-tier-pill tier-pro";
        descEl.textContent = `Hi ${order.customer_name || "Creator"}, we received your ${order.payment_method || "payment"} submission (TrxID: ${order.trx_id || "-"}). Leave this page open — your key will appear automatically once approved.`;
        keyWrap.style.display = "none";

        if (!pollTimer) {
            countdownSec = 10;
            pollNoteEl.textContent = `Auto-checking status in ${countdownSec}s...`;
            countdownTimer = setInterval(() => {
                countdownSec = Math.max(0, countdownSec - 1);
                if (pollNoteEl) pollNoteEl.textContent = `Auto-checking status in ${countdownSec}s...`;
            }, 1000);
            pollTimer = setInterval(() => {
                countdownSec = 10;
                performLookup(activeLookupQuery, true);
            }, 10000);
        }
    }

    async function performLookup(rawQuery, isSilent) {
        const q = String(rawQuery || "").trim();
        if (!q) {
            if (!isSilent) toast("Enter your Email Address or Transaction ID (TrxID).");
            return;
        }
        activeLookupQuery = q;
        const btn = el("btn-lookup-submit");
        if (btn && !isSilent) {
            btn.disabled = true;
            btn.textContent = "Checking...";
        }

        try {
            const safeVal = encodeURIComponent(q.replace(/[(),]/g, ""));

            // 1. Search licenses table first (Active Pro/Trial licenses live here)
            const licEndpoint = `/rest/v1/licenses?or=(customer_email.ilike.${safeVal},license_key.ilike.${safeVal})&order=created_at.desc&limit=5`;
            const licRows = await sbFetch("GET", licEndpoint);

            if (Array.isArray(licRows) && licRows.length > 0) {
                // Prioritize Pro active license if multiple found
                const bestLic = licRows.find(l => (l.plan === "pro" || !l.is_trial) && l.status === "active") ||
                                licRows.find(l => l.status === "active") ||
                                licRows[0];
                if (bestLic && bestLic.license_key) {
                    renderLookupLicense(bestLic, q);
                    return;
                }
            }

            // 2. Search orders table (Pending/Approved order submissions live here)
            const orderEndpoint = `/rest/v1/orders?or=(customer_email.ilike.${safeVal},trx_id.ilike.${safeVal})&order=created_at.desc&limit=1`;
            const orderRows = await sbFetch("GET", orderEndpoint);
            const order = Array.isArray(orderRows) && orderRows[0] ? orderRows[0] : null;

            renderLookupOrder(order, q);
        } catch (err) {
            if (!isSilent) toast("Lookup failed: " + err.message);
        } finally {
            if (btn && !isSilent) {
                btn.disabled = false;
                btn.textContent = "Check License Status";
            }
        }
    }

    // ==================== CHECKOUT MODAL & ORDERS SUBMISSION ====================
    let currentBillingCycle = "monthly"; // "monthly" | "yearly"
    const GUMROAD_MONTHLY_URL = ""; // Optional: e.g. "https://siyamstudio.gumroad.com/l/pro-monthly"
    const GUMROAD_YEARLY_URL = "";  // Optional: e.g. "https://siyamstudio.gumroad.com/l/pro-yearly"

    function setBillingCycle(cycle) {
        currentBillingCycle = cycle === "yearly" ? "yearly" : "monthly";
        const isYearly = currentBillingCycle === "yearly";

        // 1. Update Pricing section toggle buttons
        const monthlyBtn = el("billing-btn-monthly");
        const yearlyBtn = el("billing-btn-yearly");
        if (monthlyBtn) {
            monthlyBtn.classList.toggle("active", !isYearly);
            monthlyBtn.setAttribute("aria-selected", !isYearly ? "true" : "false");
        }
        if (yearlyBtn) {
            yearlyBtn.classList.toggle("active", isYearly);
            yearlyBtn.setAttribute("aria-selected", isYearly ? "true" : "false");
        }

        // 2. Update Pro Card
        const proTitle = el("pro-plan-title");
        const proBadge = el("pro-plan-badge");
        const proOldWrap = el("pro-old-price-wrap");
        const proPriceBig = el("pro-price-big");
        const proPriceAlt = el("pro-price-alt");
        const proCheckoutBtn = el("btn-pro-checkout");

        if (isYearly) {
            if (proTitle) proTitle.textContent = "Pro Yearly Plan";
            if (proBadge) {
                proBadge.textContent = "20% OFF — BEST VALUE";
                proBadge.className = "mockup-tier-pill tier-pro";
                proBadge.style.background = "linear-gradient(135deg, rgba(0, 230, 118, 0.25), rgba(0, 200, 83, 0.35))";
                proBadge.style.color = "#00ff66";
                proBadge.style.borderColor = "rgba(0, 230, 118, 0.6)";
            }
            if (proOldWrap) proOldWrap.style.display = "flex";
            if (proPriceBig) proPriceBig.innerHTML = '&#2547;9,590 BDT <span class="price-period" style="font-size: 14px; font-weight: 600; color: var(--text-muted);">/ year</span>';
            if (proPriceAlt) proPriceAlt.innerHTML = '<strong>$96 USD / year</strong> &bull; Only $8/mo &mdash; Save 20%!';
            if (proCheckoutBtn) proCheckoutBtn.textContent = "Get Pro Yearly (Save 20%)";
        } else {
            if (proTitle) proTitle.textContent = "Pro Monthly Plan";
            if (proBadge) {
                proBadge.textContent = "MOST POPULAR • ALL 12 TOOLS";
                proBadge.className = "mockup-tier-pill tier-pro";
                proBadge.style.background = "";
                proBadge.style.color = "";
                proBadge.style.borderColor = "";
            }
            if (proOldWrap) proOldWrap.style.display = "none";
            if (proPriceBig) proPriceBig.innerHTML = '&#2547;999 BDT <span class="price-period" style="font-size: 14px; font-weight: 600; color: var(--text-muted);">/ month</span>';
            if (proPriceAlt) proPriceAlt.textContent = "or $10 USD / month";
            if (proCheckoutBtn) proCheckoutBtn.textContent = "Get Pro Monthly";
        }

        // 3. Update Modal Billing Selector
        const modalMonthlyBtn = el("modal-billing-monthly");
        const modalYearlyBtn = el("modal-billing-yearly");
        if (modalMonthlyBtn) modalMonthlyBtn.classList.toggle("active", !isYearly);
        if (modalYearlyBtn) modalYearlyBtn.classList.toggle("active", isYearly);

        // 4. Update Modal Tabs & Content
        const modalTabBdBtn = el("modal-tab-bd-btn");
        const modalTabIntlBtn = el("modal-tab-intl-btn");
        if (modalTabBdBtn) {
            modalTabBdBtn.textContent = isYearly ? "Bangladesh (৳9,590 BDT / yr)" : "Bangladesh (৳999 BDT / mo)";
        }
        if (modalTabIntlBtn) {
            modalTabIntlBtn.textContent = isYearly ? "International ($96 USD / yr)" : "International ($10 USD / mo)";
        }

        // BD tab elements
        const bdPayAmount = el("bd-pay-amount");
        const bdSavingsBox = el("bd-yearly-savings");
        const bdSubmitBtn = el("btn-bd-submit");
        if (bdPayAmount) {
            bdPayAmount.textContent = isYearly ? "৳9,590 BDT / year" : "৳999 BDT / month";
        }
        if (bdSavingsBox) {
            bdSavingsBox.style.display = isYearly ? "flex" : "none";
        }
        if (bdSubmitBtn) {
            bdSubmitBtn.textContent = isYearly
                ? "Submit Payment & Request Key (৳9,590 BDT / year — Save 20%)"
                : "Submit Payment & Request Key (৳999 BDT / month)";
        }

        // Intl tab elements
        const intlPayTitle = el("intl-pay-title");
        const intlSavingsBox = el("intl-yearly-savings");
        const intlSubmitBtn = el("btn-intl-submit");
        if (intlPayTitle) {
            intlPayTitle.innerHTML = isYearly
                ? "<strong>Global Pro Yearly Access &mdash; $96 USD / Year (Save $24!)</strong>"
                : "<strong>Global Pro Monthly Access &mdash; $10 USD / Month</strong>";
        }
        if (intlSavingsBox) {
            intlSavingsBox.style.display = isYearly ? "flex" : "none";
        }
        if (intlSubmitBtn) {
            intlSubmitBtn.textContent = isYearly
                ? "Pay $96 USD / year (Save $24!)"
                : "Submit International Order ($10 USD / month)";
        }
    }

    function initCheckoutAndLookup() {
        const modal = el("checkout-modal");
        const closeBtn = el("btn-close-modal");
        const payTabBtns = document.querySelectorAll(".modal-tab-btn");
        const bdTab = el("checkout-tab-bd");
        const intlTab = el("checkout-tab-intl");
        const bdForm = el("bd-checkout-form");
        const intlForm = el("intl-checkout-form");
        const bdErr = el("bd-form-error");
        const intlErr = el("intl-form-error");

        const merchantNumEl = el("merchant-pay-number");
        if (merchantNumEl) merchantNumEl.textContent = MERCHANT_PAY_NUMBER;
        const copyMerchantBtn = el("btn-copy-merchant");
        if (copyMerchantBtn) {
            copyMerchantBtn.addEventListener("click", () => copyText(MERCHANT_PAY_NUMBER, "Payment number copied"));
        }

        // Initialize Pricing Billing Toggle Listeners
        const billingMonthlyBtn = el("billing-btn-monthly");
        const billingYearlyBtn = el("billing-btn-yearly");
        if (billingMonthlyBtn) {
            billingMonthlyBtn.addEventListener("click", () => setBillingCycle("monthly"));
        }
        if (billingYearlyBtn) {
            billingYearlyBtn.addEventListener("click", () => setBillingCycle("yearly"));
        }

        // Initialize Modal Billing Selector Listeners
        const modalBillingMonthlyBtn = el("modal-billing-monthly");
        const modalBillingYearlyBtn = el("modal-billing-yearly");
        if (modalBillingMonthlyBtn) {
            modalBillingMonthlyBtn.addEventListener("click", () => setBillingCycle("monthly"));
        }
        if (modalBillingYearlyBtn) {
            modalBillingYearlyBtn.addEventListener("click", () => setBillingCycle("yearly"));
        }

        function openModal(tabName) {
            if (!modal) return;
            setBillingCycle(currentBillingCycle); // sync modal state with current cycle
            modal.classList.add("open");
            if (tabName) switchPayTab(tabName);
        }

        function closeModal() {
            if (modal) modal.classList.remove("open");
        }

        function switchPayTab(tabName) {
            payTabBtns.forEach((b) => b.classList.toggle("active", b.dataset.paytab === tabName));
            if (bdTab) bdTab.style.display = tabName === "bd" ? "block" : "none";
            if (intlTab) intlTab.style.display = tabName === "intl" ? "block" : "none";
        }

        document.querySelectorAll("[data-open-checkout]").forEach((btn) => {
            btn.addEventListener("click", () => openModal(btn.dataset.openCheckout || "bd"));
        });
        if (closeBtn) closeBtn.addEventListener("click", closeModal);
        if (modal) {
            modal.addEventListener("click", (e) => {
                if (e.target === modal) closeModal();
            });
        }
        payTabBtns.forEach((btn) => {
            btn.addEventListener("click", () => switchPayTab(btn.dataset.paytab));
        });

        function handleSuccessOrder(trxId, email) {
            closeModal();
            const lookupInput = el("lookup-query-input");
            const targetQuery = trxId || email;
            if (lookupInput) lookupInput.value = targetQuery;
            const lookupSection = el("lookup");
            if (lookupSection) lookupSection.scrollIntoView({ behavior: "smooth" });
            stopLookupPolling();
            performLookup(targetQuery, false);
            toast("Order submitted! Tracking live license verification below.");
        }

        // Renewal Checkbox Toggles
        const bdIsRenewal = el("bd-is-renewal");
        const bdRenewalWrap = el("bd-renewal-input-wrap");
        if (bdIsRenewal && bdRenewalWrap) {
            bdIsRenewal.addEventListener("change", () => {
                bdRenewalWrap.style.display = bdIsRenewal.checked ? "block" : "none";
                if (bdIsRenewal.checked) {
                    const inp = el("bd-existing-key");
                    if (inp) inp.focus();
                }
            });
        }

        const intlIsRenewal = el("intl-is-renewal");
        const intlRenewalWrap = el("intl-renewal-input-wrap");
        if (intlIsRenewal && intlRenewalWrap) {
            intlIsRenewal.addEventListener("change", () => {
                intlRenewalWrap.style.display = intlIsRenewal.checked ? "block" : "none";
                if (intlIsRenewal.checked) {
                    const inp = el("intl-existing-key");
                    if (inp) inp.focus();
                }
            });
        }

        if (bdForm) {
            bdForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                bdErr.classList.remove("show");

                const name = el("bd-name").value.trim();
                const email = el("bd-email").value.trim();
                const method = el("bd-method").value;
                const phone = el("bd-phone").value.trim();
                const trxId = el("bd-trx").value.trim();
                const isRenewal = !!(bdIsRenewal && bdIsRenewal.checked);
                const existingKey = isRenewal ? (el("bd-existing-key") ? el("bd-existing-key").value.trim() : "") : null;

                if (!name || !email || !phone || !trxId) {
                    bdErr.textContent = "Please fill in your Name, Email, Sender Phone Number, and Transaction ID (TrxID).";
                    bdErr.classList.add("show");
                    return;
                }

                if (isRenewal && !existingKey) {
                    bdErr.textContent = "Please enter your existing license key to extend/renew.";
                    bdErr.classList.add("show");
                    return;
                }

                const submitBtn = el("btn-bd-submit");
                const isYearly = currentBillingCycle === "yearly";
                const orderAmount = isYearly ? "9590 BDT (Yearly - 20% OFF)" : "999 BDT (Monthly)";

                submitBtn.disabled = true;
                submitBtn.textContent = "Submitting Order...";

                try {
                    await sbFetch("POST", "/rest/v1/orders", {
                        customer_name: name,
                        customer_email: email,
                        payment_method: method,
                        sender_number: phone,
                        trx_id: trxId,
                        amount: orderAmount,
                        billing_cycle: currentBillingCycle,
                        order_type: isRenewal ? "renewal" : "new",
                        existing_license_key: existingKey || null,
                        status: "pending"
                    });
                    bdForm.reset();
                    if (bdRenewalWrap) bdRenewalWrap.style.display = "none";
                    handleSuccessOrder(trxId, email);
                } catch (err) {
                    bdErr.textContent = "Could not submit order: " + err.message;
                    bdErr.classList.add("show");
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = isYearly
                        ? "Submit Payment & Request Key (৳9,590 BDT / year — Save 20%)"
                        : "Submit Payment & Request Key (৳999 BDT / month)";
                }
            });
        }

        if (intlForm) {
            intlForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                intlErr.classList.remove("show");

                const name = el("intl-name").value.trim();
                const email = el("intl-email").value.trim();
                const method = el("intl-method").value;
                const ref = el("intl-ref").value.trim() || ("INTL-" + Date.now().toString(36).toUpperCase());
                const isRenewal = !!(intlIsRenewal && intlIsRenewal.checked);
                const existingKey = isRenewal ? (el("intl-existing-key") ? el("intl-existing-key").value.trim() : "") : null;

                if (!name || !email) {
                    intlErr.textContent = "Please enter your Name and Email Address.";
                    intlErr.classList.add("show");
                    return;
                }

                if (isRenewal && !existingKey) {
                    intlErr.textContent = "Please enter your existing license key to extend/renew.";
                    intlErr.classList.add("show");
                    return;
                }

                const submitBtn = el("btn-intl-submit");
                const isYearly = currentBillingCycle === "yearly";
                const orderAmount = isYearly ? "$96 USD (Yearly - 20% OFF)" : "$10 USD (Monthly)";

                if (isYearly && GUMROAD_YEARLY_URL) {
                    window.open(GUMROAD_YEARLY_URL, "_blank");
                } else if (!isYearly && GUMROAD_MONTHLY_URL) {
                    window.open(GUMROAD_MONTHLY_URL, "_blank");
                }

                submitBtn.disabled = true;
                submitBtn.textContent = "Submitting Order...";

                try {
                    await sbFetch("POST", "/rest/v1/orders", {
                        customer_name: name,
                        customer_email: email,
                        payment_method: method,
                        sender_number: "International",
                        trx_id: ref,
                        amount: orderAmount,
                        billing_cycle: currentBillingCycle,
                        order_type: isRenewal ? "renewal" : "new",
                        existing_license_key: existingKey || null,
                        status: "pending"
                    });
                    intlForm.reset();
                    if (intlRenewalWrap) intlRenewalWrap.style.display = "none";
                    handleSuccessOrder(ref, email);
                } catch (err) {
                    intlErr.textContent = "Could not submit order: " + err.message;
                    intlErr.classList.add("show");
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = isYearly
                        ? "Pay $96 USD / year (Save $24!)"
                        : "Submit International Order ($10 USD / month)";
                }
            });
        }

        const lookupForm = el("lookup-form");
        if (lookupForm) {
            lookupForm.addEventListener("submit", (e) => {
                e.preventDefault();
                stopLookupPolling();
                performLookup(el("lookup-query-input").value, false);
            });
        }

        const copyKeyBtn = el("btn-copy-issued-key");
        if (copyKeyBtn) {
            copyKeyBtn.addEventListener("click", () => {
                const key = el("lookup-issued-key").textContent.trim();
                copyText(key, "License key copied: " + key);
            });
        }
    }

    // Initialize all modules
    initHeroMapAnimator();
    initHeroSimulator();
    initBentoFilters();
    initFaqAccordion();
    initInstallTabs();
    syncDownloadLinksFromConfig();
    initDemoVideoModal();
    initChangelogModal();
    initMobileMenu();
    initScrollspy();
    initCheckoutAndLookup();
})();
