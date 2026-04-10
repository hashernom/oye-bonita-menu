/**
 * Script simplificado para el menú web de Oye Bonita
 * Versión optimizada para móviles y diseño minimalista
 */

(function() {
    'use strict';

    // Estado de la aplicación
    let menuData = null;
    
    // Elementos DOM
    let categoryButtons = null;
    let menuGrids = {};

    // Utilidades
    const Utils = {
        formatPrice: function(price) {
            return new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0
            }).format(price);
        },
        
        log: function(message) {
            console.log(`[Oye Bonita] ${message}`);
        },
        
        handleError: function(error, context) {
            console.error(`[Oye Bonita] Error en ${context}:`, error);
        }
    };

    // Carga de datos
    async function loadMenuData() {
        try {
            Utils.log('Cargando datos del menú...');
            const response = await fetch('data/menu-data.json');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Transformar datos a formato esperado
            menuData = {};
            if (data.categories && Array.isArray(data.categories)) {
                data.categories.forEach(category => {
                    menuData[category.id] = category.items.map(item => ({
                        id: item.id,
                        nombre: item.name,
                        descripcion: item.description,
                        precio: item.price,
                        tags: item.tags || []
                    }));
                });
            }
            
            Utils.log('Datos del menú cargados exitosamente');
            return menuData;
        } catch (error) {
            Utils.handleError(error, 'loadMenuData');
            return getFallbackData();
        }
    }

    // Datos de respaldo
    function getFallbackData() {
        return {
            entradas: [
                {
                    id: 1,
                    nombre: "Chorizos Caramelizados",
                    descripcion: "Chorizos artesanales caramelizados con panela y especias, acompañados de patacón.",
                    precio: 18000,
                    tags: ["Recomendado", "Picante"]
                },
                {
                    id: 2,
                    nombre: "Patacón Tentación",
                    descripcion: "Patacón crujiente con queso costeño, carne desmechada y guacamole.",
                    precio: 22000,
                    tags: ["Recomendado"]
                }
            ],
            hamburguesas: [
                {
                    id: 3,
                    nombre: "Hamburguesa Vallenata",
                    descripcion: "Carne de res 200g, queso costeño, aguacate, cebolla caramelizada y salsa especial.",
                    precio: 25000,
                    tags: ["Recomendado"]
                }
            ],
            "para-picar": [
                {
                    id: 4,
                    nombre: "Picada Familiar",
                    descripcion: "Variedad de carnes, chorizo, patacón, arepa y ensalada para 4 personas.",
                    precio: 55000,
                    tags: ["Para compartir"]
                }
            ],
            licores: [
                {
                    id: 5,
                    nombre: "Ron Viejo de Caldas",
                    descripcion: "Añejado 8 años, servido en copa de brandy.",
                    precio: 18000,
                    tags: ["Premium"]
                }
            ],
            cocteles: [
                {
                    id: 6,
                    nombre: "Cóctel Vallenato",
                    descripcion: "Mezcla secreta de frutas tropicales, ron y un toque de canela.",
                    precio: 22000,
                    tags: ["Especialidad"]
                }
            ]
        };
    }

    // Obtiene items por categoría
    function getItemsByCategory(category) {
        if (!menuData || !menuData[category]) {
            const fallback = getFallbackData();
            return fallback[category] || [];
        }
        return menuData[category];
    }

    // Crea elemento de item de menú simplificado
    function createMenuItemElement(item) {
        const div = document.createElement('div');
        div.className = 'menu-item-simple';
        
        // Crear tags HTML
        let tagsHTML = '';
        if (item.tags && item.tags.length > 0) {
            tagsHTML = `
                <div class="menu-item-tags">
                    ${item.tags.map(tag => {
                        let tagClass = '';
                        if (tag.toLowerCase().includes('recomendado')) tagClass = 'recommended';
                        if (tag.toLowerCase().includes('nuevo')) tagClass = 'new';
                        return `<span class="menu-item-tag ${tagClass}">${tag}</span>`;
                    }).join('')}
                </div>
            `;
        }
        
        div.innerHTML = `
            <div class="menu-item-info">
                <h4 class="menu-item-title">${item.nombre}</h4>
                <p class="menu-item-description">${item.descripcion}</p>
                ${tagsHTML}
            </div>
            <div class="menu-item-price">${Utils.formatPrice(item.precio)}</div>
        `;
        
        return div;
    }

    // Renderiza items en formato simplificado
    function renderMenuItems(category, items) {
        const container = menuGrids[category];
        if (!container) return;
        
        // Limpiar contenido existente
        container.innerHTML = '';
        
        if (!items || items.length === 0) {
            container.innerHTML = `
                <div class="no-items">
                    <p>No hay items disponibles en esta categoría.</p>
                </div>
            `;
            return;
        }
        
        // Crear items simplificados
        items.forEach(item => {
            const itemElement = createMenuItemElement(item);
            container.appendChild(itemElement);
        });
    }

    // Carga todas las categorías del menú
    function loadAllCategories() {
        const categories = ['entradas', 'hamburguesas', 'para-picar', 'licores', 'cocteles'];
        
        categories.forEach(category => {
            const items = getItemsByCategory(category);
            renderMenuItems(category, items);
        });
        
        Utils.log('Todas las categorías cargadas');
    }
    
    // Navega a una categoría específica (scroll suave)
    function navigateToCategory(category) {
        const targetSection = document.getElementById(category);
        if (targetSection) {
            // Actualizar botones activos
            categoryButtons.forEach(btn => {
                if (btn.dataset.category === category) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            
            // Scroll suave a la sección
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            Utils.log(`Navegando a categoría: ${category}`);
        }
    }

    // Configura event listeners
    function setupEventListeners() {
        // Botones de categoría (navegación a secciones)
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const category = this.dataset.category;
                navigateToCategory(category);
            });
        });
        
        // Navegación suave para enlaces internos
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Inicializa elementos DOM
    function initDOM() {
        categoryButtons = document.querySelectorAll('.category-btn');
        
        menuGrids = {
            entradas: document.getElementById('entradas-grid'),
            hamburguesas: document.getElementById('hamburguesas-grid'),
            "para-picar": document.getElementById('para-picar-grid'),
            licores: document.getElementById('licores-grid'),
            cocteles: document.getElementById('cocteles-grid')
        };
    }

    // Inicializa la aplicación
    async function init() {
        try {
            Utils.log('Inicializando aplicación...');
            
            // Inicializar DOM
            initDOM();
            
            // Cargar datos
            await loadMenuData();
            
            // Configurar eventos
            setupEventListeners();
            
            // Cargar todas las categorías
            loadAllCategories();
            
            Utils.log('Aplicación inicializada exitosamente');
        } catch (error) {
            Utils.handleError(error, 'init');
        }
    }

    // Inicialización cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', function() {
        // Esperar a que termine la animación de bienvenida
        setTimeout(() => {
            init();
        }, 1500);
    });

    // Exponer para debugging
    window.OyeBonitaApp = {
        init: init,
        navigateToCategory: navigateToCategory,
        getItemsByCategory: getItemsByCategory,
        loadAllCategories: loadAllCategories
    };
})();