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
    
    // Función para crear un fuego artificial optimizado para rendimiento (más pequeño)
    function createFirework(x, y, onComplete = null) {
        const firework = document.createElement('div');
        firework.className = 'firework';
        firework.style.left = x + 'px';
        firework.style.top = y + 'px';
        
        // Color principal aleatorio
        const mainColors = ['#E6B325', '#FF5252', '#2196F3', '#4CAF50', '#9C27B0', '#FF9800'];
        const mainColor = mainColors[Math.floor(Math.random() * mainColors.length)];
        firework.style.background = mainColor;
        firework.style.boxShadow = `0 0 12px ${mainColor}, 0 0 24px rgba(255, 255, 255, 0.3)`; // Reducido
        
        document.body.appendChild(firework);
        
        // Animación de explosión principal (más pequeña)
        const explosionAnimation = firework.animate([
            { transform: 'scale(0)', opacity: 1 },
            { transform: 'scale(1.2)', opacity: 0.8 }, // Reducido de 1.5
            { transform: 'scale(1.5)', opacity: 0 } // Reducido de 2
        ], {
            duration: 800, // Reducido de 1000
            easing: 'ease-out'
        });
        
        // Crear chispas optimizadas (menos cantidad)
        const sparkCount = 8 + Math.floor(Math.random() * 7); // 8-15 chispas (reducido de 15-25)
        let sparksCreated = 0;
        let sparksRemoved = 0;
        
        for (let i = 0; i < sparkCount; i++) {
            // Usar requestAnimationFrame para mejor rendimiento
            requestAnimationFrame(() => {
                setTimeout(() => {
                    const spark = document.createElement('div');
                    spark.className = 'firework-spark';
                    
                    // Color aleatorio para las chispas
                    const sparkColors = ['#E6B325', '#FF5252', '#2196F3', '#4CAF50', '#9C27B0', '#FF9800'];
                    const sparkColor = sparkColors[Math.floor(Math.random() * sparkColors.length)];
                    spark.style.background = sparkColor;
                    spark.style.boxShadow = `0 0 8px ${sparkColor}, 0 0 16px rgba(255, 255, 255, 0.2)`; // Reducido
                    
                    spark.style.left = '3px'; // Reducido de 5px
                    spark.style.top = '3px'; // Reducido de 5px
                    
                    // Dirección aleatoria para las chispas
                    const angle = Math.random() * Math.PI * 2;
                    const distance = 25 + Math.random() * 35;  // 25-60 píxeles (reducido de 30-80)
                    const tx = Math.cos(angle) * distance;
                    const ty = Math.sin(angle) * distance;
                    
                    firework.appendChild(spark);
                    sparksCreated++;
                    
                    // Animación de chispa optimizada
                    const sparkAnimation = spark.animate([
                        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                        { transform: `translate(${tx}px, ${ty}px) scale(0.3)`, opacity: 0.3 }, // Reducido
                        { transform: `translate(${tx * 1.1}px, ${ty * 1.1}px) scale(0)`, opacity: 0 }
                    ], {
                        duration: 600 + Math.random() * 400, // Reducido
                        easing: 'ease-out'
                    });
                    
                    sparkAnimation.onfinish = () => {
                        if (spark.parentNode) {
                            spark.remove();
                        }
                        sparksRemoved++;
                        
                        // Verificar si todas las chispas han sido eliminadas
                        if (sparksRemoved === sparksCreated && sparksCreated === sparkCount) {
                            cleanupFirework();
                        }
                    };
                }, i * 30); // Espaciado mayor (30ms vs 20ms)
            });
        }
        
        // Función para limpiar el fuego artificial
        function cleanupFirework() {
            setTimeout(() => {
                if (firework.parentNode) {
                    firework.remove();
                }
                if (onComplete && typeof onComplete === 'function') {
                    onComplete();
                }
            }, 500); // Tiempo adicional para asegurar que las animaciones terminen
        }
        
        // Configurar limpieza automática después de la animación principal
        explosionAnimation.onfinish = () => {
            // Si no hay chispas, limpiar inmediatamente
            if (sparkCount === 0) {
                cleanupFirework();
            } else {
                // Esperar a que todas las chispas terminen (máximo 2 segundos)
                setTimeout(cleanupFirework, 2000);
            }
        };
        
        // Eliminar explosiones secundarias para mejorar rendimiento
        // (comentado para reducir complejidad)
        /*
        // Crear explosión secundaria después de un breve retraso (20% de probabilidad, reducido)
        if (Math.random() < 0.2) {
            setTimeout(() => {
                // Crear pequeñas chispas secundarias (muy pocas)
                const secondaryCount = 2 + Math.floor(Math.random() * 3);
                for (let j = 0; j < secondaryCount; j++) {
                    setTimeout(() => {
                        const secondarySpark = document.createElement('div');
                        secondarySpark.className = 'firework-spark';
                        secondarySpark.style.background = mainColor;
                        secondarySpark.style.boxShadow = `0 0 6px ${mainColor}`;
                        secondarySpark.style.left = '3px';
                        secondarySpark.style.top = '3px';
                        
                        const secondaryAngle = Math.random() * Math.PI * 2;
                        const secondaryDistance = 15 + Math.random() * 25;
                        const secondaryTx = Math.cos(secondaryAngle) * secondaryDistance;
                        const secondaryTy = Math.sin(secondaryAngle) * secondaryDistance;
                        
                        firework.appendChild(secondarySpark);
                        
                        const secondaryAnimation = secondarySpark.animate([
                            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                            { transform: `translate(${secondaryTx}px, ${secondaryTy}px) scale(0)`, opacity: 0 }
                        ], {
                            duration: 300 + Math.random() * 200,
                            easing: 'ease-out'
                        });
                        
                        secondaryAnimation.onfinish = () => {
                            if (secondarySpark.parentNode) {
                                secondarySpark.remove();
                            }
                        };
                    }, j * 80);
                }
            }, 200);
        }
        */
    }
    
    // Función para crear fuegos artificiales orgánicos optimizados para rendimiento
    function startFireworks() {
        let activeFireworks = 0;
        const MAX_ACTIVE_FIREWORKS = 8; // Límite máximo de fuegos activos simultáneamente
        
        // Función para crear un grupo de fuegos artificiales (1-3 a la vez)
        function createFireworkGroup() {
            if (activeFireworks >= MAX_ACTIVE_FIREWORKS) {
                return; // No crear más fuegos si ya hay muchos activos
            }
            
            const groupSize = 1 + Math.floor(Math.random() * 3); // 1-3 fuegos por grupo (reducido)
            
            for (let i = 0; i < groupSize; i++) {
                setTimeout(() => {
                    if (activeFireworks >= MAX_ACTIVE_FIREWORKS) {
                        return;
                    }
                    
                    // Posición aleatoria pero agrupada
                    const baseX = 100 + Math.random() * (window.innerWidth - 200);
                    const baseY = 150 + Math.random() * (window.innerHeight - 300);
                    
                    // Variación dentro del grupo
                    const x = baseX + (Math.random() * 80 - 40);
                    const y = baseY + (Math.random() * 60 - 30);
                    
                    activeFireworks++;
                    createFirework(x, y, () => {
                        activeFireworks--;
                    });
                    
                    // 20% de probabilidad de fuego adicional cercano (reducido)
                    if (Math.random() < 0.2) {
                        setTimeout(() => {
                            if (activeFireworks >= MAX_ACTIVE_FIREWORKS) {
                                return;
                            }
                            activeFireworks++;
                            createFirework(x + (Math.random() * 30 - 15), y + (Math.random() * 30 - 15), () => {
                                activeFireworks--;
                            });
                        }, 200 + Math.random() * 300);
                    }
                }, i * 300); // Espaciado mayor entre fuegos del mismo grupo (300ms)
            }
        }
        
        // Función principal de ciclo
        function spawnCycle() {
            // Crear un grupo de fuegos
            createFireworkGroup();
            
            // Tiempo hasta el próximo grupo (menos frecuente para mejor rendimiento)
            const nextGroupDelay = 3000 + Math.random() * 4000; // 3-7 segundos
            
            // 30% de probabilidad de crear un pequeño grupo secundario (reducido)
            if (Math.random() < 0.3) {
                setTimeout(() => {
                    const secondarySize = 1 + Math.floor(Math.random() * 2); // 1-2 fuegos
                    for (let j = 0; j < secondarySize; j++) {
                        setTimeout(() => {
                            if (activeFireworks >= MAX_ACTIVE_FIREWORKS) {
                                return;
                            }
                            const x = 50 + Math.random() * (window.innerWidth - 100);
                            const y = 100 + Math.random() * (window.innerHeight - 200);
                            activeFireworks++;
                            createFirework(x, y, () => {
                                activeFireworks--;
                            });
                        }, j * 300); // Espaciado mayor
                    }
                }, nextGroupDelay / 2);
            }
            
            // Programar próximo ciclo usando requestAnimationFrame para mejor sincronización
            setTimeout(() => {
                requestAnimationFrame(spawnCycle);
            }, nextGroupDelay);
        }
        
        // Iniciar el ciclo después de un breve retraso inicial
        setTimeout(() => {
            requestAnimationFrame(spawnCycle);
        }, 1000);
        
        // También crear algunos fuegos individuales esporádicos (menos frecuentes)
        function spawnSporadic() {
            setTimeout(() => {
                // 40% de probabilidad de fuego individual (reducido)
                if (Math.random() < 0.4 && activeFireworks < MAX_ACTIVE_FIREWORKS) {
                    const x = 50 + Math.random() * (window.innerWidth - 100);
                    const y = 100 + Math.random() * (window.innerHeight - 200);
                    activeFireworks++;
                    createFirework(x, y, () => {
                        activeFireworks--;
                    });
                }
                
                // Siguiente fuego esporádico
                spawnSporadic();
            }, 2000 + Math.random() * 5000); // 2-7 segundos (menos frecuente)
        }
        
        // Iniciar fuegos esporádicos después de un retraso
        setTimeout(spawnSporadic, 3000);
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

    // Función para crear destellos dorados en la pantalla de carga
    function createGoldenSparkles() {
        const welcomeScreen = document.querySelector('.welcome-screen');
        if (!welcomeScreen) return;
        
        // Crear múltiples destellos
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.className = 'golden-sparkle';
                
                // Posición aleatoria dentro de la pantalla de carga
                const x = Math.random() * 100;
                const y = Math.random() * 100;
                sparkle.style.left = x + '%';
                sparkle.style.top = y + '%';
                
                // Tamaño aleatorio
                const size = 4 + Math.random() * 8;
                sparkle.style.width = size + 'px';
                sparkle.style.height = size + 'px';
                
                // Intensidad del color
                const intensity = 0.6 + Math.random() * 0.4;
                sparkle.style.opacity = intensity.toString();
                
                // Color dorado con variaciones
                const goldVariations = ['#E6B325', '#F8E6A8', '#D4AF37', '#FFD700'];
                const goldColor = goldVariations[Math.floor(Math.random() * goldVariations.length)];
                sparkle.style.background = goldColor;
                sparkle.style.boxShadow = `0 0 ${10 + Math.random() * 15}px ${goldColor}, 0 0 ${20 + Math.random() * 30}px rgba(230, 179, 37, 0.7)`;
                
                welcomeScreen.appendChild(sparkle);
                
                // Animación combinada
                const duration = 2000 + Math.random() * 3000;
                const delay = Math.random() * 1000;
                
                // Animación de parpadeo
                sparkle.animate([
                    { opacity: 0, transform: 'scale(0.5)' },
                    { opacity: intensity, transform: 'scale(1.2)' },
                    { opacity: 0, transform: 'scale(0.5)' }
                ], {
                    duration: duration,
                    delay: delay,
                    easing: 'ease-in-out',
                    iterations: Infinity
                });
                
                // Animación de movimiento circular suave
                const moveX = (Math.random() * 40 - 20) + 'px';
                const moveY = (Math.random() * 40 - 20) + 'px';
                
                sparkle.animate([
                    { transform: 'translate(0, 0) rotate(0deg)' },
                    { transform: `translate(${moveX}, ${moveY}) rotate(180deg)` },
                    { transform: 'translate(0, 0) rotate(360deg)' }
                ], {
                    duration: duration * 1.5,
                    delay: delay,
                    easing: 'ease-in-out',
                    iterations: Infinity
                });
                
                // Eliminar destello cuando la pantalla de carga desaparezca
                const observer = new MutationObserver(() => {
                    if (!document.contains(welcomeScreen) || welcomeScreen.style.display === 'none') {
                        if (sparkle.parentNode) {
                            sparkle.remove();
                        }
                        observer.disconnect();
                    }
                });
                
                observer.observe(document.body, { childList: true, subtree: true });
            }, i * 200);
        }
    }

    // Funcionalidad de búsqueda
    function setupSearch() {
        const searchInput = document.querySelector('.search-input');
        const clearButton = document.querySelector('.search-clear');
        const searchResults = document.querySelector('.search-results');
        
        if (!searchInput || !clearButton || !searchResults) {
            Utils.log('Elementos de búsqueda no encontrados');
            return;
        }
        
        let searchTimeout = null;
        
        // Función para buscar en los datos del menú
        function performSearch(query) {
            if (!query.trim()) {
                searchResults.innerHTML = '';
                searchResults.classList.remove('active');
                return;
            }
            
            const normalizedQuery = query.toLowerCase().trim();
            const results = [];
            
            // Buscar en todas las categorías
            for (const categoryId in menuData) {
                const categoryData = menuData[categoryId];
                
                if (categoryData.hasSubcategories) {
                    // Buscar en subcategorías
                    categoryData.subcategories.forEach(subcat => {
                        subcat.items.forEach(item => {
                            if (matchesSearch(item, normalizedQuery)) {
                                results.push({
                                    ...item,
                                    category: categoryId,
                                    subcategory: subcat.name
                                });
                            }
                        });
                    });
                } else {
                    // Buscar en categorías simples
                    categoryData.forEach(item => {
                        if (matchesSearch(item, normalizedQuery)) {
                            results.push({
                                ...item,
                                category: categoryId,
                                subcategory: null
                            });
                        }
                    });
                }
            }
            
            displaySearchResults(results, normalizedQuery);
        }
        
        // Función para verificar si un item coincide con la búsqueda
        function matchesSearch(item, query) {
            const searchFields = [
                item.nombre.toLowerCase(),
                item.descripcion.toLowerCase(),
                ...(item.tags || []).map(tag => tag.toLowerCase())
            ];
            
            return searchFields.some(field => field.includes(query));
        }
        
        // Función para mostrar resultados
        function displaySearchResults(results, query) {
            searchResults.innerHTML = '';
            
            if (results.length === 0) {
                searchResults.innerHTML = `
                    <div class="search-result-item no-results">
                        <i class="fas fa-search"></i>
                        <div class="result-content">
                            <h4>No se encontraron resultados</h4>
                            <p>No hay elementos que coincidan con "${query}"</p>
                        </div>
                    </div>
                `;
                searchResults.classList.add('active');
                return;
            }
            
            // Limitar a 10 resultados
            const limitedResults = results.slice(0, 10);
            
            limitedResults.forEach(result => {
                const resultElement = document.createElement('div');
                resultElement.className = 'search-result-item';
                resultElement.innerHTML = `
                    <div class="result-content">
                        <h4>${result.nombre}</h4>
                        <p class="result-description">${result.descripcion}</p>
                        <div class="result-meta">
                            <span class="result-price">${Utils.formatPrice(result.precio)}</span>
                            <span class="result-category">${result.subcategory || result.category}</span>
                        </div>
                    </div>
                    <button class="result-action" aria-label="Ver ${result.nombre}">
                        <i class="fas fa-arrow-right"></i>
                    </button>
                `;
                
                // Agregar evento para navegar al elemento
                resultElement.addEventListener('click', () => {
                    navigateToSearchResult(result);
                });
                
                searchResults.appendChild(resultElement);
            });
            
            searchResults.classList.add('active');
        }
        
        // Función para navegar a un resultado
        function navigateToSearchResult(result) {
            // Cerrar resultados
            searchResults.classList.remove('active');
            searchInput.value = '';
            
            // Navegar a la categoría
            navigateToCategory(result.category);
            
            // Desplazarse al elemento después de un breve retraso
            setTimeout(() => {
                const categorySection = document.getElementById(result.category);
                if (categorySection) {
                    // Buscar el elemento dentro de la categoría
                    const itemElement = categorySection.querySelector(`[data-item-id="${result.id}"]`);
                    if (itemElement) {
                        // Resaltar el elemento
                        itemElement.classList.add('highlighted');
                        
                        // Desplazarse al elemento
                        itemElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                        
                        // Quitar resaltado después de 3 segundos
                        setTimeout(() => {
                            itemElement.classList.remove('highlighted');
                        }, 3000);
                    }
                }
            }, 500);
        }
        
        // Event listeners
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            
            // Mostrar/ocultar botón de limpiar
            if (query.trim()) {
                clearButton.style.display = 'flex';
            } else {
                clearButton.style.display = 'none';
                searchResults.classList.remove('active');
            }
            
            // Debounce para evitar búsquedas frecuentes
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(query);
            }, 300);
        });
        
        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim()) {
                searchResults.classList.add('active');
            }
        });
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                searchResults.classList.remove('active');
            }
        });
        
        clearButton.addEventListener('click', () => {
            searchInput.value = '';
            searchResults.innerHTML = '';
            searchResults.classList.remove('active');
            clearButton.style.display = 'none';
            searchInput.focus();
        });
        
        // Manejar teclas especiales
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchResults.classList.remove('active');
                searchInput.blur();
            }
            
            if (e.key === 'Enter' && searchInput.value.trim()) {
                const firstResult = searchResults.querySelector('.search-result-item');
                if (firstResult) {
                    firstResult.click();
                }
            }
        });
        
        Utils.log('Buscador configurado exitosamente');
    }
    
    // Inicializa la aplicación
    async function init() {
        try {
            Utils.log('Inicializando aplicación...');
            
            // Crear destellos dorados en la pantalla de carga
            createGoldenSparkles();
            
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
            
            // Configurar buscador
            setupSearch();
            
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