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
        
        // Crear chispas (reducidas para efecto más sutil con múltiples fuegos)
        const sparkCount = 15 + Math.floor(Math.random() * 10); // 15-25 chispas
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
    
    // Función para crear fuegos artificiales orgánicos (múltiples a la vez, efecto de fiesta no invasivo)
    function startFireworks() {
        // Función para crear un grupo de fuegos artificiales (2-4 a la vez)
        function createFireworkGroup() {
            const groupSize = 2 + Math.floor(Math.random() * 3); // 2-4 fuegos por grupo
            
            for (let i = 0; i < groupSize; i++) {
                setTimeout(() => {
                    // Posición aleatoria pero agrupada
                    const baseX = 100 + Math.random() * (window.innerWidth - 200);
                    const baseY = 150 + Math.random() * (window.innerHeight - 300);
                    
                    // Variación dentro del grupo
                    const x = baseX + (Math.random() * 80 - 40);
                    const y = baseY + (Math.random() * 60 - 30);
                    
                    createFirework(x, y);
                    
                    // 30% de probabilidad de fuego adicional cercano después de un breve retraso
                    if (Math.random() < 0.3) {
                        setTimeout(() => {
                            createFirework(x + (Math.random() * 30 - 15), y + (Math.random() * 30 - 15));
                        }, 200 + Math.random() * 300);
                    }
                }, i * 150); // Espaciado entre fuegos del mismo grupo
            }
        }
        
        // Función principal de ciclo
        function spawnCycle() {
            // Crear un grupo de fuegos
            createFireworkGroup();
            
            // Tiempo hasta el próximo grupo (más frecuente para efecto orgánico)
            const nextGroupDelay = 2000 + Math.random() * 3000; // 2-5 segundos
            
            // 40% de probabilidad de crear un pequeño grupo secundario después de un tiempo
            if (Math.random() < 0.4) {
                setTimeout(() => {
                    const secondarySize = 1 + Math.floor(Math.random() * 2); // 1-2 fuegos
                    for (let j = 0; j < secondarySize; j++) {
                        setTimeout(() => {
                            const x = 50 + Math.random() * (window.innerWidth - 100);
                            const y = 100 + Math.random() * (window.innerHeight - 200);
                            createFirework(x, y);
                        }, j * 200);
                    }
                }, nextGroupDelay / 2);
            }
            
            // Programar próximo ciclo
            setTimeout(spawnCycle, nextGroupDelay);
        }
        
        // Iniciar el ciclo
        spawnCycle();
        
        // También crear algunos fuegos individuales esporádicos
        function spawnSporadic() {
            setTimeout(() => {
                // 60% de probabilidad de fuego individual
                if (Math.random() < 0.6) {
                    const x = 50 + Math.random() * (window.innerWidth - 100);
                    const y = 100 + Math.random() * (window.innerHeight - 200);
                    createFirework(x, y);
                }
                
                // Siguiente fuego esporádico
                spawnSporadic();
            }, 1000 + Math.random() * 4000); // 1-5 segundos
        }
        
        // Iniciar fuegos esporádicos
        spawnSporadic();
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