// 1. Seleciona a hero section inteira
const heroSection = document.querySelector('.hero');
const portfolioBody = document.querySelector('.portfolio-body');

document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const mainContent = document.querySelector('.main-content');

    // Função genérica para criar IntersectionObservers
    const createObserver = (elements, options) => {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // Anima apenas uma vez
                }
            });
        }, options);

        elements.forEach(el => observer.observe(el));
    };

    // 1. Animação das Linhas
    const linesContainer = document.querySelector('.lines-animation');
    if (linesContainer) {
        const numberOfLines = 25;
        for (let i = 0; i < numberOfLines; i++) {
            const line = document.createElement('div');
            line.className = 'line';
            const randomLeft = Math.random() * 100;
            const randomDelay = Math.random() * 5;
            const randomDuration = 3 + Math.random() * 4;
            line.style.left = `${randomLeft}%`;
            line.style.animation = `drop ${randomDuration}s ${randomDelay}s linear infinite`;
            linesContainer.appendChild(line);
        }
    }

    // 2. Animações de Entrada (Timeline, Projetos, Seções)
    const timelineItems = document.querySelectorAll('.timeline-item');
    const projectCards = document.querySelectorAll('.project-card');

    createObserver(timelineItems, { root: mainContent, threshold: 0.2 }); // Anima itens da timeline
    createObserver(projectCards, { root: mainContent, threshold: 0.1 }); // Anima cards de projeto

    const navLinks = document.querySelectorAll('.sidebar .nav-link');

    // --- Lógica para marcar a seção ativa (usada para evitar re-animações)
    const sections = Array.from(document.querySelectorAll('.content-section'));
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                sections.forEach(sec => sec.classList.remove('active-section'));
                entry.target.classList.add('active-section');

                // Adiciona a classe 'active' ao link da sidebar correspondente
                const activeSectionId = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${activeSectionId}`) {
                        link.classList.add('active');
                    }
                });

                const wrapper = entry.target.querySelector('.section-content-wrapper');
                if (wrapper) {
                    wrapper.classList.remove('section-fade-out', 'section-fade-out-down');
                    wrapper.classList.add('visible'); // <-- Adiciona esta linha para tornar o conteúdo visível
                }
            }
        });
    }, { root: mainContent, threshold: 0.5 });

    sections.forEach(sec => sectionObserver.observe(sec));

    // 3. Lógica do Seletor de Tema
    if (themeToggle) {
        const applyTheme = (theme) => {
            if (theme === 'light') {
                body.classList.add('light-mode');
                themeToggle.checked = true;
            } else {
                body.classList.remove('light-mode');
                themeToggle.checked = false;
            }
        };

        const savedTheme = localStorage.getItem('theme') || 'dark';
        applyTheme(savedTheme);

        themeToggle.addEventListener('change', () => {
            const newTheme = themeToggle.checked ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });
    }

    // --- Rolagem suave e histórico para links da sidebar ---
    let isTransitioning = false;
    navLinks.forEach((link) => {
        link.addEventListener('click', function(event) {
            event.preventDefault(); // controlamos a navegação para usar animações e history

            if (isTransitioning) return;

            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (!targetSection) return;

            const currentSection = document.querySelector('.content-section.active-section');
            const currentIndex = currentSection ? sections.findIndex(s => `#${s.id}` === `#${currentSection.id}`) : -1;
            const targetIndex = sections.findIndex(s => `#${s.id}` === targetId);

            // Evita re-animação se já estiver na mesma seção
            if (currentSection && currentSection.id === targetSection.id) {
                // Ainda atualiza o hash para histórico se necessário
                history.pushState({ section: targetId }, '', targetId);
                return;
            }

            isTransitioning = true;
            const direction = targetIndex > currentIndex ? 'down' : 'up';

            // Prepara animações
            const targetWrapper = targetSection.querySelector('.section-content-wrapper');
            if (targetWrapper) {
                targetWrapper.classList.remove('section-fade-in-up', 'section-fade-out', 'section-fade-out-down');
                if (direction === 'up') targetWrapper.classList.add('section-fade-in-up');
            }

            // Anima saída da seção atual
            if (currentSection) {
                const currentWrapper = currentSection.querySelector('.section-content-wrapper');
                if (currentWrapper) {
                    if (direction === 'down') currentWrapper.classList.add('section-fade-out');
                    else currentWrapper.classList.add('section-fade-out-down');
                }
            }

            // Rola suavemente para a seção alvo
            targetSection.scrollIntoView({ behavior: 'auto' });

            // Atualiza o histórico (permite usar voltar)
            history.pushState({ section: targetId }, '', targetId);

            // Libera a transição após duração aproximada (ajuste se necessário)
            setTimeout(() => {
                isTransitioning = false;
            }, 700);
        });
    });

    // Quando o usuário usa o botão voltar/avançar do browser
    window.addEventListener('popstate', () => {
        const hash = location.hash || '#home';
        const target = document.querySelector(hash);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });

    // Foco no mainContent para permitir rolagem por teclado quando a hero for escondida
    // (caso a hero já tenha sido clicada antes do DOMContentLoaded)
    if (!document.body.classList.contains('no-scroll') && mainContent) {
        mainContent.setAttribute('tabindex', '-1');
    }
});

// 2. Adiciona um "ouvinte" que espera por um clique na hero section
if (heroSection) {
    heroSection.addEventListener('click', function() {
        if (!portfolioBody) return;

        // Remove a classe 'no-scroll' do body para permitir a rolagem
        document.body.classList.remove('no-scroll');

        // Adiciona a classe que aciona a animação de "slide up"
        heroSection.classList.add('hero-hidden');

        // Foca no conteúdo principal para permitir a rolagem com o teclado imediatamente
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.setAttribute('tabindex', '-1');
            mainContent.focus({ preventScroll: true });
        }

        // Agenda a remoção da hero section para depois que a rolagem acontecer
        setTimeout(() => {
            heroSection.style.display = 'none';
        }, 1000); // Atraso de 1000ms (1s)
    });
}
