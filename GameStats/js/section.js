// ============================================
// CLASSE STATSECTION - Gestion POO des sections
// ============================================

/**
 * Classe représentant une section statistique du site
 *
 * ARCHITECTURE :
 * - render() : Crée la structure HTML
 * - injectContent() : Routeur qui délègue selon contentType
 * - renderChart/Image/Lottie() : Méthodes spécialisées
 *
 * POURQUOI CETTE SÉPARATION ?
 * - Single Responsibility : Chaque méthode a une seule tâche
 * - Extensibilité : Facile d'ajouter renderVideo(), renderSVG(), etc.
 * - Testabilité : Chaque type de contenu peut être testé indépendamment
 */
class StatSection {
    /**
     * Constructeur - Stocke la configuration de la section
     *
     * @param {Object} config - Configuration de la section
     * @param {string} config.id - ID unique (ex: "section1")
     * @param {string} config.title - Titre H2
     * @param {string} config.text - Texte descriptif
     * @param {string} config.source - URL de la source (lien cliquable)
     * @param {string} config.sourceText - Texte du lien source (optionnel, défaut: "Source")
     * @param {string} config.contentType - Type: "chart" | "image" | "lottie" | "none"
     * @param {*} config.contentData - Données selon le type
     * @param {string} config.bgColor - Couleur de fond CSS
     */
    constructor(config) {
        this.id = config.id;
        this.title = config.title;
        this.text = config.text;

        /**
         * SOURCE OPTIONNELLE
         *
         * POURQUOI null par défaut et pas '#' ?
         * - null indique clairement "pas de source"
         * - '#' pourrait être confondu avec une ancre valide
         * - Facilite la vérification dans render()
         *
         * USAGE :
         * - Avec source : source: "https://..."
         * - Sans source : source: null OU ne pas spécifier source
         */
        this.source = config.source || null;

        /**
         * TEXTE DU LIEN SOURCE PERSONNALISABLE
         *
         * POURQUOI "Source" par défaut ?
         * - Court et universel
         * - Facile à traduire
         * - Peut être personnalisé par section
         *
         * USAGE :
         * - Par défaut : sourceText non spécifié → "Source"
         * - Personnalisé : sourceText: "Voir l'étude complète"
         */
        this.sourceText = config.sourceText || "Source";

        this.contentType = config.contentType || 'none';
        this.contentData = config.contentData || null;
        this.bgColor = config.bgColor || 'var(--color-background)';
    }

    /**
     * Génère l'élément <section> complet avec son contenu
     *
     * STRUCTURE HTML GÉNÉRÉE :
     * <section id="sectionX">
     *   <div class="page-content">
     *     <h2>Titre</h2>
     *     <p>Texte</p>
     *     <div class="stat-content" id="sectionX-content"></div>
     *     <a class="stat-source" href="...">Source</a>
     *   </div>
     * </section>
     *
     * @returns {HTMLElement} Section complète
     */
    render() {
        const section = document.createElement('section');
        section.id = this.id;
        section.style.backgroundColor = this.bgColor;

        /**
         * RENDU CONDITIONNEL DE LA SOURCE
         *
         * POURQUOI CETTE VÉRIFICATION ?
         * - Certaines sections n'ont pas besoin de source
         * - Évite d'afficher un lien vide ou "#"
         * - Rend la configuration plus flexible
         *
         * CONDITIONS POUR AFFICHER LA SOURCE :
         * 1. this.source existe (pas null/undefined)
         * 2. this.source n'est pas une chaîne vide ("")
         * 3. this.source n'est pas juste "#" (placeholder)
         *
         * TEXTE PERSONNALISABLE :
         * - Utilise this.sourceText pour le libellé du lien
         * - Par défaut "Source", mais peut être "Voir l'étude", "En savoir plus", etc.
         */
        const sourceHTML = (this.source && this.source !== '' && this.source !== '#')
            ? `<a href="${this.source}" target="_blank" rel="noopener noreferrer" class="stat-source">${this.sourceText}</a>`
            : '';

        section.innerHTML = `
            <div class="page-content">
                <div>
                    <h2>${this.title}</h2>
                    <p>${this.text}</p>
                </div>
                <div class="stat-content" id="${this.id}-content">
                    <!-- Contenu dynamique injecté par injectContent() -->
                </div>
                ${sourceHTML}
            </div>
        `;

        /**
         * POURQUOI setTimeout ?
         * - Chart.js et Lottie nécessitent que le canvas/div soit DANS le DOM
         * - innerHTML n'est pas encore dans le DOM à ce stade
         * - setTimeout(0) place l'exécution à la fin de la queue d'événements
         * - Garantit que section.innerHTML est injecté AVANT injectContent()
         */
        setTimeout(() => this.injectContent(section), 0);

        return section;
    }

    /**
     * Routeur qui injecte le contenu selon le type
     *
     * PATTERN : Switch/Case pour le polymorphisme
     * - Évite les if/else imbriqués
     * - Facile d'ajouter de nouveaux types
     * - Chaque type a sa méthode dédiée
     *
     * @param {HTMLElement} section - Section contenant le conteneur
     */
    injectContent(section) {
        const container = section.querySelector(`#${this.id}-content`);

        if (!container) {
            console.error(`❌ Conteneur ${this.id}-content introuvable`);
            return;
        }

        switch(this.contentType) {
            case 'chart':
                this.renderChart(container);
                break;
            case 'image':
                this.renderImage(container);
                break;
            case 'lottie':
                this.renderLottie(container);
                break;
            case 'none':
                // Pas de contenu supplémentaire
                break;
            default:
                console.warn(`⚠️ Type de contenu inconnu: ${this.contentType}`);
                container.innerHTML = '<p>Type de contenu non supporté</p>';
        }
    }

    /**
     * Rendu d'un graphique Chart.js
     *
     * DONNÉES ATTENDUES dans contentData :
     * {
     *   type: 'bar' | 'line' | 'pie' | 'doughnut' | ...,
     *   data: { labels: [...], datasets: [...] },
     *   options: { ... }
     * }
     *
     * POURQUOI Chart.js ?
     * - Librairie standard pour les graphiques
     * - Responsive natif
     * - 8 types de graphiques disponibles
     *
     * @param {HTMLElement} container - Conteneur où injecter le canvas
     */
    renderChart(container) {
        if (typeof Chart === 'undefined') {
            console.error('❌ Chart.js non chargé ! Ajoutez <script src="...chart.js"></script>');
            container.innerHTML = '<p>Chart.js non disponible</p>';
            return;
        }

        const canvas = document.createElement('canvas');
        container.appendChild(canvas);

        new Chart(canvas, this.contentData);
        console.log(`✅ Chart rendu pour ${this.id}`);
    }

    /**
     * Rendu d'une image
     *
     * DONNÉES ATTENDUES dans contentData :
     * "chemin/vers/image.jpg" (string)
     *
     * POURQUOI une méthode dédiée ?
     * - Gestion d'erreur de chargement
     * - Attributs alt pour l'accessibilité
     * - Possibilité d'ajouter lazy loading
     *
     * @param {HTMLElement} container - Conteneur où injecter l'image
     */
    renderImage(container) {
        const img = document.createElement('img');
        img.src = this.contentData;
        img.alt = this.title;

        // Gestion d'erreur de chargement
        img.onerror = () => {
            console.error(`❌ Impossible de charger l'image: ${this.contentData}`);
            container.innerHTML = `<p>Image non disponible</p>`;
        };

        container.appendChild(img);
        console.log(`✅ Image rendue pour ${this.id}`);
    }

    /**
     * @param {HTMLElement} container - Conteneur où injecter l'animation
     */
    renderLottie(container) {
        if (typeof lottie === 'undefined') {
            console.error('❌ Lottie non chargé ! Ajoutez <script src="...lottie.min.js"></script>');
            container.innerHTML = '<p>Lottie non disponible</p>';
            return;
        }

        const lottieDiv = document.createElement('div');
        lottieDiv.className = 'lottie-container';
        container.appendChild(lottieDiv);

        /**
         * CONFIGURATION LOTTIE :
         * - renderer: 'svg' = qualité vectorielle (préféré)
         * - loop: true = animation infinie
         * - autoplay: true = démarre automatiquement
         * - path OU animationData selon le type de contentData
         */
        const config = {
            container: lottieDiv,
            renderer: 'svg',
            autoplay: false
        };

        // Si contentData est un string, c'est un chemin vers un fichier JSON
        if (typeof this.contentData === 'string') {
            config.path = this.contentData;
        } else {
            // Sinon c'est l'objet JSON directement
            config.animationData = this.contentData;
        }

        const animation = lottie.loadAnimation(config);

// Observer pour démarrer l'animation au scroll
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animation.goToAndPlay(0); // Démarre l'animation
                    } else {
                        animation.pause(); // Met en pause quand invisible
                    }
                });
            },
            { threshold: 0.3 } // Démarre quand 30% de la section est visible
        );

// Observer la section parente
        const section = container.closest('section');
        if (section) {
            observer.observe(section);
        }

        console.log(`✅ Lottie rendu pour ${this.id}`);
    }
}

// ============================================
// CONFIGURATION DES SECTIONS
// ============================================

/**
 * Tableau de configuration de toutes les sections
 *
 * STRUCTURE DE CHAQUE SECTION :
 * {
 *   id: "sectionX",              // ID unique
 *   title: "...",                 // Titre H2
 *   text: "...",                  // Paragraphe descriptif
 *   source: "https://...",        // Lien source (affiché en bas à gauche)
 *   contentType: "chart|image|lottie|none",
 *   contentData: ...,             // Dépend du type
 *   bgColor: "var(--color-...)"   // Couleur de fond
 * }
 *
 * EXEMPLES DE contentData :
 *
 * 1. CHART :
 *    contentData: {
 *      type: 'bar',
 *      data: { labels: ['A', 'B'], datasets: [{data: [10, 20]}] }
 *    }
 *
 * 2. IMAGE :
 *    contentData: "images/graph.png"
 *
 * 3. LOTTIE :
 *    contentData: "animations/stats.json"
 */
const sectionsData = [
    {
        id: "section1",
        title: "Vos statistiques du monde du jeu vidéo.",
        text: "Sujet du jour :\n" +
            "Pourquoi les studios indépendants sont essentiels à l’industrie du jeu-vidéo ?",
        source: null,
        contentType: "lottie",
        contentData: "assets/lotties/Illustration_0_Boite.json",
        bgColor: "var(--color-background)"
    },
    {
        id: "section2",
        title: "Joueurs",
        text: "38,3 millions de joueurs en France, soit environ 7 Français sur 10 pratiquent le jeu vidéo.",
        source: "https://www.blogdumoderateur.com/chiffres-jeu-video/",
        contentType: "lottie",
        contentData: "assets/lotties/Illustration_4_France.json",
        bgColor: "var(--color-tertiary)"
    },
    {
        id: "section3",
        title: "Industrie",
        text: "Chiffre d’affaires du marché français : 5,7 milliards d’euros en 2024 (-5,8 % vs 2023).",
        source: "https://www.sell.fr/sites/default/files/essentiel-jeu-video/def_ejv_mars_2025.pdf",
        contentType: "lottie",
        contentData: "assets/lotties/Illustration_2_Cadis.json",
        bgColor: "var(--color-primary)"
    },
    {
        id: "section4",
        title: "Petits budgets",
        text: "67,2 % des jeux développés en France ont un budget < 1 million €",
        source: "https://www.devtodev.com/education/articles/en/511/game-market-overview-the-most-important-reports-published-in-november-2023?",
        contentType: "chart",
        contentData: {
            type: 'bar',
            data: {
                labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
                datasets: [{
                    label: 'Heures de jeu',
                    data: [0.8, 0.9, 1.0, 1.2, 1.5, 2.5, 2.1],
                    backgroundColor: 'rgba(75, 192, 192, 0.8)'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Heures'
                        }
                    }
                }
            }
        },
        bgColor: "var(--color-background)"
    },
    {
        id: "section5",
        title: "Récompenses",
        text: "70% des gagnants aux game awards sont indépendants",
        source: null,
        contentType: "lottie",
        contentData: "assets/lotties/Illustration_5_Trophee.json",
        bgColor: "var(--color-tertiary)"
    },
    {
        id: "section6",
        title: "Sorties",
        text: "Volume de sorties élevé : 14 531 jeux publiés en 2023 (France / données sectorielles).",
        source: "https://documentation.onisep.fr/doc_num.php?explnum_id=72711&",
        contentType: "lottie",
        contentData: "assets/lotties/Illustration_3_Repetition.json",
        bgColor: "var(--color-primary)"
    },
    {
        id: "section7",
        title: "Indépendance",
        text: "55 % des jeux développés en 2024 sont des jeux « indépendants ».",
        source: "https://afjv.com/chiffres_jeux_video.php?c=ventes&",
        contentType: "lottie",
        contentData: "assets/lotties/Illustration_1_Independant.json",
        bgColor: "var(--color-background)"
    },
    {
        id: "section8",
        title: "Emploi",
        text: "Dynamique d’emploi / recrutement : ≈ 500 emplois créés dans les studios en 2023 ; ~50 % des studios recrutaient en 2023.",
        source: "https://grand-est.numeric-emploi.org/publication/les-chiffres-cles-du-secteur-du-jeu-video-en-france?",
        contentType: "chart",
        contentData: {
            type: 'line',
            data: {
                labels: ['2021', '2022', '2023', '2024', '2025*'],
                datasets: [{
                    label: 'Revenus (Mds €)',
                    data: [50, 60, 72, 85, 106],
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true }
                }
            }
        },
        bgColor: "var(--color-tertiary)"
    }
];

// ============================================
// INJECTION DES SECTIONS DANS LE DOM
// ============================================

/**
 * Initialise et injecte toutes les sections dans le DOM
 *
 * PROCESSUS :
 * 1. Récupère le conteneur main et le footer
 * 2. Pour chaque section dans sectionsData :
 *    - Crée une instance de StatSection
 *    - Appelle render() pour générer le HTML
 *    - Insère AVANT le footer (avec insertBefore)
 *
 * POURQUOI insertBefore ?
 * - Le footer doit toujours être en dernier
 * - appendChild() placerait après le footer (incorrect)
 */
function initSections() {
    const main = document.querySelector('.snap-container');
    const footer = document.getElementById('footer-section');

    if (!main) {
        console.error('❌ .snap-container introuvable !');
        return;
    }

    if (!footer) {
        console.error('❌ #footer-section introuvable !');
        return;
    }

    sectionsData.forEach(data => {
        const section = new StatSection(data);
        main.insertBefore(section.render(), footer);
    });

    console.log(`✅ ${sectionsData.length} sections injectées avec succès`);
}

// ============================================
// DÉCLENCHEMENT AU CHARGEMENT DU DOM
// ============================================

/**
 * POURQUOI DOMContentLoaded ?
 * - Le DOM doit être prêt avant d'injecter des éléments
 * - Plus rapide que 'load' (n'attend pas les images/CSS)
 * - Garantit que .snap-container et #footer-section existent
 *
 * FALLBACK :
 * - Si le script se charge après DOMContentLoaded (rare)
 * - On vérifie readyState et on exécute immédiatement
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSections);
} else {
    initSections();
}