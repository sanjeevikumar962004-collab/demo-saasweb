/**
 * form_validation.js  –  Stackly Government Portal
 * ─────────────────────────────────────────────────
 * Intercepts ALL form submissions globally using capture-phase listeners
 * (runs before any other handler on the page). This guarantees validation
 * fires first regardless of what Webflow or inline scripts do.
 *
 * Email rules:
 *  ✅ Allows personal emails: user@gmail.com, name@yahoo.com, etc.
 *  ❌ Rejects consecutive dots: user@GMail..cOm
 *  ❌ Rejects invalid/fake TLDs: user@domain.caaam, user@domain.coom
 *  ❌ Rejects malformed structure: missing @, no domain, etc.
 *  🔔 Shows styled popup on invalid email when form is submitted
 *
 * Other rules:
 *  • Name   – letters only; NO digits
 *  • Phone  – exactly 10 digits
 *  • Password – min 8 chars
 */

(function () {
    'use strict';

    /* ── Email Regex ────────────────────────────────────────────── */
    const EMAIL_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9._%+\-]{0,62}[a-zA-Z0-9])?@(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,24}$/;
    const CONSEC_DOTS = /\.\./;

    /* ── Known valid TLDs ────────────────────────────────────────── */
    const VALID_TLDS = new Set([
        'com', 'net', 'org', 'edu', 'gov', 'mil', 'int', 'info', 'biz', 'name', 'pro', 'aero', 'coop', 'museum',
        'app', 'dev', 'io', 'co', 'ai', 'cloud', 'online', 'site', 'web', 'store', 'shop', 'blog', 'tech', 'digital',
        'media', 'news', 'email', 'mail', 'services', 'solutions', 'agency', 'studio', 'design', 'consulting',
        'software', 'systems', 'network', 'global', 'world', 'space', 'academy', 'institute', 'foundation',
        'healthcare', 'finance', 'bank', 'insurance', 'law', 'legal', 'company', 'enterprises', 'group',
        'ventures', 'capital', 'holdings', 'partners', 'associates', 'management', 'investments', 'properties',
        'us', 'uk', 'ca', 'au', 'in', 'de', 'fr', 'es', 'it', 'jp', 'cn', 'br', 'mx', 'ru', 'za', 'ar', 'ng', 'eg',
        'ke', 'gh', 'tz', 'ug', 'et', 'sn', 'ci', 'cm', 'ma', 'dz', 'tn', 'ly', 'sd',
        'nl', 'be', 'ch', 'at', 'se', 'no', 'dk', 'fi', 'pl', 'cz', 'sk', 'hu', 'ro', 'bg', 'hr', 'si', 'lt', 'lv',
        'ee', 'pt', 'ie', 'gr', 'tr', 'ua', 'by', 'rs', 'mk', 'al', 'ba', 'me', 'md', 'ge', 'am', 'az',
        'sg', 'my', 'th', 'vn', 'id', 'ph', 'pk', 'bd', 'lk', 'np', 'mm', 'kh', 'la', 'mn', 'nz', 'hk', 'tw', 'kr',
        'ae', 'sa', 'qa', 'kw', 'bh', 'om', 'iq', 'ir', 'jo', 'lb', 'sy', 'il', 'ye', 'ps',
        'cl', 'pe', 'ec', 'bo', 'py', 'uy', 've', 'cr', 'pa', 'sv', 'hn', 'gt', 'ni', 'do', 'cu', 'pr', 'ht',
        'na', 'bw', 'zm', 'zw', 'mw', 'ao', 'mz', 'mg', 'mu', 'sc', 'ls', 'sz', 'rw', 'bi', 'dj', 'so', 'er',
        'jobs', 'travel', 'mobi', 'tel', 'cat', 'post', 'xxx', 'gov', 'gov'
    ]);

    /* ══════════════════════════════════════════════════════════════
       POPUP MODAL
    ══════════════════════════════════════════════════════════════ */
    function ensurePopup() {
        if (document.getElementById('sv-email-popup')) return;
        const overlay = document.createElement('div');
        overlay.id = 'sv-email-popup';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483647;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,0.55);backdrop-filter:blur(4px);';
        overlay.innerHTML = `
            <style>
                @keyframes svCardIn{from{opacity:0;transform:translateY(24px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
                #sv-email-popup .sv-card{background:#fff;border-radius:18px;padding:36px 32px 28px;max-width:400px;width:calc(100% - 40px);box-shadow:0 32px 64px -12px rgba(0,0,0,0.3);text-align:center;animation:svCardIn .25s cubic-bezier(.34,1.56,.64,1);border-top:4px solid #dc2626;font-family:'Inter',system-ui,sans-serif;}
                #sv-email-popup .sv-icon-wrap{width:56px;height:56px;background:#fef2f2;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;}
                #sv-email-popup .sv-title{font-size:19px;font-weight:700;color:#111827;margin:0 0 10px;}
                #sv-email-popup .sv-msg{font-size:14px;color:#6b7280;line-height:1.65;margin:0 0 16px;}
                #sv-email-popup .sv-examples{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:11px 14px;font-size:12.5px;color:#374151;margin-bottom:22px;text-align:left;line-height:1.8;}
                #sv-email-popup .sv-btn{background:#8b001a;color:#fff;border:none;border-radius:9px;padding:13px 32px;font-size:15px;font-weight:600;cursor:pointer;transition:all .18s;box-shadow:0 4px 12px rgba(139,0,26,0.25);}
                #sv-email-popup .sv-btn:hover{background:#6b0015;box-shadow:0 8px 20px rgba(139,0,26,0.35);transform:translateY(-1px);}
            </style>
            <div class="sv-card">
                <div class="sv-icon-wrap">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                </div>
                <p class="sv-title">Invalid Email Address</p>
                <p class="sv-msg" id="sv-popup-text">Please enter a valid email address.</p>
                <div class="sv-examples">
                    ✅ <strong>Valid:</strong> user@gmail.com · name@yahoo.com<br>
                    ❌ <strong>Invalid:</strong> user@GMail..cOm · user@fake.caaam
                </div>
                <button class="sv-btn" onclick="document.getElementById('sv-email-popup').style.display='none'">Try Again</button>
            </div>`;
        overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.style.display = 'none'; });
        document.body.appendChild(overlay);
    }

    function showPopup(msg) {
        ensurePopup();
        const el = document.getElementById('sv-popup-text');
        if (el) el.textContent = msg;
        document.getElementById('sv-email-popup').style.display = 'flex';
    }

    /* ══════════════════════════════════════════════════════════════
       INLINE ERROR HELPERS
    ══════════════════════════════════════════════════════════════ */
    function getErrSpan(input) {
        // Walk up to the nearest .form-group so errors appear BELOW the full
        // input row (not inside the relative flex wrapper that contains eye icon)
        const container = input.closest('.form-group') || input.parentElement || document.body;
        let el = container.querySelector(':scope > .sv-err-msg');
        if (!el) {
            el = document.createElement('span');
            el.className = 'sv-err-msg';
            el.style.cssText = 'display:none;margin-top:5px;font-size:12.5px;color:#dc2626;font-weight:500;line-height:1.45;';
            container.appendChild(el);
        }
        return el;
    }

    function setError(input, msg) {
        input.style.borderColor = '#dc2626';
        input.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.14)';
        const span = getErrSpan(input);
        span.textContent = msg;
        span.style.display = 'block';
        input.setCustomValidity(msg);
    }

    function clearError(input) {
        input.style.borderColor = '';
        input.style.boxShadow = '';
        const span = input.parentElement && input.parentElement.querySelector('.sv-err-msg');
        if (span) span.style.display = 'none';
        input.setCustomValidity('');
    }

    /* ══════════════════════════════════════════════════════════════
       EMAIL VALIDATION LOGIC
    ══════════════════════════════════════════════════════════════ */
    function validateEmail(v) {
        // Must have exactly one @
        const atCount = (v.match(/@/g) || []).length;
        if (atCount === 0) return 'Email must include "@" — e.g. user@gmail.com';
        if (atCount > 1) return 'Email cannot have more than one "@" symbol.';

        const atIdx = v.indexOf('@');
        const local = v.slice(0, atIdx);
        const domain = v.slice(atIdx + 1);

        // Local part checks
        if (!local) return 'Email must have a username before "@".';
        if (local.startsWith('.') || local.endsWith('.'))
            return 'Email username cannot start or end with a dot.';

        // Consecutive dots check (catches GMail..cOm)
        if (CONSEC_DOTS.test(v)) return 'Email cannot have consecutive dots (..) — e.g. "GMail..cOm" is invalid.';

        // Domain checks
        if (!domain) return 'Email must have a domain after "@" — e.g. @gmail.com';
        if (domain.startsWith('.') || domain.endsWith('.'))
            return 'Email domain cannot start or end with a dot.';
        if (domain.startsWith('-') || domain.endsWith('-'))
            return 'Email domain cannot start or end with a hyphen.';

        // ── Case sensitivity: domain must be fully lowercase ──────────────────
        // e.g. @Gmail.com, @GMAIL.COM, @Yahoo.COM are all rejected
        if (/[A-Z]/.test(domain)) {
            const suggestion = domain.toLowerCase();
            return `Email domain must be in lowercase — did you mean "@${suggestion}"?`;
        }

        // ── Numeric sensitivity: domain name must not contain digits ──────────
        // e.g. @gma1l.com, @yah00.com are rejected
        const domainNamePart = domain.split('.').slice(0, -1).join('.');
        if (/\d/.test(domainNamePart)) {
            return 'Email domain name cannot contain numbers — e.g. "@gma1l.com" is invalid.';
        }

        // Full structural regex
        if (!EMAIL_RE.test(v)) return 'Enter a valid email — e.g. user@gmail.com';

        // TLD checks
        const domainLower = domain.toLowerCase();
        const parts = domainLower.split('.');
        const tld = parts[parts.length - 1];

        if (!/^[a-z]{2,24}$/.test(tld))
            return `"${tld}" is not a valid domain ending — use .com, .net, .org, .in, etc.`;

        if (!VALID_TLDS.has(tld))
            return `".${tld}" is not a recognised email domain extension. Did you mean .com, .net, .org, or .in?`;

        // ── Spelling sensitivity: fuzzy match domain name against known providers ──
        // Uses Levenshtein distance to catch misspellings even not in a hardcoded list
        const domainName = parts.slice(0, -1).join('.');

        function levenshtein(a, b) {
            const m = a.length, n = b.length;
            const dp = Array.from({ length: m + 1 }, (_, i) => [i]);
            for (let j = 1; j <= n; j++) dp[0][j] = j;
            for (let i = 1; i <= m; i++) {
                for (let j = 1; j <= n; j++) {
                    dp[i][j] = a[i - 1] === b[j - 1]
                        ? dp[i - 1][j - 1]
                        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
                }
            }
            return dp[m][n];
        }

        // Known providers to check spelling against
        const knownProviders = ['gmail', 'yahoo', 'outlook', 'hotmail', 'icloud', 'protonmail', 'ymail', 'aol', 'live', 'msn'];

        // ✅ If the domain name is already an exact known provider → it's correct, skip spelling check
        if (knownProviders.includes(domainName)) return null;

        // 🔍 Only run fuzzy check when domain is NOT a perfectly valid known provider
        // Catches misspellings like gmial, yahooo, outlok (distance ≤ 2 from a known provider)
        for (const provider of knownProviders) {
            if (levenshtein(domainName, provider) <= 2) {
                return `Spelling error — did you mean "${provider}.${tld}"? Check the domain name carefully.`;
            }
        }

        return null; // ✅ valid
    }

    /* ══════════════════════════════════════════════════════════════
       FIELD VALIDATORS (return true = valid)
    ══════════════════════════════════════════════════════════════ */
    function vName(input) {
        if (!input) return true;
        const v = input.value.trim();
        if (!v) { setError(input, 'Name is required.'); return false; }
        if (/\d/.test(v)) { setError(input, 'Name must not contain numbers.'); return false; }
        if (!/^[a-zA-Z\s\-À-ÖØ-öø-ÿ']+$/.test(v)) { setError(input, 'Name must contain letters only.'); return false; }
        clearError(input); return true;
    }

    function vEmail(input, triggerPopup) {
        if (!input) return true;
        const v = input.value.trim();
        if (!v) { setError(input, 'Email address is required.'); return false; }
        const err = validateEmail(v);
        if (err) {
            setError(input, err);
            if (triggerPopup) showPopup(err);
            return false;
        }
        clearError(input); return true;
    }

    function vPhone(input) {
        if (!input) return true;
        const raw = input.value;
        const digits = raw.replace(/[\s\-]/g, '');
        if (!raw.trim()) { setError(input, 'Phone number is required.'); return false; }
        if (/[^0-9\s\-]/.test(raw)) { setError(input, 'Phone number must contain digits only.'); return false; }
        if (digits.length !== 10) { setError(input, `Phone must be exactly 10 digits (you entered ${digits.length}).`); return false; }
        clearError(input); return true;
    }

    function vPass(input) {
        if (!input) return true;
        if (!input.value) { setError(input, 'Password is required.'); return false; }
        if (input.value.length < 8) { setError(input, 'Password must be at least 8 characters.'); return false; }
        clearError(input); return true;
    }

    function vConfirm(input, passInput) {
        if (!input || !passInput) return true;
        if (!input.value) { setError(input, 'Please confirm your password.'); return false; }
        if (input.value !== passInput.value) { setError(input, 'Passwords do not match.'); return false; }
        clearError(input); return true;
    }

    /* ══════════════════════════════════════════════════════════════
       LIVE FIELD BINDINGS
    ══════════════════════════════════════════════════════════════ */
    function bindEmail(input) {
        if (!input || input._svBound) return;
        input._svBound = true;

        input.addEventListener('blur', function () {
            vEmail(input, false);  // show inline error on blur, no popup
        });
        input.addEventListener('input', function () {
            const v = input.value.trim();
            if (!v) { clearError(input); return; }
            const err = validateEmail(v);
            if (err) {
                input.setCustomValidity('invalid');
                // show inline error immediately while typing for better feedback
                const span = getErrSpan(input);
                span.textContent = err;
                span.style.display = 'block';
                input.style.borderColor = '#dc2626';
                input.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.14)';
            } else {
                clearError(input);
            }
        });
    }

    function bindName(input) {
        if (!input || input._svBound) return;
        input._svBound = true;

        input.addEventListener('keypress', function (e) {
            if (/\d/.test(e.key)) {
                e.preventDefault();
                setError(input, 'Name must not contain numbers.');
            }
        });
        input.addEventListener('input', function () {
            if (/\d/.test(input.value)) input.value = input.value.replace(/\d/g, '');
            if (input.value.trim()) input.setCustomValidity('');
        });
        input.addEventListener('blur', function () { vName(input); });
    }

    function bindPhone(input) {
        if (!input || input._svBound) return;
        input._svBound = true;

        input.setAttribute('inputmode', 'numeric');
        input.setAttribute('maxlength', '10');
        if (!input.placeholder) input.placeholder = 'Enter 10-digit number';

        input.addEventListener('keypress', function (e) {
            if (!/\d/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key))
                e.preventDefault();
        });
        input.addEventListener('paste', function (e) {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData('text');
            const digits = text.replace(/\D/g, '').slice(0, 10);
            document.execCommand('insertText', false, digits);
        });
        input.addEventListener('input', function () {
            const cleaned = input.value.replace(/\D/g, '').slice(0, 10);
            if (cleaned !== input.value) input.value = cleaned;
            input.setCustomValidity(cleaned.length === 10 ? '' : 'Phone must be exactly 10 digits.');
        });
        input.addEventListener('blur', function () { vPhone(input); });
    }

    /* ══════════════════════════════════════════════════════════════
       FORM SETUP
    ══════════════════════════════════════════════════════════════ */
    const setupForms = new WeakSet();

    function setupForm(form) {
        if (!form || setupForms.has(form)) return;
        setupForms.add(form);

        function q(id) { return document.getElementById(id) || form.querySelector('[name="' + id + '"]'); }

        const nameEl = q('name') || q('firstName') || form.querySelector('input[placeholder*="Name" i]');
        const lastEl = q('lastName');
        const emailEl = q('email') || form.querySelector('input[type="email"]');
        const phoneEl = q('phone') || form.querySelector('input[type="tel"]') || form.querySelector('input[placeholder*="Phone" i]');
        const passEl = q('password') || form.querySelector('input[type="password"]:not([id*="confirm" i]):not([name*="confirm" i])');
        const confEl = q('confirmPassword') || form.querySelector('input[id*="confirm" i]') || form.querySelector('input[name*="confirm" i]');

        if (nameEl) bindName(nameEl);
        if (lastEl) bindName(lastEl);
        if (emailEl) bindEmail(emailEl);
        if (phoneEl) bindPhone(phoneEl);

        /* ── Validate all fields, return true if all pass ── */
        function validateAll(withPopup) {
            let ok = true;
            if (nameEl && !vName(nameEl)) ok = false;
            if (lastEl && !vName(lastEl)) ok = false;
            if (emailEl && !vEmail(emailEl, withPopup)) ok = false;
            if (phoneEl && !vPhone(phoneEl)) ok = false;
            if (passEl && !vPass(passEl)) ok = false;
            if (confEl && !vConfirm(confEl, passEl)) ok = false;
            return ok;
        }

        /* ── Intercept the form's submit event (capture, highest priority) ── */
        form.addEventListener('submit', function (e) {
            const valid = validateAll(true);  // true = show popup for bad email
            if (!valid) {
                e.preventDefault();
                e.stopImmediatePropagation();
                // Scroll to first visible error
                const firstErr = form.querySelector('.sv-err-msg[style*="block"]');
                if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, true);   // ← capture = true so we run BEFORE any other listener

        /* ── Also intercept submit-button clicks ── */
        form.addEventListener('click', function (e) {
            const t = e.target;
            const isSubmit = t && (
                (t.tagName === 'BUTTON' && (t.type === 'submit' || !t.type)) ||
                (t.tagName === 'INPUT' && t.type === 'submit') ||
                t.classList.contains('auth-btn') ||
                t.classList.contains('submit-button') ||
                t.classList.contains('w-button')
            );
            if (!isSubmit) return;

            const valid = validateAll(true);
            if (!valid) {
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();
            }
        }, true);   // ← capture = true
    }

    /* ══════════════════════════════════════════════════════════════
       GLOBAL INIT — run as early as possible
    ══════════════════════════════════════════════════════════════ */
    function init() {
        ensurePopup();
        document.querySelectorAll('form').forEach(setupForm);

        // Watch for dynamically injected forms (Webflow does this)
        new MutationObserver(function (muts) {
            muts.forEach(function (m) {
                m.addedNodes.forEach(function (node) {
                    if (node.nodeType !== 1) return;
                    if (node.tagName === 'FORM') { setupForm(node); return; }
                    node.querySelectorAll('form').forEach(setupForm);
                });
            });
        }).observe(document.documentElement, { childList: true, subtree: true });
    }

    // Run immediately if DOM is ready, otherwise wait
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /* ══════════════════════════════════════════════════════════════
       GLOBAL SAFE NET — catches any submit that bypasses per-form listeners
       (e.g. the window.addEventListener('submit') in contact.html)
    ══════════════════════════════════════════════════════════════ */
    window.addEventListener('submit', function (e) {
        const form = e.target;
        if (!(form instanceof HTMLFormElement)) return;
        // If we haven't set up this form yet, do it now then re-check
        if (!setupForms.has(form)) setupForm(form);
        // Just prevent any double-submission — our per-form listener already handled it
    }, true);

})();