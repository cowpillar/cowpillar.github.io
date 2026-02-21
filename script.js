function toggleTheme() {
    const body = document.body;
    
    if (body.classList.contains("light-mode")) {
        body.classList.remove("light-mode");
        localStorage.setItem("theme", "dark");
    } else {
        body.classList.add("light-mode");
        localStorage.setItem("theme", "light");
    }

    if (typeof window.refreshParticlesForTheme === 'function') {
        window.refreshParticlesForTheme();
    }
}

window.toggleTheme = toggleTheme;

function applyTheme() {
    if (document.body) {
        const savedTheme = localStorage.getItem("theme");
        
        if (savedTheme === "light") {
            document.body.classList.add("light-mode");
        }
    } else {
        setTimeout(applyTheme, 10);
    }
}

applyTheme();

document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.querySelector(".theme-toggle");
    
    if (themeToggle) {
        themeToggle.addEventListener("click", function(e) {
            e.preventDefault();
            toggleTheme();
        });
    }

    const jobTitles = ["developer.", "ui/ux designer.", "content creator."];
    let currentIndex = 0;
    let jobElement = document.getElementById("job-title");

    function startTypewriter() {
        if (!jobElement) return;

        let state = 'typing';
        let charIndex = 0;
        const tick = 100;
        let pauseTicks = 0;

        if (jobElement._typewriterTimer) {
            clearInterval(jobElement._typewriterTimer);
        }

        const timer = setInterval(() => {
            const text = jobTitles[currentIndex];

            if (state === 'typing') {
                charIndex = Math.min(charIndex + 1, text.length);
                jobElement.textContent = text.slice(0, charIndex);
                if (charIndex >= text.length) {
                    state = 'pause';
                    pauseTicks = 0;
                }
            } else if (state === 'pause') {
                pauseTicks++;
                if (pauseTicks * tick >= 2000) {
                    state = 'erasing';
                }
            } else if (state === 'erasing') {
                charIndex = Math.max(charIndex - 1, 0);
                jobElement.textContent = text.slice(0, charIndex);
                if (charIndex <= 0) {
                    currentIndex = (currentIndex + 1) % jobTitles.length;
                    state = 'typing';
                    charIndex = 0;
                }
            }
        }, tick);

        jobElement._typewriterTimer = timer;
    }

    setTimeout(startTypewriter, 2000);

    setTimeout(() => {
        let currentWorkIndex = 0;
        const workItems = Array.from(document.querySelectorAll('.work-item'));
        // Indicator dots removed (Work carousel is arrow-only).
        const nextBtn = document.getElementById('nextWork');
        const prevBtn = document.getElementById('prevWork');
        
        if (workItems.length === 0) {
            return;
        }
        
        // (No indicators)
        
        function updateCarousel(direction = 'none') {
            workItems.forEach((item) => {
                item.classList.remove('slide-out-left', 'slide-out-right', 'slide-in-left', 'slide-in-right');
            });
            
            workItems.forEach((item, index) => {
                if (item.classList.contains('active')) {
                    item.classList.remove('active');
                    
                    if (direction === 'right') {
                        item.classList.add('slide-out-right');
                    } else if (direction === 'left') {
                        item.classList.add('slide-out-left');
                    }
                    
                    setTimeout(() => {
                        item.classList.remove('slide-out-left', 'slide-out-right');
                    }, 400);
                }
            });
            
            if (workItems[currentWorkIndex]) {
                workItems[currentWorkIndex].style.display = 'flex';
                setTimeout(() => {
                    workItems[currentWorkIndex].classList.add('active');
                }, 10);
            }
        }
        
        function goNext() {
            currentWorkIndex = (currentWorkIndex + 1) % workItems.length;
            updateCarousel('right');
        }
        
        function goPrev() {
            currentWorkIndex = (currentWorkIndex - 1 + workItems.length) % workItems.length;
            updateCarousel('left');
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                goNext();
            });
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                goPrev();
            });
        }
        
        // Arrow keys are reserved for bottom navigation (carousel stays click-only).
        
        updateCarousel();
        
    }, 500);

    // -------------------- Bottom navigation --------------------
    const snapContainer = document.querySelector('.snap-container');
    const navItems = Array.from(document.querySelectorAll('.bottom-nav .nav-item'));
    const sectionIds = navItems
        .map((a) => a.getAttribute('data-target'))
        .filter(Boolean);
    const sections = sectionIds
        .map((id) => document.getElementById(id))
        .filter(Boolean);

    function setActiveNav(targetId) {
        navItems.forEach((item) => {
            const isActive = item.getAttribute('data-target') === targetId;
            item.classList.toggle('active', isActive);
            if (isActive) {
                item.setAttribute('aria-current', 'page');
            } else {
                item.removeAttribute('aria-current');
            }
        });
    }

    function scrollToSection(targetId) {
        if (!snapContainer) return false;
        const target = document.getElementById(targetId);
        if (!target) return false;

        const top = target.offsetTop;
        snapContainer.scrollTo({ top, behavior: 'smooth' });
        setActiveNav(targetId);
        return true;
    }

    // When we trigger a smooth scroll via nav click, IntersectionObserver can briefly
    // report another section as "most visible" and override the active tab.
    // This lock pauses observer-driven updates until scrolling settles.
    let navObserverLocked = false;
    let navObserverUnlockTimer = null;

    // Scroll-position based sync (more reliable than intersection ratio for long sections)
    let navScrollRaf = null;
    function syncActiveNavFromScrollPosition() {
        if (!snapContainer || sections.length === 0) return;

        // Use the vertical midpoint of the container to decide which section is "current"
        const mid = snapContainer.scrollTop + snapContainer.clientHeight / 2;

        let bestSection = sections[0];
        for (const section of sections) {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;
            if (mid >= top && mid < bottom) {
                bestSection = section;
                break;
            }
            if (top <= mid) {
                bestSection = section;
            }
        }

        if (bestSection && bestSection.id) {
            setActiveNav(bestSection.id);
        }
    }

    function lockNavObserverUntilScrollSettles() {
        if (!snapContainer) return;
        navObserverLocked = true;
        if (navObserverUnlockTimer) {
            clearTimeout(navObserverUnlockTimer);
        }
        navObserverUnlockTimer = setTimeout(() => {
            navObserverLocked = false;
            navObserverUnlockTimer = null;
        }, 120);
    }

    if (snapContainer) {
        snapContainer.addEventListener(
            'scroll',
            () => {
                if (navObserverLocked) {
                    lockNavObserverUntilScrollSettles();
                }

                if (navScrollRaf) return;
                navScrollRaf = requestAnimationFrame(() => {
                    navScrollRaf = null;
                    if (!navObserverLocked) {
                        syncActiveNavFromScrollPosition();
                    }
                });
            },
            { passive: true }
        );
    }

    if (navItems.length > 0) {
        navItems.forEach((item) => {
            item.addEventListener('click', (e) => {
                const targetId = item.getAttribute('data-target');
                if (!targetId) return;
                const handled = scrollToSection(targetId);
                if (handled) {
                    lockNavObserverUntilScrollSettles();
                    e.preventDefault();
                }
            });
        });
    }

    // Keep active state synced with scrolling in the snap container
    if (snapContainer && sections.length > 0 && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                if (navObserverLocked) return;
                let best = null;
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    if (!best || entry.intersectionRatio > best.intersectionRatio) {
                        best = entry;
                    }
                }
                if (best && best.target && best.target.id) {
                    setActiveNav(best.target.id);
                }
            },
            { root: snapContainer, threshold: [0.2, 0.35, 0.5, 0.65, 0.8] }
        );

        sections.forEach((section) => observer.observe(section));
    }

    // Keyboard navigation: only when focus is inside the bottom nav (avoids conflicting with carousel arrow keys)
    if (navItems.length > 0) {
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
            const activeEl = document.activeElement;
            if (activeEl) {
                const tag = (activeEl.tagName || '').toUpperCase();
                if (tag === 'INPUT' || tag === 'TEXTAREA' || activeEl.isContentEditable) return;
            }


            e.preventDefault();

            const currentIndex = Math.max(0, navItems.findIndex((it) => it.classList.contains('active')));
            let nextIndex = currentIndex;
            if (e.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + navItems.length) % navItems.length;
            if (e.key === 'ArrowRight') nextIndex = (currentIndex + 1) % navItems.length;

            const next = navItems[nextIndex];
            if (!next) return;
            next.focus();

            const targetId = next.getAttribute('data-target');
            if (targetId) {
                scrollToSection(targetId);
                return;
            }

            const href = next.getAttribute('href');
            if (href) {
                window.location.href = href;
            }
        });
    }

    // -------------------- Portfolio cards: redirect --------------------
    function toProjectFileName(titleText) {
        const cleaned = (titleText || '')
            .normalize('NFKD')
            .replace(/[^\w\s]+/g, ' ')
            .replace(/_/g, ' ')
            .trim();
        if (!cleaned) return null;

        const parts = cleaned.split(/\s+/).filter(Boolean);
        const pascal = parts
            .map((part) => {
                const upper = part.toUpperCase();
                if (/^R\d+$/i.test(part)) return upper;
                if (/^[A-Z]{2,}\d*$/.test(part)) return part; // keep existing acronyms
                return part.charAt(0).toUpperCase() + part.slice(1);
            })
            .join('');

        // Project pages live under /projects
        return `projects/${pascal}.html`;
    }

    function navigateToProject(destinationHref) {
        if (!destinationHref) return;
        window.location.href = destinationHref;
    }

    const portfolioCards = Array.from(document.querySelectorAll('.portfolio-item'));
    portfolioCards.forEach((card) => {
        let page = card.getAttribute('data-page');
        if (!page) {
            const titleEl = card.querySelector('h2');
            const titleText = (titleEl && titleEl.textContent ? titleEl.textContent : '').trim();
            const inferred = toProjectFileName(titleText);
            if (inferred) {
                page = inferred;
                card.setAttribute('data-page', page);
            }
        }

        // Allow an explicit "View Project" button to behave like a normal link.
        // (The card itself remains a click target.)
        const viewBtn = card.querySelector('.portfolio-view-project-btn');
        if (viewBtn) {
            viewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        card.addEventListener('click', (e) => {
            // If the click originated from the explicit view button, let it navigate.
            if (e.target && typeof e.target.closest === 'function' && e.target.closest('.portfolio-view-project-btn')) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();
            const page = card.getAttribute('data-page');
            if (!page) return;
            navigateToProject(page);
        });

        // Make keyboard-accessible (Enter/Space)
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'link');
        card.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            e.preventDefault();
            const page = card.getAttribute('data-page');
            if (!page) return;
            navigateToProject(page);
        });
    });
});