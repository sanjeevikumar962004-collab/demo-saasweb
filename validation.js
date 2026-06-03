/**
 * Bildium - Global Premium Form Validation & Newsletter System
 * Handles real-time field validation (name, email, 10-digit phone, message, search)
 * and premium modal success overlays for both enquiries and newsletter signups.
 * Includes a global click navigator to automatically route all non-essential actions to 404.html.
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Inject Premium Validation CSS Styles Dynamically
    const style = document.createElement("style");
    style.textContent = `
        /* Live Validation Styling */
        .form-group {
            position: relative;
            margin-bottom: 2rem !important; /* Premium responsive layout flow */
            display: flex;
            flex-direction: column;
        }
        
        @media (max-width: 768px) {
            .form-group {
                margin-bottom: 1.5rem !important;
            }
        }
        
        .form-group input, 
        .form-group select, 
        .form-group textarea {
            transition: border-color 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), 
                        box-shadow 0.4s cubic-bezier(0.165, 0.84, 0.44, 1),
                        background-color 0.3s ease !important;
            width: 100%;
        }

        .form-group.is-valid input,
        .form-group.is-valid textarea {
            border-color: #A3D9C9 !important; /* Soft premium green border */
            background-color: #FCFDFB !important;
            box-shadow: 0 4px 12px rgba(163, 217, 201, 0.15) !important;
        }

        .form-group.is-invalid input,
        .form-group.is-invalid textarea {
            border-color: #E07A5F !important; /* Soft luxury terracotta red */
            background-color: #FFFDFD !important;
            box-shadow: 0 4px 12px rgba(224, 122, 95, 0.15) !important;
        }

        /* Error Label styling - Non-absolute block elements for full responsiveness and alignment */
        .validation-error {
            display: block;
            font-size: 0.75rem;
            font-weight: 600;
            color: #E07A5F;
            margin-top: 0;
            opacity: 0;
            max-height: 0;
            overflow: hidden;
            transform: translateY(-5px);
            transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
            pointer-events: none;
            font-family: 'Plus Jakarta Sans', sans-serif;
            text-align: left;
            width: 100%;
            word-break: break-word;
            box-sizing: border-box;
        }

        .form-group.is-invalid .validation-error {
            opacity: 1;
            max-height: 80px; /* Allow up to 3-4 lines of text on mobile without overflow */
            margin-top: 0.5rem;
            transform: translateY(0);
        }

        /* Newsletter Custom Error Styles */
        .newsletter-form {
            position: relative;
            transition: border-color 0.4s ease, box-shadow 0.4s ease !important;
        }
        
        .newsletter-form.is-invalid {
            border-color: #E07A5F !important;
            box-shadow: 0 4px 15px rgba(224, 122, 95, 0.3) !important;
        }
        
        .newsletter-form.is-valid {
            border-color: #A3D9C9 !important;
            box-shadow: 0 4px 15px rgba(163, 217, 201, 0.3) !important;
        }
        
        .newsletter-error-message {
            color: #E07A5F;
            font-size: 0.8rem;
            font-weight: 600;
            margin-top: 0.8rem;
            text-align: center;
            font-family: 'Plus Jakarta Sans', sans-serif;
            display: none;
        }
        
        .newsletter-form.is-invalid + .newsletter-error-message {
            display: block;
        }

        /* Search Box Custom Validation Styles */
        .search-box input {
            transition: border-color 0.4s ease, box-shadow 0.4s ease, background-color 0.4s ease !important;
        }
        
        .search-box input.is-invalid {
            border-color: #E07A5F !important;
            box-shadow: 0 4px 15px rgba(224, 122, 95, 0.3) !important;
            background-color: #FFFDFD !important;
        }
        
        .search-box input.is-valid {
            border-color: #A3D9C9 !important;
            box-shadow: 0 4px 15px rgba(163, 217, 201, 0.3) !important;
            background-color: #FCFDFB !important;
        }

        /* Premium Success Modal Overlay */
        .success-overlay {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100vh;
            background: rgba(17, 17, 17, 0.95);
            backdrop-filter: blur(15px);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
        }

        .success-overlay.is-active {
            opacity: 1;
            pointer-events: all;
        }

        .success-card {
            background: #FFFFFF;
            width: 90%;
            max-width: 450px;
            padding: 3.5rem 2.5rem;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 40px 80px rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.1);
            transform: scale(0.8) translateY(20px);
            transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .success-overlay.is-active .success-card {
            transform: scale(1) translateY(0);
        }

        .success-icon-wrap {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: rgba(236, 174, 58, 0.1);
            color: #ECAE3A;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 2rem;
            position: relative;
        }

        .success-icon-wrap svg {
            width: 40px;
            height: 40px;
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
            transition: stroke-dashoffset 0.8s ease 0.3s;
        }

        .success-overlay.is-active svg {
            stroke-dashoffset: 0;
        }

        .success-card h3 {
            font-family: 'Outfit', sans-serif;
            font-size: 1.8rem;
            color: #111111;
            margin-bottom: 1rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .success-card p {
            font-family: 'Plus Jakarta Sans', sans-serif;
            color: #555555;
            font-size: 0.95rem;
            line-height: 1.6;
            margin-bottom: 2rem;
        }

        .success-close-btn {
            background: #111111;
            color: #FFFFFF;
            border: none;
            padding: 1rem 2.5rem;
            font-family: 'Outfit', sans-serif;
            font-weight: 700;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            cursor: pointer;
            transition: all 0.3s ease;
            width: 100%;
        }

        .success-close-btn:hover {
            background: #ECAE3A;
            color: #111111;
        }
    `;
    document.head.appendChild(style);

    // 2. Build Success Modal Overlay Markup for Enquiries
    const enquiryOverlay = document.createElement("div");
    enquiryOverlay.className = "success-overlay";
    enquiryOverlay.id = "submit-success-overlay";
    enquiryOverlay.innerHTML = `
        <div class="success-card">
            <div class="success-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
            <h3>Blueprint Confirmed</h3>
            <p>Your estimator briefing has been logged. Our structural coordinators will contact you shortly with a precision raw spatial forecast.</p>
            <button class="success-close-btn" id="success-close-btn">Return to Grid</button>
        </div>
    `;
    document.body.appendChild(enquiryOverlay);

    const closeBtn = document.getElementById("success-close-btn");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            enquiryOverlay.classList.remove("is-active");
            document.body.style.overflow = "";
        });
    }

    // 3. Build Success Modal Overlay Markup for Newsletter Subscription
    const newsletterOverlay = document.createElement("div");
    newsletterOverlay.className = "success-overlay";
    newsletterOverlay.id = "newsletter-success-overlay";
    newsletterOverlay.innerHTML = `
        <div class="success-card">
            <div class="success-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
            <h3>Digest Engaged</h3>
            <p>Your subscription to our engineering digest is active in our central coordinator registry. Welcome to the grid!</p>
            <button class="success-close-btn" id="newsletter-close-btn">Return to Grid</button>
        </div>
    `;
    document.body.appendChild(newsletterOverlay);

    const newsletterCloseBtn = document.getElementById("newsletter-close-btn");
    if (newsletterCloseBtn) {
        newsletterCloseBtn.addEventListener("click", () => {
            newsletterOverlay.classList.remove("is-active");
            document.body.style.overflow = "";
        });
    }

    // ================= ENQUIRY / CONTACT FORMS VALIDATION =================
    const forms = document.querySelectorAll("#contact-form");
    forms.forEach(form => {
        const fields = {
            firstName: {
                el: form.querySelector("#first-name"),
                validate: (val) => {
                    if (!val || val.trim().length < 2) return "First name must be at least 2 characters.";
                    if (!/^[a-zA-Z\s]+$/.test(val)) return "Name must contain only alphabetical characters.";
                    return "";
                }
            },
            lastName: {
                el: form.querySelector("#last-name"),
                validate: (val) => {
                    if (!val || val.trim().length < 2) return "Last name must be at least 2 characters.";
                    if (!/^[a-zA-Z\s]+$/.test(val)) return "Name must contain only alphabetical characters.";
                    return "";
                }
            },
            email: {
                el: form.querySelector("#work-email"),
                validate: (val) => {
                    if (!val) return "Email address is required.";
                    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                    if (!emailRegex.test(val)) return "Please enter a valid email address.";
                    return "";
                }
            },
            message: {
                el: form.querySelector("#message"),
                validate: (val) => {
                    if (!val || val.trim().length < 10) return "Please provide at least 10 characters detailing your build requirements.";
                    return "";
                }
            }
        };

        // Attach dynamic feedback UI and handlers
        Object.keys(fields).forEach(key => {
            const fieldObj = fields[key];
            const input = fieldObj.el;
            if (!input) return;

            const parent = input.parentElement;
            
            // Add absolute validation-error label if not present
            let errorSpan = parent.querySelector(".validation-error");
            if (!errorSpan) {
                errorSpan = document.createElement("span");
                errorSpan.className = "validation-error";
                parent.appendChild(errorSpan);
            }

            // Live Validation on input & blur
            const triggerValidation = () => {
                const errorMsg = fieldObj.validate(input.value);
                if (errorMsg) {
                    parent.classList.remove("is-valid");
                    parent.classList.add("is-invalid");
                    errorSpan.textContent = errorMsg;
                } else {
                    parent.classList.remove("is-invalid");
                    parent.classList.add("is-valid");
                    errorSpan.textContent = "";
                }
                return !errorMsg;
            };

            input.addEventListener("input", triggerValidation);
            input.addEventListener("blur", triggerValidation);
            
            // Store trigger function on input elements for form check
            input.triggerValidation = triggerValidation;
        });

        // Form Submit handling
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            let isFormValid = true;
            Object.keys(fields).forEach(key => {
                const fieldObj = fields[key];
                if (fieldObj.el && typeof fieldObj.el.triggerValidation === "function") {
                    const isValid = fieldObj.el.triggerValidation();
                    if (!isValid) isFormValid = false;
                }
            });

            if (isFormValid) {
                // Save briefing to localStorage dynamically for dashboards
                const name = (fields.firstName.el ? fields.firstName.el.value : "") + " " + (fields.lastName.el ? fields.lastName.el.value : "");
                const email = fields.email.el ? fields.email.el.value : "";
                const message = fields.message.el ? fields.message.el.value : "";

                const briefings = JSON.parse(localStorage.getItem("estimatorBriefings") || "[]");
                briefings.unshift({
                    name: name.trim(),
                    email: email,
                    message: message,
                    date: new Date().toLocaleDateString(),
                    status: "Confirmed"
                });
                localStorage.setItem("estimatorBriefings", JSON.stringify(briefings));

                // Reset form fields
                form.reset();
                Object.keys(fields).forEach(key => {
                    if (fields[key].el) {
                        const parent = fields[key].el.parentElement;
                        parent.classList.remove("is-valid", "is-invalid");
                    }
                });

                // Navigate directly to 404.html as requested
                window.location.href = "404.html";
            } else {
                // Shake first invalid group to draw attention
                const firstInvalid = form.querySelector(".is-invalid");
                if (firstInvalid) {
                    firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
                    
                    // Trigger subtle shake micro-animation
                    firstInvalid.style.transform = "translateX(10px)";
                    setTimeout(() => firstInvalid.style.transform = "translateX(-10px)", 70);
                    setTimeout(() => firstInvalid.style.transform = "translateX(5px)", 140);
                    setTimeout(() => firstInvalid.style.transform = "translateX(-5px)", 210);
                    setTimeout(() => firstInvalid.style.transform = "translateX(0)", 280);
                }
            }
        });
    });

    // ================= NEWSLETTER SUBSCRIPTION FORMS VALIDATION =================
    const newsletterForms = document.querySelectorAll(".newsletter-form");
    newsletterForms.forEach(form => {
        const input = form.querySelector("input[type='email']");
        if (!input) return;

        // Inject error message element right after form
        let errorMsgDiv = form.nextElementSibling;
        if (!errorMsgDiv || !errorMsgDiv.classList.contains("newsletter-error-message")) {
            errorMsgDiv = document.createElement("div");
            errorMsgDiv.className = "newsletter-error-message";
            errorMsgDiv.textContent = "Please enter a valid, strict email address (e.g., corporate@domain.com).";
            form.parentNode.insertBefore(errorMsgDiv, form.nextSibling);
        }

        const validateEmail = (val) => {
            if (!val) return "Email address is required.";
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(val)) return "Invalid email address.";
            return "";
        };

        const triggerValidation = () => {
            const error = validateEmail(input.value.trim());
            if (error) {
                form.classList.remove("is-valid");
                form.classList.add("is-invalid");
                return false;
            } else {
                form.classList.remove("is-invalid");
                form.classList.add("is-valid");
                return true;
            }
        };

        input.addEventListener("input", triggerValidation);
        input.addEventListener("blur", triggerValidation);

        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const isValid = triggerValidation();

            if (isValid) {
                // Reset form
                form.reset();
                form.classList.remove("is-valid", "is-invalid");

                // Navigate directly to 404.html as requested
                window.location.href = "404.html";
            } else {
                // Shake form to draw attention
                form.style.transform = "translateX(10px)";
                setTimeout(() => form.style.transform = "translateX(-10px)", 70);
                setTimeout(() => form.style.transform = "translateX(5px)", 140);
                setTimeout(() => form.style.transform = "translateX(-5px)", 210);
                setTimeout(() => form.style.transform = "translateX(0)", 280);
            }
        });
    });

    // ================= SEARCH BOX VALIDATION =================
    const searchForm = document.getElementById("search-journal-form");
    if (searchForm) {
        const searchInput = document.getElementById("search-input");
        const searchBox = searchForm.querySelector(".search-box");

        if (searchInput && searchBox) {
            const validateSearch = () => {
                const val = searchInput.value.trim();
                if (!val || val.length < 3) {
                    searchInput.classList.remove("is-valid");
                    searchInput.classList.add("is-invalid");
                    return false;
                } else {
                    searchInput.classList.remove("is-invalid");
                    searchInput.classList.add("is-valid");
                    return true;
                }
            };

            searchInput.addEventListener("input", () => {
                if (searchInput.classList.contains("is-invalid") || searchInput.classList.contains("is-valid")) {
                    validateSearch();
                }
            });

            searchForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const isValid = validateSearch();

                if (isValid) {
                    // Search is valid, redirect to 404 as all non-nav events redirect to 404.html
                    window.location.href = "404.html";
                } else {
                    // Shake the search box
                    searchBox.style.transform = "translateX(10px)";
                    setTimeout(() => searchBox.style.transform = "translateX(-10px)", 70);
                    setTimeout(() => searchBox.style.transform = "translateX(5px)", 140);
                    setTimeout(() => searchBox.style.transform = "translateX(-5px)", 210);
                    setTimeout(() => searchBox.style.transform = "translateX(0)", 280);
                }
            });
        }
    }

    // ================= NEWSLETTER VALIDATION =================
    const footerNewsletterForms = document.querySelectorAll(".footer-newsletter-form");
    footerNewsletterForms.forEach(form => {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const input = form.querySelector('input[type="email"]');
            if (input && input.value.trim() !== "") {
                window.location.href = "404.html";
            } else {
                // Shake if empty
                form.style.transform = "translateX(10px)";
                setTimeout(() => form.style.transform = "translateX(-10px)", 70);
                setTimeout(() => form.style.transform = "translateX(5px)", 140);
                setTimeout(() => form.style.transform = "translateX(-5px)", 210);
                setTimeout(() => form.style.transform = "translateX(0)", 280);
            }
        });
    });

    // ================= AUTH FORMS VALIDATION =================
    const setupAuthValidation = (formId, fieldsConfig, successRedirect) => {
        const form = document.getElementById(formId);
        if (!form) return;

        // Attach dynamic feedback UI and handlers
        Object.keys(fieldsConfig).forEach(key => {
            const fieldObj = fieldsConfig[key];
            const input = fieldObj.el;
            if (!input) return;

            const parent = input.parentElement;
            
            // Add absolute validation-error label if not present
            let errorSpan = parent.querySelector(".validation-error");
            if (!errorSpan) {
                errorSpan = document.createElement("span");
                errorSpan.className = "validation-error";
                parent.appendChild(errorSpan);
            }

            // Live Validation on input & blur
            const triggerValidation = () => {
                const errorMsg = fieldObj.validate(input.value, form);
                if (errorMsg) {
                    parent.classList.remove("is-valid");
                    parent.classList.add("is-invalid");
                    errorSpan.textContent = errorMsg;
                } else {
                    parent.classList.remove("is-invalid");
                    parent.classList.add("is-valid");
                    errorSpan.textContent = "";
                }
                return !errorMsg;
            };

            input.addEventListener("input", triggerValidation);
            input.addEventListener("blur", triggerValidation);
            
            // Store trigger function on input elements for form check
            input.triggerValidation = triggerValidation;
        });

        form.addEventListener("submit", (e) => {
            e.preventDefault();
            let isFormValid = true;
            Object.keys(fieldsConfig).forEach(key => {
                const fieldObj = fieldsConfig[key];
                if (fieldObj.el && typeof fieldObj.el.triggerValidation === "function") {
                    const isValid = fieldObj.el.triggerValidation();
                    if (!isValid) isFormValid = false;
                }
            });

            if (isFormValid) {
                // Save email to localStorage if it exists
                const emailInput = form.querySelector("#email");
                if (emailInput && emailInput.value) {
                    localStorage.setItem("authEmail", emailInput.value);
                }

                // Save name to localStorage if it exists
                const nameInput = form.querySelector("#name");
                if (nameInput && nameInput.value) {
                    localStorage.setItem("authName", nameInput.value);
                } else if (!localStorage.getItem("authName") && form.id === "auth-login-form") {
                    // Fallback name if no name saved
                    const role = form.querySelector("#role") ? form.querySelector("#role").value : "user";
                    localStorage.setItem("authName", role === "admin" ? "Super Admin" : "Stackly User");
                }

                // Get role if it exists and determine redirect
                const roleSelect = form.querySelector("#role");
                let finalRedirect = successRedirect;
                if (roleSelect && form.id === "auth-login-form" && finalRedirect !== 'modal') {
                    finalRedirect = roleSelect.value === "admin" ? "admin-dashboard.html" : "user-dashboard.html";
                }

                if (finalRedirect === 'modal') {
                    // Reusing the newsletter success modal for forgot password
                    const overlay = document.getElementById("newsletter-success-overlay");
                    if (overlay) {
                        const h3 = overlay.querySelector('h3');
                        const p = overlay.querySelector('p');
                        if(h3) h3.textContent = "Reset Link Sent";
                        if(p) p.textContent = "Check your email for the password reset link. It will expire in 30 minutes.";
                        overlay.classList.add("is-active");
                    } else {
                        window.location.href = "login.html";
                    }
                } else {
                    window.location.href = finalRedirect;
                }
            } else {
                // Shake first invalid group
                const firstInvalid = form.querySelector(".is-invalid");
                if (firstInvalid) {
                    firstInvalid.style.transform = "translateX(10px)";
                    setTimeout(() => firstInvalid.style.transform = "translateX(-10px)", 70);
                    setTimeout(() => firstInvalid.style.transform = "translateX(5px)", 140);
                    setTimeout(() => firstInvalid.style.transform = "translateX(-5px)", 210);
                    setTimeout(() => firstInvalid.style.transform = "translateX(0)", 280);
                }
            }
        });
    };

    const emailValidator = (val) => {
        if (!val) return "Email address is required.";
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(val)) return "Please enter a valid email address.";
        return "";
    };

    const passwordValidator = (val) => {
        if (!val) return "Password is required.";
        if (val.length < 8) return "Password must be at least 8 characters.";
        return "";
    };

    // Initialize Auth Forms
    setupAuthValidation("auth-login-form", {
        email: { el: document.querySelector("#auth-login-form #email"), validate: emailValidator },
        password: { el: document.querySelector("#auth-login-form #password"), validate: (val) => val ? "" : "Password is required." }
    }, "user-dashboard.html");

    setupAuthValidation("auth-signup-form", {
        name: { el: document.querySelector("#auth-signup-form #name"), validate: (val) => val.trim().length >= 2 ? "" : "Name is required (min 2 chars)." },
        email: { el: document.querySelector("#auth-signup-form #email"), validate: emailValidator },
        password: { el: document.querySelector("#auth-signup-form #password"), validate: passwordValidator },
        confirmPassword: { 
            el: document.querySelector("#auth-signup-form #confirm-password"), 
            validate: (val, form) => {
                const pass = form.querySelector("#password").value;
                if (!val) return "Please confirm your password.";
                if (val !== pass) return "Passwords do not match.";
                return "";
            } 
        }
    }, "login.html");

    setupAuthValidation("auth-forgot-form", {
        email: { el: document.querySelector("#auth-forgot-form #email"), validate: emailValidator }
    }, "404.html");

    // ================= GLOBAL CLICK-TO-404 NAVIGATOR =================
    document.body.addEventListener("click", (e) => {
        // Find if the click is on a dead/unused element or a placeholder that should route to 404.
        // We traverse up the DOM tree from the clicked element.
        let target = e.target;
        let shouldGoTo404 = false;

        while (target && target !== document.body) {
            // 1. Check if the element clicked is a link
            if (target.tagName === "A") {
                const href = target.getAttribute("href");
                
                // Explicitly intercept all footer links and route them to 404
                if (target.closest("footer") || target.closest(".modern-footer")) {
                    shouldGoTo404 = true;
                    break;
                }

                if (href) {
                    const cleanHref = href.split("#")[0].split("?")[0];
                    const allowedHrefs = [
                        "index.html",
                        "about.html",
                        "services.html",
                        "blog.html",
                        "contact.html",
                        "login.html",
                        "signup.html",
                        "forgotpassword.html",
                        "user-dashboard.html",
                        "admin-dashboard.html"
                    ];
                    // If the link explicitly points to 404.html, or is a placeholder/dead link (#),
                    // or points to a file that is not in the allowedHrefs (meaning it's an un-implemented route)
                    if (cleanHref === "404.html" || cleanHref === "" || cleanHref === "#" || !allowedHrefs.includes(cleanHref)) {
                        shouldGoTo404 = true;
                    }
                } else {
                    // Empty/no href on anchor is an unused/dead link placeholder
                    shouldGoTo404 = true;
                }
                break;
            }

            // 2. Check if it is a dead button or placeholder interactive card
            if (target.tagName === "BUTTON") {
                // If it is NOT inside a form, and does not have a custom form submit function,
                // or if it explicitly triggers a redirect to 404.html (e.g. in its onclick or styling)
                const isFormRelated = target.type === "submit" || target.closest("form");
                const onclickStr = target.getAttribute("onclick") || "";
                if (onclickStr.includes("404.html")) {
                    shouldGoTo404 = true;
                } else if (!isFormRelated && !onclickStr) {
                    // Dead button with no handler or form context
                    shouldGoTo404 = true;
                }
                break;
            }

            // 3. Check for specific classes that are intended to be placeholder navigation cards or lists
            if (
                target.classList.contains("project-item") ||
                target.classList.contains("metric-card") ||
                target.classList.contains("panel-action-btn") ||
                target.classList.contains("social-circle-link") ||
                target.classList.contains("sc-link") ||
                target.classList.contains("footer-logo") ||
                target.classList.contains("user-profile-badge") ||
                target.classList.contains("niche-tag") ||
                target.classList.contains("uc-tab") ||
                target.classList.contains("toggle-btn") ||
                target.classList.contains("btn-white") ||
                target.classList.contains("btn-link") ||
                target.classList.contains("avatar") ||
                target.classList.contains("job-item") ||
                target.classList.contains("btn-ghost") ||
                target.classList.contains("btn-link-hero") ||
                target.classList.contains("team-social")
            ) {
                // If they are explicitly pointing to 404 or have 404 action
                const onclickStr = target.getAttribute("onclick") || "";
                const href = target.getAttribute("href") || "";
                if (onclickStr.includes("404.html") || href.includes("404.html") || href === "#" || (!onclickStr && !href)) {
                    shouldGoTo404 = true;
                    break;
                }
            }

            // Move up
            target = target.parentElement;
        }

        if (shouldGoTo404) {
            // Check if we are already on 404.html to avoid infinite redirect loops
            const isNative404Link = e.target.closest("a") && e.target.closest("a").getAttribute("href") === "404.html";
            if (!isNative404Link && !window.location.pathname.includes("404.html")) {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = "404.html";
            }
        }
    }, true); // Use capture phase so we intercept before other events!
});
