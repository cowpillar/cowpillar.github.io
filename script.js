function toggleTheme() {
    const body = document.body;
    
    if (body.classList.contains("light-mode")) {
        body.classList.remove("light-mode");
        localStorage.setItem("theme", "dark");
    } else {
        body.classList.add("light-mode");
        localStorage.setItem("theme", "light");
    }

    // Refresh particles background to match theme
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
        const indicatorsContainer = document.querySelector('.carousel-indicators');
        const nextBtn = document.getElementById('nextWork');
        const prevBtn = document.getElementById('prevWork');
        
        if (workItems.length === 0) {
            return;
        }
        
        function generateIndicators() {
            if (!indicatorsContainer) return;
            
            indicatorsContainer.innerHTML = '';
            
            for (let i = 0; i < workItems.length; i++) {
                const indicator = document.createElement('span');
                indicator.className = 'indicator';
                indicator.setAttribute('data-index', i);
                if (i === 0) indicator.classList.add('active');
                
                indicator.addEventListener('click', function(e) {
                    e.preventDefault();
                    currentWorkIndex = i;
                    updateCarousel();
                });
                
                indicatorsContainer.appendChild(indicator);
            }
        }
        
        generateIndicators();
        
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
            
            const currentIndicators = document.querySelectorAll('.indicator');
            currentIndicators.forEach((indicator) => {
                indicator.classList.remove('active');
            });

            if (workItems[currentWorkIndex]) {
                workItems[currentWorkIndex].style.display = 'flex';
                setTimeout(() => {
                    workItems[currentWorkIndex].classList.add('active');
                }, 10);
            }
            
            const currentIndicator = document.querySelector(`.indicator[data-index="${currentWorkIndex}"]`);
            if (currentIndicator) {
                currentIndicator.classList.add('active');
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
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') {
                goNext();
            } else if (e.key === 'ArrowLeft') {
                goPrev();
            }
        });
        
        updateCarousel();
        
    }, 500);
});
