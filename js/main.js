// ============================================
// VIEWPORT MOBILE FIX
// ============================================

/**
 * Fixe les problèmes de hauteur viewport sur mobile
 *
 * POURQUOI ?
 * - Sur mobile, 100vh inclut parfois la barre d'adresse
 * - Cette fonction calcule la vraie hauteur visible
 * - Utilisée via var(--vh) dans le CSS
 */
function setVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setVH();
window.addEventListener('resize', setVH);

// ============================================
// SCROLL SPY - PROGRESS BAR
// ============================================

/**
 * Initialise l'observation du scroll pour la progress bar
 *
 * POURQUOI CETTE FONCTION ?
 * - Les sections sont créées dynamiquement par section.js
 * - On doit attendre qu'elles existent avant de les observer
 * - Appelée APRÈS l'injection des sections
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
     *
     * POURQUOI IntersectionObserver ?
     * - Plus performant que scroll events (pas de calculs continus)
     * - Détection précise de la visibilité
     * - Natif au navigateur (pas de librairie externe)
     */
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                // On ne traite que les sections qui ENTRENT dans le viewport
                if (!entry.isIntersecting) return;

                const id = entry.target.id;

                // Mise à jour de la navigation (si elle existe)
                navLinks.forEach(link => {
                    link.classList.toggle(
                        'active',
                        link.getAttribute('href') === `#${id}`
                    );
                });

                // Mise à jour de la progress bar
                progressItems.forEach(item => {
                    item.classList.toggle(
                        'active',
                        item.dataset.section === id
                    );
                });
            });
        },
        {
            root: scrollContainer,        // Observe dans le conteneur de scroll
            threshold: 0.6                 // Déclenche quand 60% de la section est visible
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
 *
 * POURQUOI setTimeout ?
 * - section.js s'exécute en premier et injecte les sections
 * - setTimeout(0) place initScrollSpy à la fin de la queue d'événements
 * - Garantit que les sections existent avant l'observation
 *
 * ALTERNATIVE : Utiliser un event custom émis par section.js
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Petit délai pour s'assurer que section.js a fini
        setTimeout(initScrollSpy, 100);
    });
} else {
    setTimeout(initScrollSpy, 100);
}