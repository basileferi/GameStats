// ============================================
// Gestion POO des sections
// ============================================

class StatSection {
    constructor(config) {
        this.id = config.id;
        this.title = config.title;
        this.text = config.text;
        this.source = config.source || null;
        this.sourceText = config.sourceText || "Source";
        this.contentType = config.contentType || 'none';
        this.contentData = config.contentData || null;
        this.bgColor = config.bgColor || 'var(--color-background)';
    }

    render() {
        const section = document.createElement('section');
        section.id = this.id;
        section.style.backgroundColor = this.bgColor;

        // Le lien source est maintenant dans le flux normal
        const sourceHTML = (this.source && this.source !== '' && this.source !== '#')
            ? `<a href="${this.source}" target="_blank" rel="noopener noreferrer" class="stat-source">${this.sourceText}</a>`
            : '<span class="stat-source-placeholder"></span>';

        section.innerHTML = `
            <div class="page-content">
                <div class="stat-header">
                    <h2 class="stat-title" data-final-text="${this.title}">${this.title}</h2>
                    <p class="stat-text">${this.text}</p>
                </div>
                <div class="stat-content" id="${this.id}-content">
                    <!-- Contenu dynamique injecté par injectContent() -->
                </div>
                <div class="stat-footer">
                    ${sourceHTML}
                </div>
            </div>
        `;

        setTimeout(() => this.injectContent(section), 0);

        return section;
    }

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
                break;
            default:
                console.warn(`⚠️ Type de contenu inconnu: ${this.contentType}`);
                container.innerHTML = '<p>Type de contenu non supporté</p>';
        }
    }

    renderChart(container) {
        if (typeof Chart === 'undefined') {
            console.error('❌ Chart.js non chargé !');
            container.innerHTML = '<p>Chart.js non disponible</p>';
            return;
        }

        const canvas = document.createElement('canvas');
        container.appendChild(canvas);

        new Chart(canvas, this.contentData);
        console.log(`✅ Chart rendu pour ${this.id}`);
    }

    renderImage(container) {
        const img = document.createElement('img');
        img.src = this.contentData;
        img.alt = this.title;

        img.onerror = () => {
            console.error(`❌ Impossible de charger l'image: ${this.contentData}`);
            container.innerHTML = `<p>Image non disponible</p>`;
        };

        container.appendChild(img);
        console.log(`✅ Image rendue pour ${this.id}`);
    }

    renderLottie(container) {
        if (typeof lottie === 'undefined') {
            console.error('❌ Lottie non chargé !');
            container.innerHTML = '<p>Lottie non disponible</p>';
            return;
        }

        const lottieDiv = document.createElement('div');
        lottieDiv.className = 'lottie-container';
        container.appendChild(lottieDiv);

        const config = {
            container: lottieDiv,
            renderer: 'svg',
            autoplay: false
        };

        if (typeof this.contentData === 'string') {
            config.path = this.contentData;
        } else {
            config.animationData = this.contentData;
        }

        const animation = lottie.loadAnimation(config);

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animation.goToAndPlay(0);
                    } else {
                        animation.pause();
                    }
                });
            },
            { threshold: 0.3 }
        );

        const section = container.closest('section');
        if (section) {
            observer.observe(section);
        }

        console.log(`✅ Lottie rendu pour ${this.id}`);
    }
}

const sectionsData = [
    {
        id: "section1",
        title: "Vos statistiques du monde du jeu vidéo.",
        text: "Sujet du jour :\nPourquoi les studios indépendants sont essentiels à l'industrie du jeu-vidéo ?",
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
        text: "Chiffre d'affaires du marché français : 5,7 milliards d'euros en 2024 (-5,8 % vs 2023).",
        source: "https://www.sell.fr/sites/default/files/essentiel-jeu-video/def_ejv_mars_2025.pdf",
        contentType: "lottie",
        contentData: "assets/lotties/Illustration_2_Cadis.json",
        bgColor: "var(--color-primary)"
    },
    {
        id: "section4",
        title: "Petits budgets",
        text: "67,2 % des jeux développés en France ont un budget < 1 million € en 2024",
        source: "https://www.devtodev.com/education/articles/en/511/game-market-overview-the-most-important-reports-published-in-november-2023?",
        contentType: "chart",
        contentData: {
            type: 'polarArea',
            data: {
                labels: ['Part de jeux sorties avec un budget supérieur à 1M €', 'Part Jeux sorties avec un budget inférieur à 1M €'],
                datasets: [{
                    label: 'Pourcentage',
                    data: [32.8, 67.2],
                    borderColor: "#0B0B0B",
                    backgroundColor: '#C1121F'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    r: {
                        pointLabels: {
                            display: true,
                            font: {
                                size: 13
                            }
                        }
                    }
                },
            }
        },
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
        text: "Dynamique d'emploi / recrutement : ≈ 500 emplois créés dans les studios en 2023 ; ~50 % des studios recrutaient en 2023.",
        source: "https://grand-est.numeric-emploi.org/publication/les-chiffres-cles-du-secteur-du-jeu-video-en-france?",
        contentType: "chart",
        contentData: {
            type: 'bar',
            data: {
                labels: ['2021', '2022', '2023', '2024', '2025'],
                datasets: [{
                    label: 'Nouveaux emplois dans le jeu vidéo',
                    data: ["+161", "+230", "+521", "+421", "+527"],
                    borderColor: "#0B0B0B",
                    backgroundColor: '#F4A261',
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
    }
];

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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSections);
} else {
    initSections();
}

