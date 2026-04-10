/**
 * Script principal optimizado para el menú web de Oye Bonita
 * Implementa patrones de diseño: Module, Event Delegation, Lazy Loading
 * Optimizado para performance y accesibilidad
 */

(function() {
    'use strict';

    // ============================================
    // MÓDULO PRINCIPAL - Patrón Module
    // ============================================
    const OyeBonitaApp = (function() {
        // Estado privado del módulo
        let currentCategory = 'entradas';
        let menuData = null;
        let isInitialized = false;
        
        // Cache de elementos DOM
        const DOM = {
            categoryButtons: null,
            menuSections: null,
            menuGrids: null,
            mainNav: null,
            reservationForm: null
        };
        
        // ============================================
        // UTILIDADES DE PERFORMANCE
        // ============================================
        const Utils = {
            /**
             * Debounce para optimizar eventos frecuentes
             */
            debounce: function(func, wait) {
                let timeout;
                return function executedFunction(...args) {
                    const later = () => {
                        clearTimeout(timeout);
                        func(...args);
                    };
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                };
            },
            
            /**
             * Throttle para eventos de animación
             */
            throttle: function(func, limit) {
                let inThrottle;
                return function(...args) {
                    if (!inThrottle) {
                        func.apply(this, args);
                        inThrottle = true;
                        setTimeout(() => inThrottle = false, limit);
                    }
                };
            },
            
            /**
             * Formateador de precios
             */
            formatPrice: function(price) {
                return new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    minimumFractionDigits: 0
                }).format(price);
            },
            
            /**
             * Logger con niveles
             */
            log: {
                info: function(message, data) {
                    console.log(`[Oye Bonita] ${message}`, data || '');
                },
                error: function(message, error) {
                    console.error(`[Oye Bonita] ERROR: ${message}`, error || '');
                },
                warn: function(message, data) {
                    console.warn(`[Oye Bonita] WARN: ${message}`, data || '');
                }
            }
        };
        
        // ============================================
        // MANEJO DE DATOS
        // ============================================
        const DataManager = {
            /**
             * Carga los datos del menú con manejo de errores robusto
             */
            async loadMenuData() {
                try {
                    Utils.log.info('Cargando datos del menú...');
                    const response = await fetch('data/menu-data.json', {
                        headers: {
                            'Accept': 'application/json',
                            'Cache-Control': 'no-cache'
                        }
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    
                    menuData = await response.json();
                    Utils.log.info('Datos cargados exitosamente', { categories: menuData.categories?.length });
                    
                    // Validar estructura de datos
                    if (!menuData.categories || !Array.isArray(menuData.categories)) {
                        throw new Error('Estructura de datos inválida');
                    }
                    
                    return menuData;
                } catch (error) {
                    Utils.log.error('Error cargando datos del menú', error);
                    menuData = DataManager.getFallbackData();
                    Utils.log.warn('Usando datos de respaldo');
                    return menuData;
                }
            },
            
            /**
             * Datos de respaldo (fallback)
             */
            getFallbackData() {
                return {
                    categories: [
                        {
                            id: "hamburguesas",
                            name: "Hamburguesas",
                            items: [
                                {
                                    id: "oye-bonita",
                                    name: "Oye Bonita",
                                    description: "Carne 200g, queso costeño, cebolla caramelizada, lechuga, tomate y salsa de la casa",
                                    price: 28000,
                                    tags: ["Recomendado", "Especial"]
                                }
                            ]
                        }
                    ]
                };
            },
            
            /**
             * Obtiene categoría por ID
             */
            getCategoryById(categoryId) {
                if (!menuData || !menuData.categories) return null;
                return menuData.categories.find(cat => cat.id === categoryId);
            }
        };
        
        // ============================================
        // RENDERIZADO DEL MENÚ
        // ============================================
        const Renderer = {
            /**
             * Genera el HTML para un ítem del menú con lazy loading
             */
            createMenuItemHTML(item) {
                const tagsHTML = item.tags ? item.tags.map(tag => {
                    let tagClass = 'menu-card__tag';
                    if (tag.toLowerCase().includes('recomendado')) tagClass += ' menu-card__tag--recommended';
                    if (tag.toLowerCase().includes('picante')) tagClass += ' menu-card__tag--spicy';
                    if (tag.toLowerCase().includes('nuevo')) tagClass += ' menu-card__tag--new';
                    return `<span class="${tagClass}">${tag}</span>`;
                }).join('') : '';
                
                const priceFormatted = Utils.formatPrice(item.price);
                
                // Lazy loading para imágenes
                const imageHTML = item.image ? 
                    `<img class="menu-card__image" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23222'/%3E%3C/svg%3E" 
                         data-src="${item.image}" 
                         alt="${item.name}" 
                         loading="lazy">` :
                    '';
                
                return `
                    <div class="menu-card" data-item-id="${item.id}">
                        <div class="menu-card__header">
                            <h4 class="menu-card__title">${item.name}</h4>
                            <span class="menu-card__price">${priceFormatted}</span>
                        </div>
                        <div class="menu-card__body">
                            ${imageHTML}
                            <p class="menu-card__description">${item.description}</p>
                            <div class="menu-card__tags">
                                ${tagsHTML}
                            </div>
                        </div>
                    </div>
                `;
            },
            
            /**
             * Renderiza una categoría completa
             */
            renderCategory(categoryId) {
                const category = DataManager.getCategoryById(categoryId);
                if (!category) {
                    Utils.log.warn(`Categoría no encontrada: ${categoryId}`);
                    return;
                }
                
                const grid = DOM.menuGrids[categoryId];
                if (!grid) return;
                
                // Renderizar items
                grid.innerHTML = category.items.map(item => 
                    this.createMenuItemHTML(item)
                ).join('');
                
                // Inicializar lazy loading para imágenes
                this.initLazyLoading(grid);
            },
            
            /**
             * Inicializa lazy loading para imágenes
             */
            initLazyLoading(container) {
                const lazyImages = container.querySelectorAll('img[data-src]');
                if (!lazyImages.length) return;
                
                const imageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            observer.unobserve(img);
                        }
                    });
                }, {
                    rootMargin: '50px 0px',
                    threshold: 0.1
                });
                
                lazyImages.forEach(img => imageObserver.observe(img));
            },
            
            /**
             * Actualiza estado activo de botones
             */
            updateActiveCategory(categoryId) {
                if (!DOM.categoryButtons) return;
                
                DOM.categoryButtons.forEach(btn => {
                    const isActive = btn.dataset.category === categoryId;
                    btn.classList.toggle('active', isActive);
                    btn.setAttribute('aria-current', isActive ? 'page' : 'false');
                });
            },
            
            /**
             * Muestra/oculta secciones
             */
            toggleMenuSections(categoryId) {
                if (!DOM.menuSections) return;
                
                Object.entries(DOM.menuSections).forEach(([id, section]) => {
                    if (section) {
                        const shouldShow = id === categoryId;
                        section.style.display = shouldShow ? 'block' : 'none';
                        section.setAttribute('aria-hidden', !shouldShow);
                    }
                });
            }
        };
        
        // ============================================
        // MANEJO DE EVENTOS (Event Delegation)
        // ============================================
        const EventManager = {
            /**
             * Configura todos los event listeners
             */
            setup() {
                // Event delegation para botones de categoría
                document.addEventListener('click', (e) => {
                    const categoryBtn = e.target.closest('.category-btn');
                    if (categoryBtn) {
                        e.preventDefault();
                        const categoryId = categoryBtn.dataset.category;
                        this.handleCategoryClick(categoryId);
                        return;
                    }
                    
                    // Navegación principal
                    const navLink = e.target.closest('.main-nav a[href^="#"]');
                    if (navLink) {
                        e.preventDefault();
                        const targetId = navLink.getAttribute('href').substring(1);
                        this.handleNavClick(navLink, targetId);
                        return;
                    }
                });
                
                // Event delegation para formulario de reserva
                document.addEventListener('submit', (e) => {
                    if (e.target.id === 'reservation-form') {
                        e.preventDefault();
                        this.handleReservationSubmit(e.target);
                    }
                });
                
                // Eventos de teclado para accesibilidad
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        this.handleEscapeKey();
                    }
                });
                
                // Optimización de scroll con throttle
                window.addEventListener('scroll', Utils.throttle(this.handleScroll, 100));
                window.addEventListener('resize', Utils.debounce(this.handleResize, 250));
                
                // Inicializar eventos de hover con debounce
                this.setupHoverEffects();
            },
            
            /**
             * Maneja clic en categoría
             */
            handleCategoryClick(categoryId) {
                Utils.log.info(`Cambiando a categoría: ${categoryId}`);
                currentCategory = categoryId;
                
                // Actualizar UI
                Renderer.updateActiveCategory(categoryId);
                Renderer.toggleMenuSections(categoryId);
                
                // Renderizar contenido si es necesario
                if (menuData && DOM.menuGrids[categoryId]) {
                    Renderer.renderCategory(categoryId);
                }
                
                // Scroll suave a la sección
                const section = DOM.menuSections[categoryId];
                if (section) {
                    setTimeout(() => {
                        section.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'start' 
                        });
                    }, 100);
                }
            },
            
            /**
             * Maneja clic en navegación
             */
            handleNavClick(link, targetId) {
                // Actualizar estado activo
                document.querySelectorAll('.main-nav a').forEach(l => {
                    l.classList.remove('active');
                    l.setAttribute('aria-current', 'false');
                });
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
                
                // Scroll a sección
                Navigation.scrollToSection(targetId);
            },
            
            /**
             * Maneja envío de reserva
             */
            handleReservationSubmit(form) {
                const formData = new FormData(form);
                const reservation = {
                    name: formData.get('name') || 'No especificado',
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    date: formData.get('date'),
                    time: formData.get('time'),
                    people: formData.get('people')
                };
                
                // Validación básica
                if (!reservation.name || !reservation.phone) {
                    Utils.log.warn('Reserva incompleta', reservation);
                    alert('Por favor completa los campos requeridos: nombre y teléfono.');
                    return;
                }
                
                // Simular envío
                Utils.log.info('Reserva enviada', reservation);
                
                // Mostrar confirmación
                alert(`¡Reserva confirmada para ${reservation.name}!\nFecha: ${reservation.date} ${reservation.time}\nPersonas: ${reservation.people}\n\nTe contactaremos pronto para confirmar.`);
                
                // Resetear formulario
                form.reset();
            },
            
            /**
             * Maneja tecla Escape
             */
            handleEscapeKey() {
                // Cerrar cualquier modal abierto (si existiera)
                Utils.log.info('Tecla Escape presionada');
            },
            
            /**
             * Maneja scroll (optimizado)
             */
            handleScroll() {
                // Podría implementar sticky header o efectos de parallax
                // Actualmente solo logging para demostración
                // Utils.log.info('Scroll event (throttled)');
            },
            
            /**
             * Maneja resize (debounced)
             */
            handleResize() {
                Utils.log.info('Ventana redimensionada');
                // Recalcular layouts si es necesario
            },
            
            /**
             * Configura efectos hover
             */
            setupHoverEffects() {
                // Event delegation para efectos hover
                document.addEventListener('mouseover', Utils.throttle((e) => {
                    const card = e.target.closest('.menu-card');
                    if (card) {
                        card.classList.add('hover-effect');
                        setTimeout(() => card.classList.remove('hover-effect'), 300);
                    }
                }, 100));
            }
        };
        
        // ============================================
        // NAVEGACIÓN Y SCROLL
        // ============================================
        const Navigation = {
            /**
             * Scroll suave a sección
             */
            scrollToSection(sectionId) {
                const element = document.getElementById(sectionId);
                if (!element) {
                    Utils.log.warn(`Sección no encontrada: ${sectionId}`);
                    return;
                }
                
                const headerHeight = document.querySelector('.main-header')?.offsetHeight || 0;
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            },
            
            /**
             * Configura scroll suave para todos los enlaces internos
             */
            setupSmoothScrolling() {
                document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                    anchor.addEventListener('click', function(e) {
                        const href = this.getAttribute('href');
                        if (href === '#') return;
                        
                        const targetId = href.substring(1);
                        const targetElement = document.getElementById(targetId);
                        
                        if (targetElement) {
                            e.preventDefault();
                            Navigation.scrollToSection(targetId);
                        }
                    });
                });
            }
        };
        
        // ============================================
        // EFECTOS DECORATIVOS (Optimizados)
        // ============================================
        const Effects = {
            /**
             * Inicializa efectos decorativos
             */
            init() {
                // Efectos de confeti optimizados
                this.setupConfettiEffects();
                
                // Notas musicales (solo si no hay preferencia por reduced motion)
                if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                    this.createMusicNotes();
                }
            },
            
            /**
             * Configura efectos de confeti
             */
            setupConfettiEffects() {
                const specialButtons = document.querySelectorAll('.btn-primary, .category-btn');
                specialButtons.forEach(button => {
                    button.addEventListener('mouseenter', Utils.throttle((e) => {
                        this.createConfettiEffect(e.target);
                    }, 500)); // Throttle para evitar spam
                });
            },
            
            /**
             * Crea efecto de confeti optimizado
             */
            createConfettiEffect(element) {
                const rect = element.getBoundingClientRect();
                const colors = ['var(--confeti-red)', 'var(--confeti-yellow)', 'var(--confeti-green)', 'var(--confeti-blue)'];
                
                // Limitar cantidad de confeti para performance
                const confettiCount = Math.min(5, Math.floor(window.innerWidth / 200));
                
                for (let i = 0; i < confettiCount; i++) {
                    setTimeout(() => {
                        this.createSingleConfetti(rect, colors);
                    }, i * 50); // Espaciar animaciones
                }
            },
            
            /**
             * Crea un solo elemento de confeti
             */
            createSingleConfetti(rect, colors) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.cssText = `
                    position: fixed;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 10000;
                    left: ${rect.left + rect.width / 2}px;
                    top: ${rect.top + rect.height / 2}px;
                    background-color: ${colors[Math.floor(Math.random() * colors.length)]};
                    opacity: 0.8;
                    transform: translate(0, 0);
                    will-change: transform, opacity;
                `;
                
                document.body.appendChild(confetti);
                
                // Animación con requestAnimationFrame
                const angle = Math.random() * Math.PI * 2;
                const velocity = 2 + Math.random() * 3;
                let vx = Math.cos(angle) * velocity;
                let vy = Math.sin(angle) * velocity;
                let posX = 0, posY = 0;
                
                const animate = () => {
                    posX += vx;
                    posY += vy;
                    vy += 0.1; // gravedad
                    
                    confetti.style.transform = `translate(${posX}px, ${posY}px)`;
                    confetti.style.opacity = parseFloat(confetti.style.opacity) - 0.02;
                    
                    if (parseFloat(confetti.style.opacity) > 0) {
                        requestAnimationFrame(animate);
                    } else {
                        confetti.remove();
                    }
                };
                
                requestAnimationFrame(animate);
            },
            
            /**
             * Crea notas musicales decorativas
             */
            createMusicNotes() {
                const notes = ['♪', '♫', '♬', '♩'];
                const container = document.querySelector('body');
                
                // Limitar cantidad para performance
                const noteCount = Math.min(8, Math.floor(window.innerWidth / 200));
                
                for (let i = 0; i < noteCount; i++) {
                    setTimeout(() => {
                        this.createSingleMusicNote(notes, container);
                    }, i * 300);
                }
            },
            
            /**
             * Crea una sola nota musical
             */
            createSingleMusicNote(notes, container) {
                const note = document.createElement('div');
                note.className = 'music-note';
                note.textContent = notes[Math.floor(Math.random() * notes.length)];
                note.style.cssText = `
                    position: fixed;
                    color: var(--gold-accent);
                    font-size: 24px;
                    opacity: 0.1;
                    z-index: -1;
                    left: ${Math.random() * 100}vw;
                    top: ${Math.random() * 100}vh;
                    will-change: transform;
                    pointer-events: none;
                `;
                
                container.appendChild(note);
                this.animateMusicNote(note);
            },
            
            /**
             * Anima una nota musical
             */
            animateMusicNote(note) {
                let x = parseFloat(note.style.left);
                let y = parseFloat(note.style.top);
                let vx = (Math.random() - 0.5) * 0.5;
                let vy = -0.5 - Math.random() * 0.5;
                
                const animate = () => {
                    x += vx;
                    y += vy;
                    
                    // Rebote en bordes
                    if (x < 0 || x > 100) vx *= -1;
                    if (y < 0) {
                        y = 100;
                        x = Math.random() * 100;
                    }
                    
                    note.style.left = x + 'vw';
                    note.style.top = y + 'vh';
                    
                    requestAnimationFrame(animate);
                };
                
                animate();
            }
        };
        
        // ============================================
        // INICIALIZACIÓN PÚBLICA
        // ============================================
        return {
            /**
             * Inicializa la aplicación
             */
            async init() {
                if (isInitialized) {
                    Utils.log.warn('La aplicación ya está inicializada');
                    return;
                }
                
                Utils.log.info('Inicializando Oye Bonita App...');
                
                try {
                    // Cachear elementos DOM
                    this.cacheDOM();
                    
                    // Cargar datos
                    await DataManager.loadMenuData();
                    
                    // Configurar eventos
                    EventManager.setup();
                    
                    // Configurar navegación
                    Navigation.setupSmoothScrolling();
                    
                    // Inicializar efectos
                    Effects.init();
                    
                    // Mostrar categoría inicial
                    EventManager.handleCategoryClick('entradas');
                    
                    // Renderizar contenido inicial
                    if (menuData) {
                        Renderer.renderCategory('entradas');
                    }
                    
                    isInitialized = true;
                    Utils.log.info('Aplicación inicializada exitosamente');
                    
                } catch (error) {
                    Utils.log.error('Error durante la inicialización', error);
                    alert('Hubo un error al cargar la aplicación. Por favor recarga la página.');
                }
            },
            
            /**
             * Cachea elementos DOM importantes
             */
            cacheDOM() {
                DOM.categoryButtons = document.querySelectorAll('.category-btn');
                DOM.menuSections = {
                    'entradas': document.getElementById('entradas-grid')?.parentElement?.parentElement,
                    'hamburguesas': document.getElementById('hamburguesas-section'),
                    'para-picar': document.getElementById('para-picar-section'),
                    'licores': document.getElementById('licores-section'),
                    'cocteles': document.getElementById('cocteles-section')
                };
                DOM.menuGrids = {
                    'hamburguesas': document.getElementById('hamburguesas-grid'),
                    'para-picar': document.getElementById('para-picar-grid'),
                    'licores': document.getElementById('licores-grid'),
                    'cocteles': document.getElementById('cocteles-grid')
                };
                DOM.mainNav = document.querySelector('.main-nav');
                DOM.reservationForm = document.getElementById('reservation-form');
                
                Utils.log.info('DOM cacheado', {
                    categoryButtons: DOM.categoryButtons?.length,
                    menuSections: Object.keys(DOM.menuSections).length
                });
            },
            
            /**
             * Métodos públicos
             */
            showCategory: (categoryId) => EventManager.handleCategoryClick(categoryId),
            scrollToSection: Navigation.scrollToSection,
            getCurrentCategory: () => currentCategory,
            getMenuData: () => menuData,
            isInitialized: () => isInitialized
        };
    })();
    
    // ============================================
    // INICIALIZACIÓN AL CARGAR EL DOM
    // ============================================
    document.addEventListener('DOMContentLoaded', function() {
        // Inicializar aplicación
        OyeBonitaApp.init().catch(error => {
            console.error('Error crítico al inicializar:', error);
        });
        
        // Exponer API global
        window.OyeBonita = OyeBonitaApp;
    });
    
    // ============================================
    // EXPORTACIÓN PARA MÓDULOS (si es necesario)
    // ============================================
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = OyeBonitaApp;
    }
})();