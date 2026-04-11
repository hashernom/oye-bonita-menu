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
                    // Si la categoría tiene subcategorías (licores, cócteles)
                    if (category.hasSubcategories && category.subcategories) {
                        // Para categorías con subcategorías, almacenamos la estructura completa
                        menuData[category.id] = {
                            hasSubcategories: true,
                            subcategories: category.subcategories.map(subcat => ({
                                id: subcat.id,
                                name: subcat.name,
                                items: subcat.items.map(item => ({
                                    id: item.id,
                                    nombre: item.name,
                                    descripcion: item.description,
                                    precio: item.price,
                                    tags: item.tags || []
                                }))
                            }))
                        };
                    } else {
                        // Para categorías sin subcategorías (entradas, hamburguesas, etc.)
                        menuData[category.id] = category.items.map(item => ({
                            id: item.id,
                            nombre: item.name,
                            descripcion: item.description,
                            precio: item.price,
                            tags: item.tags || []
                        }));
                    }
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
        
        // Si la categoría tiene subcategorías, devolvemos la estructura completa
        if (menuData[category].hasSubcategories) {
            return menuData[category];
        }
        
        // Para categorías sin subcategorías, devolvemos el array de items
        return menuData[category];
    }

    // Crea elemento de item de menú simplificado
    function createMenuItemElement(item, showTags = true) {
        const div = document.createElement('div');
        div.className = 'menu-item-simple';
        
        // Crear tags HTML (solo si showTags es true y hay tags)
        let tagsHTML = '';
        if (showTags && item.tags && item.tags.length > 0) {
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
        
        if (!items || (Array.isArray(items) && items.length === 0)) {
            container.innerHTML = `
                <div class="no-items">
                    <p>No hay items disponibles en esta categoría.</p>
                </div>
            `;
            return;
        }
        
        // Si la categoría tiene subcategorías (licores, cócteles)
        if (items.hasSubcategories && items.subcategories) {
            // No mostrar tags en licores y cócteles
            const showTags = !(category === 'licores' || category === 'cocteles');
            renderSubcategories(container, items.subcategories, showTags);
            return;
        }
        
        // Para categorías sin subcategorías (entradas, hamburguesas, etc.)
        // Crear items simplificados (mostrar tags en estas categorías)
        items.forEach(item => {
            const itemElement = createMenuItemElement(item, true);
            container.appendChild(itemElement);
        });
    }
    
    // Renderiza subcategorías con sus items
    function renderSubcategories(container, subcategories, showTags = false) {
        subcategories.forEach(subcategory => {
            // Crear contenedor de subcategoría
            const subcategoryDiv = document.createElement('div');
            subcategoryDiv.className = 'menu-subcategory';
            
            // Título de la subcategoría
            const title = document.createElement('h4');
            title.className = 'subcategory-title';
            title.textContent = subcategory.name;
            subcategoryDiv.appendChild(title);
            
            // Contenedor para items de esta subcategoría
            const itemsContainer = document.createElement('div');
            itemsContainer.className = 'subcategory-items';
            
            // Renderizar items de la subcategoría
            if (subcategory.items && subcategory.items.length > 0) {
                subcategory.items.forEach(item => {
                    const itemElement = createMenuItemElement(item, showTags);
                    itemsContainer.appendChild(itemElement);
                });
            } else {
                itemsContainer.innerHTML = '<p class="no-items">No hay items en esta subcategoría.</p>';
            }
            
            subcategoryDiv.appendChild(itemsContainer);
            container.appendChild(subcategoryDiv);
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

    // Función para crear partículas flotantes
    function createParticles() {
        // Partículas doradas (originales)
        for (let i = 0; i < 15; i++) {
            const p = document.createElement('div');
            p.className = 'particle particle-gold';
            p.style.left = Math.random() * 100 + 'vw';
            p.style.animationDuration = (5 + Math.random() * 5) + 's';
            p.style.animationDelay = Math.random() * 5 + 's';
            document.body.appendChild(p);
        }
        
        // Partículas de colores (rojas, azules, verdes)
        const colors = ['particle-red', 'particle-blue', 'particle-green'];
        for (let i = 0; i < 10; i++) {
            const p = document.createElement('div');
            const colorClass = colors[Math.floor(Math.random() * colors.length)];
            p.className = `particle ${colorClass}`;
            p.style.left = Math.random() * 100 + 'vw';
            p.style.animationDuration = (7 + Math.random() * 8) + 's';
            p.style.animationDelay = Math.random() * 3 + 's';
            p.style.width = '3px';
            p.style.height = '3px';
            p.style.opacity = '0.4';
            document.body.appendChild(p);
        }
    }
    
    // Función para crear un fuego artificial (MÁS GRANDE Y VISTOSO)
    function createFirework(x, y) {
        const firework = document.createElement('div');
        firework.className = 'firework';
        firework.style.left = x + 'px';
        firework.style.top = y + 'px';
        
        // Color principal aleatorio
        const mainColors = ['#E6B325', '#FF5252', '#2196F3', '#4CAF50', '#9C27B0', '#FF9800'];
        const mainColor = mainColors[Math.floor(Math.random() * mainColors.length)];
        firework.style.background = mainColor;
        firework.style.boxShadow = `0 0 20px ${mainColor}, 0 0 40px rgba(255, 255, 255, 0.5)`;
        
        document.body.appendChild(firework);
        
        // Animación de explosión principal (más grande)
        firework.animate([
            { transform: 'scale(0)', opacity: 1 },
            { transform: 'scale(1.5)', opacity: 0.8 },
            { transform: 'scale(2)', opacity: 0 }
        ], {
            duration: 1000,
            easing: 'ease-out'
        });
        
        // Crear chispas (muchas más)
        const sparkCount = 25 + Math.floor(Math.random() * 25);
        for (let i = 0; i < sparkCount; i++) {
            setTimeout(() => {
                const spark = document.createElement('div');
                spark.className = 'firework-spark';
                
                // Color aleatorio para las chispas
                const sparkColors = ['#E6B325', '#FF5252', '#2196F3', '#4CAF50', '#9C27B0', '#FF9800', '#00BCD4', '#FFEB3B'];
                const sparkColor = sparkColors[Math.floor(Math.random() * sparkColors.length)];
                spark.style.background = sparkColor;
                spark.style.boxShadow = `0 0 15px ${sparkColor}, 0 0 30px rgba(255, 255, 255, 0.3)`;
                
                spark.style.left = '5px';
                spark.style.top = '5px';
                
                // Dirección aleatoria para las chispas (más lejos)
                const angle = Math.random() * Math.PI * 2;
                const distance = 30 + Math.random() * 50;  // 30-80 píxeles
                const tx = Math.cos(angle) * distance;
                const ty = Math.sin(angle) * distance;
                
                spark.style.setProperty('--tx', tx + 'px');
                spark.style.setProperty('--ty', ty + 'px');
                
                firework.appendChild(spark);
                
                // Animación de chispa (más lenta y dramática)
                spark.animate([
                    { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                    { transform: `translate(${tx}px, ${ty}px) scale(0.5)`, opacity: 0.5 },
                    { transform: `translate(${tx * 1.2}px, ${ty * 1.2}px) scale(0)`, opacity: 0 }
                ], {
                    duration: 800 + Math.random() * 600,
                    easing: 'ease-out'
                });
                
                // Eliminar chispa después de la animación
                setTimeout(() => {
                    if (spark.parentNode) {
                        spark.remove();
                    }
                }, 1500);
            }, i * 20);
        }
        
        // Crear explosión secundaria después de un breve retraso (30% de probabilidad)
        if (Math.random() < 0.3) {
            setTimeout(() => {
                const secondaryCount = 8 + Math.floor(Math.random() * 8);
                for (let j = 0; j < secondaryCount; j++) {
                    setTimeout(() => {
                        const secondarySpark = document.createElement('div');
                        secondarySpark.className = 'firework-spark';
                        secondarySpark.style.background = mainColor;
                        secondarySpark.style.boxShadow = `0 0 10px ${mainColor}`;
                        secondarySpark.style.left = '5px';
                        secondarySpark.style.top = '5px';
                        
                        const secondaryAngle = Math.random() * Math.PI * 2;
                        const secondaryDistance = 20 + Math.random() * 40;
                        const secondaryTx = Math.cos(secondaryAngle) * secondaryDistance;
                        const secondaryTy = Math.sin(secondaryAngle) * secondaryDistance;
                        
                        firework.appendChild(secondarySpark);
                        
                        secondarySpark.animate([
                            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                            { transform: `translate(${secondaryTx}px, ${secondaryTy}px) scale(0)`, opacity: 0 }
                        ], {
                            duration: 400 + Math.random() * 300,
                            easing: 'ease-out'
                        });
                        
                        setTimeout(() => {
                            if (secondarySpark.parentNode) {
                                secondarySpark.remove();
                            }
                        }, 800);
                    }, j * 50);
                }
            }, 300);
        }
        
        // Eliminar fuego artificial después de la animación
        setTimeout(() => {
            if (firework.parentNode) {
                firework.remove();
            }
        }, 2000);
    }
    
    // Función para crear fuegos artificiales aleatorios (MÁS FRECUENTES)
   function startFireworks() {
    function spawn() {
        const x = 50 + Math.random() * (window.innerWidth - 100);
        const y = 100 + Math.random() * (window.innerHeight - 200);
        
        createFirework(x, y);
        
        // Probabilidad del 20% para el segundo
        if (Math.random() < 0.2) {
            setTimeout(() => {
                createFirework(x + 20, y + 20);
            }, 300);
        }

        // --- CAMBIO AQUÍ: Rango de 3 a 5 segundos ---
        const proximoDisparo = 3000 + Math.random() * 2000; 
        setTimeout(spawn, proximoDisparo);
    }

    spawn(); // Inicia el primer disparo
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
            
            // Crear partículas flotantes
            createParticles();
            
            // Iniciar fuegos artificiales (sutiles, de vez en cuando)
            startFireworks();
            
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