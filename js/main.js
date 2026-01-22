function scrollToTop() {
    const snapContainer = document.querySelector('.snap-container');
    if (snapContainer) {
        snapContainer.scrollTop = 0;
        snapContainer.scrollTo(0, 0);
    }
    window.scrollTo(0, 0);
}

// Scroll en haut au reload
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

    const year = new Date().getFullYear();
    const copyright = document.querySelector('[data-copyright]');
    if (copyright) {
        copyright.textContent =
            `© ${year} - FERRAND-RICHARTE Basile - Tous droits réservés`;
    }
});



/**
 * Fixe les problèmes de hauteursur mobile
 */
function setVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setVH();
window.addEventListener('resize', setVH);

// ============================================
// SCROLL SPY - la barre de progression
// ============================================

/**
 * Initialise l'observation du scroll pour la barre de progression
 */
function initScrollSpy() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('#nav a');
    const progressItems = document.querySelectorAll('.progress-list li');
    const scrollContainer = document.querySelector('.snap-container');

    // Vérification de sécurité
    if (sections.length === 0) {
        console.warn('⚠️ Aucune section trouvée pour le scroll spy');
        return;
    }

    /**
     * IntersectionObserver surveille quand les sections entrent dans le viewport
     */
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {

                if (!entry.isIntersecting) return;

                const id = entry.target.id;


                navLinks.forEach(link => {
                    link.classList.toggle(
                        'active',
                        link.getAttribute('href') === `#${id}`
                    );
                });


                progressItems.forEach(item => {
                    item.classList.toggle(
                        'active',
                        item.dataset.section === id
                    );
                });
            });
        },
        {
            root: scrollContainer,
            threshold: 0.6
        }
    );

    // Observer chaque section
    sections.forEach(section => observer.observe(section));

    console.log(`✅ Scroll spy initialisé sur ${sections.length} sections`);
}

// ============================================
// INITIALISATION
// ============================================

/**
 * Attendre que les sections soient créées avant d'initialiser le scroll spy
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Petit délai pour s'assurer que section.js a fini
        setTimeout(initScrollSpy, 100);
    });
} else {
    setTimeout(initScrollSpy, 100);
}