// Start preloader logic immediately to prevent DOMContentLoaded blocking
const loader = document.getElementById('loader');
const loaderBar = document.querySelector('.loader-bar');
const loaderPercent = document.querySelector('.loader-percentage');
const loaderStatus = document.querySelector('.loader-status');

const statusTexts = [
    "Initializing neural pathways...",
    "Loading memory buffers...",
    "Compiling India/Kerala geolocation metadata...",
    "Parsing academic datasets from MBCET...",
    "Calibrating Python & C compilers...",
    "Establishing vibe-check variables...",
    "Synchronizing cardiac gym-rhythms...",
    "Ready."
];

let progress = 0;
const duration = 600; // Total loader duration in ms (decreased for faster loading)
const intervalTime = 15;
const steps = duration / intervalTime;
const increment = 100 / steps;
const startTime = Date.now();
const timeoutLimit = 1500; // Maximum time (1.5 seconds) to wait for CDNs to load before running fallback

// Dynamic Script Loader Promise
function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${url}`));
        document.head.appendChild(script);
    });
}

let cdnsLoaded = false;

// Async CDN Loading sequence
async function loadCDNs() {
    try {
        // Load Lucide and GSAP in parallel
        await Promise.all([
            loadScript('https://unpkg.com/lucide@latest').then(() => {
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }),
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js')
        ]);
        
        // Load ScrollTrigger after GSAP is ready
        if (typeof gsap !== 'undefined') {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js');
        }
        cdnsLoaded = true;
    } catch (e) {
        console.warn("CDNs failed to load, running in fallback mode.", e);
        // Force progress so page can render in fallback mode
        cdnsLoaded = true;
    }
}

// Start CDN loading in the background
loadCDNs();

const progressInterval = setInterval(() => {
    const elapsedTime = Date.now() - startTime;
    
    if (progress < 100) {
        progress += increment;
        if (progress > 100) progress = 100;
    }
    
    // Update percentages and loader bar width
    const displayVal = Math.floor(progress);
    if (loaderPercent) {
        loaderPercent.textContent = displayVal < 10 ? '0' + displayVal : displayVal;
    }
    if (loaderBar) {
        loaderBar.style.width = `${progress}%`;
    }

    // Cycle through status texts based on progress
    const textIdx = Math.min(
        Math.floor((progress / 100) * statusTexts.length),
        statusTexts.length - 1
    );
    if (loaderStatus) {
        loaderStatus.textContent = statusTexts[textIdx];
    }

    // Finish loader only when progress is 100% AND (CDNs are loaded OR we hit the timeout limit)
    if (progress >= 100) {
        if (cdnsLoaded || elapsedTime >= timeoutLimit) {
            clearInterval(progressInterval);
            finishLoading();
        }
    }
}, intervalTime);

function finishLoading() {
    if (typeof gsap !== 'undefined') {
        // GSAP transition to fade out preloader and reveal hero elements
        const tl = gsap.timeline();
        
        tl.to('#loader', {
            opacity: 0,
            duration: 0.8,
            ease: "power2.inOut",
            onComplete: () => {
                if (loader) loader.style.display = 'none';
            }
        });

        // Trigger entrance animations for Hero elements
        tl.from('.reveal-item', {
            y: 40,
            opacity: 0,
            duration: 1,
            stagger: 0.15,
            ease: "power4.out"
        }, "-=0.3");

        // Subtle animation for header nav
        tl.from('.navbar', {
            y: -20,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out"
        }, "-=0.8");
    } else {
        // Fallback transition if GSAP is blocked or offline
        if (loader) {
            loader.style.transition = 'opacity 0.8s ease-in-out';
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 800);
        }
    }
    
    // Initialize the rest of page interactions after loader finishes
    initializeInteractions();
}


// ----------------------------------------------------
// CORE INTERACTION SUITE
// ----------------------------------------------------
function initializeInteractions() {
    // ----------------------------------------------------
    // CUSTOM CURSOR
    // ----------------------------------------------------
    const cursor = document.getElementById('custom-cursor');
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let isHovering = false;

    if (cursorDot && cursorRing) {
        // Follow mouse coordinates
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Immediately place the small dot
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top = mouseY + 'px';
        });

        // Animate the outer ring with a slight delay (interpolation)
        function animateRing() {
            const ease = 0.15; // Smoothness factor
            ringX += (mouseX - ringX) * ease;
            ringY += (mouseY - ringY) * ease;

            cursorRing.style.left = ringX + 'px';
            cursorRing.style.top = ringY + 'px';

            requestAnimationFrame(animateRing);
        }
        animateRing();

        // Hover states for links, buttons, and custom triggers
        const hoverElements = document.querySelectorAll('a, button, .magnetic-tilt, .preset-btn');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-hover');
                isHovering = true;
            });
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover');
                isHovering = false;
            });
        });
    }

    // ----------------------------------------------------
    // MAGNETIC SNAP BUTTONS & HOVER 3D TILT
    // ----------------------------------------------------
    const magneticElements = document.querySelectorAll('.magnetic');
    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            // Calculate relative offset from center of button
            const relX = e.clientX - rect.left - (rect.width / 2);
            const relY = e.clientY - rect.top - (rect.height / 2);

            // Pull element slightly towards mouse (magnetic effect)
            if (typeof gsap !== 'undefined') {
                gsap.to(el, {
                    x: relX * 0.35,
                    y: relY * 0.35,
                    duration: 0.3,
                    ease: "power2.out"
                });
            } else {
                el.style.transform = `translate(${relX * 0.25}px, ${relY * 0.25}px)`;
            }
        });

        el.addEventListener('mouseleave', () => {
            // Restore back to original coordinates
            if (typeof gsap !== 'undefined') {
                gsap.to(el, {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    ease: "elastic.out(1, 0.4)"
                });
            } else {
                el.style.transform = 'translate(0, 0)';
            }
        });
    });

    // 3D Card Tilt Effect
    const tiltElements = document.querySelectorAll('.magnetic-tilt');
    tiltElements.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Normalize offsets to -0.5 to 0.5 range
            const normalizedX = (x / rect.width) - 0.5;
            const normalizedY = (y / rect.height) - 0.5;
            
            // Rotate card slightly based on coordinates
            if (typeof gsap !== 'undefined') {
                gsap.to(card, {
                    rotateY: normalizedX * 12, // Max rotation angle
                    rotateX: -normalizedY * 12,
                    transformPerspective: 1000,
                    ease: "power2.out",
                    duration: 0.3
                });
            } else {
                card.style.transform = `perspective(1000px) rotateY(${normalizedX * 10}deg) rotateX(${-normalizedY * 10}deg)`;
            }
        });

        card.addEventListener('mouseleave', () => {
            if (typeof gsap !== 'undefined') {
                gsap.to(card, {
                    rotateY: 0,
                    rotateX: 0,
                    transformPerspective: 1000,
                    ease: "power3.out",
                    duration: 0.6
                });
            } else {
                card.style.transform = 'none';
            }
        });
    });

    // ----------------------------------------------------
    // THEME SWITCHER
    // ----------------------------------------------------
    const themeToggle = document.getElementById('theme-selector-toggle');
    const themeDropdown = document.getElementById('theme-dropdown');
    const themeOptions = document.querySelectorAll('.theme-opt');

    if (themeToggle && themeDropdown) {
        // Toggle dropdown UI
        themeToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            themeDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            themeDropdown.classList.remove('show');
        });

        // Theme activation selection
        themeOptions.forEach(opt => {
            opt.addEventListener('click', () => {
                const selectedTheme = opt.getAttribute('data-theme');
                
                // Set body classes
                document.body.className = '';
                document.body.classList.add(selectedTheme);
                
                // Update active state in list
                themeOptions.forEach(o => o.classList.remove('active'));
                opt.classList.add('active');

                // Save choice
                localStorage.setItem('darsan-portfolio-theme', selectedTheme);
            });
        });

        // Load saved theme on boot
        const savedTheme = localStorage.getItem('darsan-portfolio-theme');
        if (savedTheme) {
            document.body.className = '';
            document.body.classList.add(savedTheme);
            
            // Sync active UI class
            themeOptions.forEach(o => {
                if (o.getAttribute('data-theme') === savedTheme) {
                    o.classList.add('active');
                } else {
                    o.classList.remove('active');
                }
            });
        }
    }

    // ----------------------------------------------------
    // GSAP SCROLL TRIGGER ANIMATIONS (DEFENSIVELY WRAPPED)
    // ----------------------------------------------------
    let marqueeTween = null;

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Horizontal scrolling outline marquee text
        marqueeTween = gsap.to('.marquee-inner', {
            xPercent: -35,
            ease: 'none',
            scrollTrigger: {
                trigger: 'body',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.5
            }
        });

        // Navbar design change on scroll
        ScrollTrigger.create({
            start: 'top -80px',
            onEnter: () => {
                const navbar = document.querySelector('.navbar');
                if (navbar) navbar.classList.add('scrolled');
            },
            onLeaveBack: () => {
                const navbar = document.querySelector('.navbar');
                if (navbar) navbar.classList.remove('scrolled');
            },
        });

        // Parallax effect on decorative background glows
        gsap.to('.blob-1', {
            yPercent: 40,
            scrollTrigger: {
                trigger: 'body',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1
            }
        });

        gsap.to('.blob-2', {
            yPercent: -40,
            scrollTrigger: {
                trigger: 'body',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1
            }
        });

        // Reveal section headers and dividers
        const sectionHeaders = document.querySelectorAll('.section-header');
        sectionHeaders.forEach(header => {
            gsap.from(header, {
                opacity: 0,
                y: 30,
                duration: 0.8,
                scrollTrigger: {
                    trigger: header,
                    start: "top 85%",
                    toggleActions: "play none none none"
                }
            });
        });

        // Stagger fade-in for skills cards
        if (document.querySelector('.skills-grid')) {
            gsap.from('.skill-card', {
                opacity: 0,
                y: 40,
                duration: 0.8,
                stagger: 0.15,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: '.skills-grid',
                    start: "top 80%"
                }
            });
        }

        // Scroll reveal timeline blocks in Hobbies section
        const hobbyBlocks = document.querySelectorAll('.hobby-block');
        hobbyBlocks.forEach((block, idx) => {
            const dir = idx % 2 === 0 ? 30 : -30;
            const details = block.querySelector('.hobby-details');
            const media = block.querySelector('.hobby-media');
            
            if (details) {
                gsap.from(details, {
                    opacity: 0,
                    x: dir,
                    duration: 0.8,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: block,
                        start: "top 75%",
                        toggleActions: "play none none none"
                    }
                });
            }

            if (media) {
                gsap.from(media, {
                    opacity: 0,
                    scale: 0.5,
                    duration: 0.6,
                    ease: "back.out(1.7)",
                    scrollTrigger: {
                        trigger: block,
                        start: "top 75%",
                        toggleActions: "play none none none"
                    }
                });
            }
        });
    } else {
        // Fallback scrolled class trigger if ScrollTrigger is offline
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                if (window.scrollY > 80) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }
        });
    }

    // ----------------------------------------------------
    // SCROLLING NAME TOGGLE LOGIC
    // ----------------------------------------------------
    const scrollToggleBtn = document.getElementById('name-scroll-toggle');
    const toggleIcon = document.getElementById('scroll-toggle-icon');
    let scrollAnimationEnabled = true;

    if (scrollToggleBtn) {
        scrollToggleBtn.addEventListener('click', () => {
            scrollAnimationEnabled = !scrollAnimationEnabled;
            if (scrollAnimationEnabled) {
                scrollToggleBtn.classList.add('active');
                if (toggleIcon) {
                    toggleIcon.setAttribute('data-lucide', 'pause');
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                }
                if (marqueeTween && marqueeTween.scrollTrigger) {
                    marqueeTween.scrollTrigger.enable();
                    marqueeTween.scrollTrigger.refresh();
                }
            } else {
                scrollToggleBtn.classList.remove('active');
                if (toggleIcon) {
                    toggleIcon.setAttribute('data-lucide', 'play');
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                }
                if (marqueeTween && marqueeTween.scrollTrigger) {
                    marqueeTween.scrollTrigger.disable();
                }
                if (typeof gsap !== 'undefined') {
                    gsap.to('.marquee-inner', { xPercent: 0, duration: 0.8, ease: "power2.out" });
                } else {
                    const inner = document.querySelector('.marquee-inner');
                    if (inner) inner.style.transform = 'translate3d(0, 0, 0)';
                }
            }
        });
    }

    // ----------------------------------------------------
    // AI SANDBOX & CONSOLE SIMULATION LOGIC
    // ----------------------------------------------------
    const consoleScreen = document.getElementById('console-screen');
    const consoleInput = document.getElementById('console-input');
    const consoleSend = document.getElementById('console-send-btn');
    const presetButtons = document.querySelectorAll('.preset-btn');
    
    const tempSlider = document.getElementById('temp-slider');
    const tempVal = document.getElementById('temp-val');
    const tokenSlider = document.getElementById('token-slider');
    const tokenVal = document.getElementById('token-val');

    // UI Sliders linkage
    if (tempSlider && tempVal) {
        tempSlider.addEventListener('input', (e) => {
            tempVal.textContent = e.target.value;
        });
    }
    if (tokenSlider && tokenVal) {
        tokenSlider.addEventListener('input', (e) => {
            tokenVal.textContent = e.target.value;
        });
    }

    // AI Responses Database
    const responses = {
        experiment: `
            <strong>Darsan M's AI Experimentation Stack:</strong><br>
            • Experimenting with local model serving frameworks (Ollama, HuggingFace Transformers).<br>
            • Developing customized workflows utilizing generative text structures for personal organization.<br>
            • Researching visual generation tools and prompt construction rules for stable-diffusion engines.<br>
            • Testing multi-agent chains that handle calendar triggers, code suggestions, and email summaries.
        `,
        career: `
            <strong>Why CS & Artificial Intelligence?</strong><br>
            Darsan is studying at Mar Baselios College of Engineering and Technology (MBCET). AI is no longer a futuristic concept—it is actively shaping our software environments. He chose this niche to understand both the foundation (traditional CS structures) and the cognitive layer (Machine Learning, neural weights, neural-nets) to build systems that automate and simplify human thought.
        `,
        persona: `
            <strong>Developer Profile: Darsan M</strong><br>
            • <em>Curious & Experimental:</em> Doesn't just write scripts, he breaks models and tests their failure points.<br>
            • <em>Dual Skill Layer:</em> Combines pythonic speed (perfect for ML frameworks and automation scripts) with C systems discipline (deep memory details, algorithmic math).<br>
            • <em>Disciplined Mind:</em> Uses gym training, reading, and structural audio podcasts to stay sharp and maintain a calm, methodical approach to system construction.
        `,
        vibe: `
            <strong>A Soothing Thought from Darsan:</strong><br>
            "Writing code is like managing noise. In an era where information moves at high frequencies, the most effective tool we possess is a quiet, focused mind. Take a breath, write clean logic, optimize your system, and let things run smoothly."
        `
    };

    // Keyword parser for custom inputs
    function getKeywordResponse(input) {
        const clean = input.toLowerCase();
        
        if (clean.includes('hobby') || clean.includes('hobbies') || clean.includes('gym') || clean.includes('read') || clean.includes('music') || clean.includes('podcast')) {
            return `
                Darsan's lifestyle operates on a balanced workflow to boost mental and physical strength:<br>
                • <strong>Gym:</strong> Boosts BDNF neurogenesis, builds stress resilience, resets physical fatigue.<br>
                • <strong>Reading:</strong> Cognitive focus restorer, expands structural knowledge frameworks.<br>
                • <strong>Music:</strong> Alpha-wave entrainment for long, immersive coding sessions.<br>
                • <strong>Podcasts:</strong> Passive learning about science, philosophy, and real-world tech industry architectures.<br>
                Scroll up to his Hobbies section to see a full visual explanation.
            `;
        }
        if (clean.includes('college') || clean.includes('study') || clean.includes('mbcet') || clean.includes('university') || clean.includes('education')) {
            return "Darsan is pursuing his undergraduate studies in Computer Science and Artificial Intelligence at the <strong>Mar Baselios College of Engineering and Technology (MBCET)</strong>, located in Thiruvananthapuram, Kerala, India.";
        }
        if (clean.includes('india') || clean.includes('kerala') || clean.includes('trivandrum') || clean.includes('where') || clean.includes('live')) {
            return "Darsan is a citizen of <strong>India</strong>, hailing from the state of <strong>Kerala</strong>, and residing in the capital city of <strong>Thiruvananthapuram (Trivandrum)</strong>.";
        }
        if (clean.includes('python') || clean.includes('c ') || clean.includes('language') || clean.includes('skill') || clean.includes('code')) {
            return "Darsan has core expertise in <strong>Python</strong> (scripting, automation, AI tooling) and <strong>C</strong> (low-level structures, data algorithms, compiler memory models). Check his Skill Matrix above for details!";
        }
        if (clean.includes('who') || clean.includes('darsan') || clean.includes('about')) {
            return "Darsan M is a CS & AI student interested in constructing automated pipelines and experimenting with emerging AI frameworks. He blends academic study with modern tech vibes.";
        }
        
        return "System processed question. Under current temperature parameter settings, I suggest exploring: <em>'What AI tools is Darsan currently experimenting with?'</em> or <em>'Why did Darsan choose Computer Science and AI?'</em>";
    }

    // Trigger sandboxed question
    function askQuestion(text, responseKey = null) {
        if (!consoleScreen) return;
        
        // Render user message
        const now = new Date();
        const timeStr = `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
        
        const userMsg = document.createElement('div');
        userMsg.className = 'console-msg user';
        userMsg.innerHTML = `<p class="time">${timeStr}</p><p class="text">&gt; ${text}</p>`;
        consoleScreen.appendChild(userMsg);
        
        // Auto-scroll
        consoleScreen.scrollTop = consoleScreen.scrollHeight;

        // Render AI thought processing indicator
        const systemMsg = document.createElement('div');
        systemMsg.className = 'console-msg system';
        systemMsg.innerHTML = `<p class="time">${timeStr}</p><p class="text">Processing tokens...</p>`;
        consoleScreen.appendChild(systemMsg);
        consoleScreen.scrollTop = consoleScreen.scrollHeight;

        // Simulate network delay
        setTimeout(() => {
            systemMsg.remove(); // Remove thinking indicator
            
            const aiMsg = document.createElement('div');
            aiMsg.className = 'console-msg ai';
            
            // Format HTML reply
            let content = '';
            if (responseKey) {
                content = responses[responseKey];
            } else {
                content = getKeywordResponse(text);
            }

            aiMsg.innerHTML = `<p class="time">${timeStr}</p><p class="text"></p>`;
            consoleScreen.appendChild(aiMsg);
            
            const textElement = aiMsg.querySelector('.text');
            typeWriterEffect(textElement, content);
        }, 600 + Math.random() * 400);
    }

    // Custom Typewriter simulator
    function typeWriterEffect(element, htmlContent) {
        if (!element) return;
        
        // Create off-screen scratch div to parse HTML nodes
        const scratch = document.createElement('div');
        scratch.innerHTML = htmlContent;
        
        // Get all tokens (combining raw text characters and HTML tags)
        const parts = [];
        let cursorIdx = 0;
        
        while (cursorIdx < scratch.childNodes.length) {
            const node = scratch.childNodes[cursorIdx];
            if (node.nodeType === Node.TEXT_NODE) {
                // Split text node to individual letters
                parts.push(...node.textContent.split(''));
            } else {
                // HTML element node, push entire outerHTML string
                parts.push(node.outerHTML);
            }
            cursorIdx++;
        }

        let i = 0;
        element.innerHTML = '';
        
        // Create blinking typing cursor
        const blinker = document.createElement('span');
        blinker.className = 'typing-cursor';
        element.appendChild(blinker);

        function type() {
            if (i < parts.length) {
                // Insert item before the blinking cursor
                blinker.insertAdjacentHTML('beforebegin', parts[i]);
                i++;
                if (consoleScreen) consoleScreen.scrollTop = consoleScreen.scrollHeight;
                
                // Adjust delay speed slightly based on item size
                const delay = parts[i-1].length > 1 ? 150 : 15;
                setTimeout(type, delay);
            } else {
                // Remove cursor blinker once text is done
                blinker.remove();
            }
        }
        type();
    }

    // Preset button links
    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const prompt = btn.getAttribute('data-prompt');
            let key = null;
            if (prompt.includes('tools')) key = 'experiment';
            else if (prompt.includes('choose')) key = 'career';
            else if (prompt.includes('stand out')) key = 'persona';
            else if (prompt.includes('quote')) key = 'vibe';
            
            askQuestion(prompt, key);
        });
    });

    // Custom prompt bar submit
    if (consoleSend && consoleInput) {
        consoleSend.addEventListener('click', () => {
            const text = consoleInput.value.trim();
            if (text) {
                askQuestion(text);
                consoleInput.value = '';
            }
        });

        consoleInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const text = consoleInput.value.trim();
                if (text) {
                    askQuestion(text);
                    consoleInput.value = '';
                }
            }
        });
    }

    // ----------------------------------------------------
    // MOBILE NAV DRAWER INTERACTION
    // ----------------------------------------------------
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            menuToggle.classList.toggle('active');
            
            // Animate burger bars
            const bars = menuToggle.querySelectorAll('.menu-bar');
            if (navLinks.classList.contains('open')) {
                if (typeof gsap !== 'undefined') {
                    gsap.to(bars[0], { rotate: 45, y: 8, duration: 0.2 });
                    gsap.to(bars[1], { opacity: 0, duration: 0.2 });
                    gsap.to(bars[2], { rotate: -45, y: -8, duration: 0.2 });
                } else {
                    bars[0].style.transform = 'rotate(45deg) translateY(8px)';
                    bars[1].style.opacity = '0';
                    bars[2].style.transform = 'rotate(-45deg) translateY(-8px)';
                }
            } else {
                if (typeof gsap !== 'undefined') {
                    gsap.to(bars[0], { rotate: 0, y: 0, duration: 0.2 });
                    gsap.to(bars[1], { opacity: 1, duration: 0.2 });
                    gsap.to(bars[2], { rotate: 0, y: 0, duration: 0.2 });
                } else {
                    bars[0].style.transform = 'none';
                    bars[1].style.opacity = '1';
                    bars[2].style.transform = 'none';
                }
            }
        });

        // Close mobile nav when clicking a link
        const navItems = document.querySelectorAll('.nav-link');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navLinks.classList.remove('open');
                const bars = menuToggle.querySelectorAll('.menu-bar');
                if (typeof gsap !== 'undefined') {
                    gsap.to(bars[0], { rotate: 0, y: 0, duration: 0.2 });
                    gsap.to(bars[1], { opacity: 1, duration: 0.2 });
                    gsap.to(bars[2], { rotate: 0, y: 0, duration: 0.2 });
                } else {
                    bars[0].style.transform = 'none';
                    bars[1].style.opacity = '1';
                    bars[2].style.transform = 'none';
                }
            });
        });
    }
}

/* =====================================================
   BINARY RAIN ANIMATION
   Matrix-style columns of falling 0s and 1s
===================================================== */
(function initBinaryRain() {
    const canvas = document.getElementById('binary-rain');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const FONT_SIZE = 14;
    const CHARS = '01';
    let columns = 0;
    let drops = [];

    // Get current theme accent color for the rain
    function getRainColor() {
        const style = getComputedStyle(document.body);
        return style.getPropertyValue('--accent-primary').trim() || '#00ff41';
    }

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        columns = Math.floor(canvas.width / FONT_SIZE);
        // Keep existing drop positions, extend/trim as needed
        while (drops.length < columns) drops.push(Math.random() * -100);
        drops.length = columns;
    }

    function draw() {
        // Semi-transparent black fade — creates the trail effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const color = getRainColor();
        ctx.font = `${FONT_SIZE}px 'JetBrains Mono', monospace`;

        for (let i = 0; i < drops.length; i++) {
            const char = CHARS[Math.floor(Math.random() * CHARS.length)];
            const x = i * FONT_SIZE;
            const y = drops[i] * FONT_SIZE;

            // Bright white head for the leading character
            const isHead = drops[i] > 1 && Math.random() > 0.92;
            ctx.fillStyle = isHead ? '#ffffff' : color;
            ctx.globalAlpha = isHead ? 0.95 : (0.35 + Math.random() * 0.45);
            ctx.fillText(char, x, y);

            // Reset drop randomly after it goes off-screen
            if (y > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i] += 0.5; // speed — lower = slower rain
        }

        ctx.globalAlpha = 1;
    }

    resize();
    window.addEventListener('resize', resize);

    // Observe theme changes and re-read accent color automatically (no extra work needed)
    setInterval(draw, 45); // ~22 fps — subtle, not distracting
})();
