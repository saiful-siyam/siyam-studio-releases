(function () {
    "use strict";

    // Live Supabase Config
    const SUPABASE_URL = "https://llxpnjrujcpotvevpmzt.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxseHBuanJ1amNwb3R2ZXZwbXp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ0NjMwNTMsImV4cCI6MjExMDAzOTA1M30.RHJAt-XBbY3uMQsTFM3stT4Ko3dHVOC1Yeiet9qBsxQ";

    // Default downloadable installer packages (can be overridden by Supabase app_config if URLs are added)
    const DEFAULT_MAC_DOWNLOAD = "https://github.com/saiful-siyam/siyam-studio-releases/releases/latest/download/SiyamStudio_macOS_Installer.zip";
    const DEFAULT_WIN_DOWNLOAD = "https://github.com/saiful-siyam/siyam-studio-releases/releases/latest/download/SiyamStudio_Windows_64bit_Installer.zip";

    // Payment Merchant & Support Details
    const MERCHANT_PAY_NUMBER = "+8801580653736";
    const SUPPORT_EMAIL = "saifulsheum@gmail.com";
    const SUPPORT_WHATSAPP = "+8801580653736";

    const el = (id) => document.getElementById(id);

    const MOCKUP_TOOLS = {
        organizer: {
            title: "1-Click Project Organizer",
            tier: "PRO",
            tierClass: "tier-pro",
            desc: "Auto-sorts bins for Footage, Voiceover, SFX, Music, Graphics & Exports and mirrors them neatly to disk.",
            metricLabel: "Indexed 48 sequence assets across 6 smart bins",
            progress: 92,
            chips: ["01_Footage", "02_Voiceover", "03_Music_SFX", "04_MOGRTs", "05_Exports"],
            cta: "Organize Sequence"
        },
        stems: {
            title: "AI Music & Stem Separator",
            tier: "PRO",
            tierClass: "tier-pro",
            desc: "Isolates clean dialogue vocals and strips background copyright music locally with FFmpeg + Demucs DSP.",
            metricLabel: "Vocal clarity isolation confidence: 98.4%",
            progress: 86,
            chips: ["Vocals Only", "Instrumental", "Voice Ducking", "0ms Offset Sync"],
            cta: "Separate Audio Stems"
        },
        map: {
            title: "3D Documentary Map Animator",
            tier: "PRO",
            tierClass: "tier-pro",
            desc: "Generate smooth 3D camera flyovers, route trails, and country highlights straight onto your timeline.",
            metricLabel: "4K 60fps WebGL render queue ready",
            progress: 78,
            chips: ["Dark Satellite", "Route Arc", "Pin Callouts", "Auto-Import to Track"],
            cta: "Render 3D Flyover"
        },
        highlighter: {
            title: "3D Web & Text Highlighter",
            tier: "PRO",
            tierClass: "tier-pro",
            desc: "Capture any article or document and animate 3D tilted highlighter sweeps with realistic motion blur.",
            metricLabel: "3 highlight keyframes staged at 3840x2160",
            progress: 95,
            chips: ["Neon Yellow", "3D Perspective Tilt", "Depth Shadow", "Paper Grain"],
            cta: "Export 3D Highlight"
        },
        silence: {
            title: "High-Precision Silence Remover",
            tier: "FREE",
            tierClass: "tier-free",
            desc: "Detect dead air in voiceovers using adaptive FFmpeg dB thresholds and ripple-cut pauses in seconds.",
            metricLabel: "Removed 42 dead-air gaps (saved 1m 48s)",
            progress: 100,
            chips: ["-34 dB Threshold", "120ms Padding", "Ripple Edit", "Keep Breath Margin"],
            cta: "Trim Dead Air"
        },
        png: {
            title: "AI Cutout & PNG Maker",
            tier: "PRO",
            tierClass: "tier-pro",
            desc: "Instant subject cutouts, rim outlines, and clean studio drop shadows dropped directly on your timeline.",
            metricLabel: "Alpha channel mask edge accuracy: 99%",
            progress: 88,
            chips: ["Auto Subject Cutout", "White Sticker Border", "Drop Shadow", "Direct Import"],
            cta: "Create Cutout PNG"
        }
    };

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

    function initMockupTabs() {
        const tabs = document.querySelectorAll(".mockup-tab");
        const stageTitle = el("mockup-stage-title");
        const stageTier = el("mockup-stage-tier");
        const stageDesc = el("mockup-stage-desc");
        const metricLabel = el("mockup-metric-label");
        const progressFill = el("mockup-progress-fill");
        const chipsWrap = el("mockup-chips");
        const runBtn = el("mockup-run-btn");

        function selectTool(key) {
            const tool = MOCKUP_TOOLS[key];
            if (!tool) return;
            tabs.forEach((b) => b.classList.toggle("active", b.dataset.tool === key));
            if (stageTitle) stageTitle.textContent = tool.title;
            if (stageTier) {
                stageTier.textContent = tool.tier;
                stageTier.className = "mockup-tier-pill " + tool.tierClass;
            }
            if (stageDesc) stageDesc.textContent = tool.desc;
            if (metricLabel) metricLabel.textContent = tool.metricLabel;
            if (progressFill) progressFill.style.width = tool.progress + "%";
            if (chipsWrap) {
                chipsWrap.innerHTML = tool.chips.map((c) => `<span class="mockup-chip">${c}</span>`).join("");
            }
            if (runBtn) runBtn.textContent = tool.cta;
        }

        tabs.forEach((btn) => {
            btn.addEventListener("click", () => selectTool(btn.dataset.tool));
        });

        if (runBtn) {
            runBtn.addEventListener("click", () => {
                toast("Download Siyam Studio above to run this tool directly inside Premiere Pro.");
            });
        }
    }

    function initInstallTabs() {
        const tabBtns = document.querySelectorAll(".os-tab-btn");
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

        // Auto-detect visitor OS for convenience
        if (/Win/i.test(navigator.platform || navigator.userAgent || "")) {
            switchOs("win");
        }
    }

    async function syncDownloadLinksFromConfig() {
        const macBtn = el("btn-download-mac");
        const winBtn = el("btn-download-win");
        if (macBtn) macBtn.href = DEFAULT_MAC_DOWNLOAD;
        if (winBtn) winBtn.href = DEFAULT_WIN_DOWNLOAD;

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

            if (macBtn && macUrl) macBtn.href = macUrl;
            if (winBtn && winUrl) winBtn.href = winUrl;
            if (macBtn && !macUrl && cfg.download_url && /mac/i.test(cfg.download_url)) {
                macBtn.href = cfg.download_url;
            }
            if (winBtn && !winUrl && cfg.download_url && /win/i.test(cfg.download_url)) {
                winBtn.href = cfg.download_url;
            }
        } catch (e) {
            // Keep safe local release_packages paths on error
        }
    }

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
            titleEl.textContent = "No Matching Order Found";
            badgeEl.textContent = "Not Found";
            descEl.textContent = `We could not find an order matching "${queryValue}". Double-check your Email Address or Transaction ID (TrxID).`;
            keyWrap.style.display = "none";
            pollNoteEl.textContent = "";
            return;
        }

        const st = String(order.status || "pending").toLowerCase();
        if (st === "approved" && order.issued_license_key) {
            stopLookupPolling();
            box.classList.add("approved");
            titleEl.textContent = "License Ready — Payment Approved";
            badgeEl.textContent = "APPROVED";
            descEl.textContent = `Hi ${order.customer_name || "Creator"}, your Pro Lifetime License key is active and ready to bind to 1 Mac or Windows PC.`;
            keyCodeEl.textContent = order.issued_license_key;
            keyWrap.style.display = "flex";
            pollNoteEl.textContent = `Order TrxID: ${order.trx_id || "-"} (${order.payment_method || "Pro"})`;
            return;
        }

        if (st === "rejected") {
            stopLookupPolling();
            box.classList.add("rejected");
            titleEl.textContent = "Order Verification Declined";
            badgeEl.textContent = "REJECTED";
            descEl.textContent = `Order TrxID "${order.trx_id || "-"}" could not be verified. Please check your transaction details or contact support.`;
            keyWrap.style.display = "none";
            pollNoteEl.textContent = "";
            return;
        }

        // Pending state: auto-refresh every 10 seconds
        box.classList.add("pending");
        titleEl.textContent = "Payment Verification in Progress (10-30 mins)...";
        badgeEl.textContent = "PENDING";
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
            const endpoint = `/rest/v1/orders?or=(customer_email.ilike.${safeVal},trx_id.ilike.${safeVal})&order=created_at.desc&limit=1`;
            const rows = await sbFetch("GET", endpoint);
            const order = Array.isArray(rows) && rows[0] ? rows[0] : null;
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

        function openModal(tabName) {
            if (!modal) return;
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

        if (bdForm) {
            bdForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                bdErr.classList.remove("show");

                const name = el("bd-name").value.trim();
                const email = el("bd-email").value.trim();
                const method = el("bd-method").value;
                const phone = el("bd-phone").value.trim();
                const trxId = el("bd-trx").value.trim();

                if (!name || !email || !phone || !trxId) {
                    bdErr.textContent = "Please fill in your Name, Email, Sender Phone Number, and Transaction ID (TrxID).";
                    bdErr.classList.add("show");
                    return;
                }

                const submitBtn = el("btn-bd-submit");
                submitBtn.disabled = true;
                submitBtn.textContent = "Submitting Order...";

                try {
                    await sbFetch("POST", "/rest/v1/orders", {
                        customer_name: name,
                        customer_email: email,
                        payment_method: method,
                        sender_number: phone,
                        trx_id: trxId,
                        amount: "৳999 BDT",
                        status: "pending"
                    });
                    bdForm.reset();
                    handleSuccessOrder(trxId, email);
                } catch (err) {
                    bdErr.textContent = "Could not submit order: " + err.message;
                    bdErr.classList.add("show");
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Submit Payment & Request Key";
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

                if (!name || !email) {
                    intlErr.textContent = "Please enter your Name and Email Address.";
                    intlErr.classList.add("show");
                    return;
                }

                const submitBtn = el("btn-intl-submit");
                submitBtn.disabled = true;
                submitBtn.textContent = "Submitting Order...";

                try {
                    await sbFetch("POST", "/rest/v1/orders", {
                        customer_name: name,
                        customer_email: email,
                        payment_method: method,
                        sender_number: "International",
                        trx_id: ref,
                        amount: "$10 USD",
                        status: "pending"
                    });
                    intlForm.reset();
                    handleSuccessOrder(ref, email);
                } catch (err) {
                    intlErr.textContent = "Could not submit order: " + err.message;
                    intlErr.classList.add("show");
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Submit International Order ($10 USD)";
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

    initMockupTabs();
    initInstallTabs();
    syncDownloadLinksFromConfig();
    initCheckoutAndLookup();
})();
