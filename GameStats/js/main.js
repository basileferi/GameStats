// ----- viewport mobile fix
function setVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}
setVH();
window.addEventListener('resize', setVH);

// ----- scroll spy par section
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('#nav a');
const progressItems = document.querySelectorAll('.progress-list li');
const scrollContainer = document.querySelector('.snap-container');

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const id = entry.target.id;

            // nav
            navLinks.forEach(link => {
                link.classList.toggle(
                    'active',
                    link.getAttribute('href') === `#${id}`
                );
            });

            // progress bar
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

sections.forEach(section => observer.observe(section));
