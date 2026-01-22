// ============================================
// VÉRIFICATION GSAP ET PLUGINS
// ============================================
function checkGSAP() {
    if (typeof gsap === 'undefined') {
        console.error('❌ GSAP non chargé ! Ajoutez <script src="lib/gsap.min.js">');
        return false;
    }
    if (typeof SplitText === 'undefined') {
        console.warn('⚠️ SplitText non chargé - animations de texte limitées');
    }
    if (typeof ScrambleTextPlugin === 'undefined') {
        console.warn('⚠️ ScrambleTextPlugin non chargé - animations scramble désactivées');
    }
    return true;
}

// ============================================
// SCROLL & NAVIGATION
// ============================================
function scrollToTop() {
    const snapContainer = document.querySelector('.snap-container');
    if (snapContainer) {
        snapContainer.scrollTop = 0;
        snapContainer.scrollTo(0, 0);
    }
    window.scrollTo(0, 0);
}

if (window.history.scrollRestoration) {
    window.history.scrollRestoration = 'manual';
}

document.addEventListener('DOMContentLoaded', () => {
    scrollToTop();
    setTimeout(scrollToTop, 50);

    const btn = document.getElementById('scrollToTopBtn');
    if (btn) {
        btn.addEventListener('click', scrollToTop);
    }

    // Scroll vers le top pour le header-left
    const headerLeft = document.getElementById('header-left');
    if (headerLeft) {
        headerLeft.style.cursor = 'pointer'; // montre que c'est cliquable
        headerLeft.addEventListener('click', scrollToTop);
    }

    const year = new Date().getFullYear();
    const copyright = document.querySelector('[data-copyright]');
    if (copyright) {
        copyright.textContent = `© ${year} - FERRAND-RICHARTE Basile - Tous droits réservés`;
    }
});

// ============================================
// HAUTEUR VIEWPORT MOBILE
// ============================================
function setVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setVH();
window.addEventListener('resize', setVH);

// ============================================
// ANIMATIONS GSAP PAR SECTION
// ============================================

/**
 * Stocke les SplitText instances pour pouvoir les nettoyer
 */
const splitTextInstances = new Map();

/**
 * Reset tous les éléments animés d'une section à leur état initial
 * @param {HTMLElement} section - La section à reset
 */
function resetSectionAnimations(section) {
    const title = section.querySelector('.stat-title');
    const text = section.querySelector('.stat-text');
    const content = section.querySelector('.stat-content');
    const source = section.querySelector('.stat-source');


    gsap.killTweensOf([title, text, content, source]);


    const sectionId = section.id;
    if (splitTextInstances.has(sectionId)) {
        splitTextInstances.get(sectionId).revert();
        splitTextInstances.delete(sectionId);
    }


    if (title) gsap.set(title, { clearProps: "all" });
    if (text) gsap.set(text, { clearProps: "all" });
    if (content) gsap.set(content, { clearProps: "all" });
    if (source) gsap.set(source, { clearProps: "all" });
}

/**
 * Anime le titre avec ScrambleText
 * @param {HTMLElement} section - La section à animer
 */
function animateSectionTitle(section) {
    const title = section.querySelector('.stat-title');
    if (!title) return;



    if (typeof ScrambleTextPlugin !== 'undefined') {
        gsap.registerPlugin(ScrambleTextPlugin);

        const finalText = title.dataset.finalText || title.textContent;

        gsap.fromTo(title,
            { opacity: 0 },
            {
                opacity: 1,
                duration: 0.6,
                scrambleText: {
                    text: finalText,
                    chars: "XO",
                    revealDelay: 0.3,
                    speed: 0.4
                },
                ease: "power2.out"
            }
        );
    } else {
        gsap.fromTo(title,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
        );
    }
}


/**
 * Anime le texte avec SplitText
 * @param {HTMLElement} section - La section à animer
 */
function animateSectionText(section) {
    const text = section.querySelector('.stat-text');
    if (!text) return;

    if (typeof SplitText !== 'undefined') {
        gsap.registerPlugin(SplitText);

        const split = new SplitText(text, { type: "lines,words" });
        splitTextInstances.set(section.id, split);

        gsap.fromTo(split.words,
            { opacity: 0, y: 10 },
            {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.02,
                delay: 0.3,
                ease: "power2.out"
            }
        );
    } else {
        gsap.fromTo(text,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: "power2.out" }
        );
    }
}

/**
 * Anime le lien source
 * @param {HTMLElement} section - La section à animer
 */
function animateSectionSource(section) {
    const source = section.querySelector('.stat-source');
    if (!source) return;

    gsap.fromTo(source,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.6, delay: 0.6, ease: "power2.out" }
    );
}

/**
 * Anime le contenu visuel (chart/lottie)
 * @param {HTMLElement} section - La section à animer
 */
function animateSectionContent(section) {
    const content = section.querySelector('.stat-content');
    if (!content) return;

    gsap.fromTo(content,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.8, delay: 0.4, ease: "power2.out" }
    );
}

/**
 * Lance toutes les animations d'une section
 * @param {HTMLElement} section - La section à animer
 */
function animateSection(section) {
    // Reset avant de ré-animer
    resetSectionAnimations(section);

    animateSectionTitle(section);
    animateSectionText(section);
    animateSectionContent(section);
    animateSectionSource(section);

    console.log(`✅ Animations GSAP lancées pour ${section.id}`);
}

// ============================================
// SCROLL SPY + ANIMATIONS
// ============================================
function initScrollSpy() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('#nav a');
    const progressItems = document.querySelectorAll('.progress-list li');
    const scrollContainer = document.querySelector('.snap-container');

    if (sections.length === 0) {
        console.warn('⚠️ Aucune section trouvée pour le scroll spy');
        return;
    }

    const gsapAvailable = checkGSAP();

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                const id = entry.target.id;

                if (entry.isIntersecting) {
                    // Mise à jour navigation
                    navLinks.forEach(link => {
                        link.classList.toggle(
                            'active',
                            link.getAttribute('href') === `#${id}`
                        );
                    });

                    // Mise à jour barre de progression
                    progressItems.forEach(item => {
                        item.classList.toggle(
                            'active',
                            item.dataset.section === id
                        );
                    });

                    // Lancer animations GSAP
                    if (gsapAvailable) {
                        animateSection(entry.target);
                    }
                } else {
                    // Reset quand la section sort du viewport
                    if (gsapAvailable) {
                        resetSectionAnimations(entry.target);
                    }
                }
            });
        },
        {
            root: scrollContainer,
            threshold: 0.5
        }
    );

    sections.forEach(section => observer.observe(section));

    console.log(`✅ Scroll spy initialisé sur ${sections.length} sections`);
}

// ============================================
// INITIALISATION
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initScrollSpy, 100);
    });
} else {
    setTimeout(initScrollSpy, 100);
}