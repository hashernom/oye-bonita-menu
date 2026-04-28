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
    
    // Función para crear notas musicales flotantes
    function createFloatingMusicNotes() {
        const symbols = ['♩', '♪', '♫', '♬', '🎵', '🎶'];
        const noteColors = ['#FFFFFF', '#F5F5F5', '#E6B325', '#D4AF37', '#F8E6A8'];
        
        function spawnNote() {
            const note = document.createElement('div');
            note.className = 'music-note';
            
            // Seleccionar símbolo aleatorio
            const symbol = symbols[Math.floor(Math.random() * symbols.length)];
            note.textContent = symbol;
            
            // Posición horizontal aleatoria
            note.style.left = (Math.random() * 90 + 5) + 'vw';
            
            // Tamaño y velocidad variable
            const sizeVariants = ['', 'music-note--slow', 'music-note--fast'];
            const variant = sizeVariants[Math.floor(Math.random() * sizeVariants.length)];
            if (variant) note.classList.add(variant);
            
            // Color aleatorio (usando filter drop-shadow ya definido en CSS)
            const color = noteColors[Math.floor(Math.random() * noteColors.length)];
            note.style.color = color;
            
            // 30% de probabilidad de versión dorada con brillo extra
            if (Math.random() < 0.3) {
                note.classList.add('music-note--gold');
            }
            
            // Variables CSS personalizadas para la animación
            const driftX = (Math.random() * 80 - 40) + 'px';
            const driftX2 = (Math.random() * 80 - 40) + 'px';
            const driftX3 = (Math.random() * 80 - 40) + 'px';
            const rotateDeg = (Math.random() * 60 - 30) + 'deg';
            const rotateDeg2 = (Math.random() * 60 - 30) + 'deg';
            const rotateDeg3 = (Math.random() * 60 - 30) + 'deg';
            
            note.style.setProperty('--drift-x', driftX);
            note.style.setProperty('--drift-x2', driftX2);
            note.style.setProperty('--drift-x3', driftX3);
            note.style.setProperty('--rotate-deg', rotateDeg);
            note.style.setProperty('--rotate-deg2', rotateDeg2);
            note.style.setProperty('--rotate-deg3', rotateDeg3);
            
            // Posición inicial (desde abajo)
            note.style.bottom = '-5vh';
            
            document.body.appendChild(note);
            
            // Eliminar la nota después de que termine la animación
            const duration = variant === 'music-note--slow' ? 12000 :
                           variant === 'music-note--fast' ? 6000 : 8000;
            
            setTimeout(() => {
                if (note.parentNode) {
                    note.remove();
                }
            }, duration + 2000); // +2s por el animation-delay
        }
        
        // Crear notas periódicamente
        function scheduleNextNote() {
            const delay = 800 + Math.random() * 2000; // 0.8-2.8 segundos entre notas
            
            setTimeout(() => {
                // Crear entre 1 y 3 notas simultáneas
                const count = 1 + Math.floor(Math.random() * 3);
                for (let i = 0; i < count; i++) {
                    setTimeout(spawnNote, i * 300);
                }
                
                scheduleNextNote();
            }, delay);
        }
        
        // Iniciar después de un retraso inicial
        setTimeout(scheduleNextNote, 2000);
        
        // Crear algunas notas iniciales
        for (let i = 0; i < 5; i++) {
            setTimeout(spawnNote, i * 400);
        }
        
        Utils.log('Notas musicales flotantes creadas');
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
        
        // Función para buscar en los datos del menú (incluyendo categorías)
        function performSearch(query) {
            if (!query.trim()) {
                searchResults.innerHTML = '';
                searchResults.classList.remove('active');
                return;
            }
            
            const normalizedQuery = query.toLowerCase().trim();
            const results = [];
            
            // Mapeo de IDs de categoría a nombres para búsqueda
            const categoryNames = {
                'entradas': ['entradas', 'entrada', 'aperitivos', 'aperitivo', 'inicio'],
                'hamburguesas': ['hamburguesas', 'hamburguesa', 'hamburguesas', 'burger', 'burgers'],
                'para-picar': ['para picar', 'picar', 'picadas', 'picada', 'compartir', 'compartidos'],
                'licores': ['licores', 'licor', 'bebidas alcoholicas', 'alcohol', 'tragos fuertes', 'aguardiente', 'ron', 'whisky', 'tequila', 'cervezas'],
                'cocteles': ['cocteles', 'coctel', 'tragos', 'bebidas', 'cocktails', 'mojitos', 'daiquiris', 'micheladas']
            };
            
            // Primero buscar categorías que coincidan
            for (const categoryId in categoryNames) {
                const searchTerms = categoryNames[categoryId];
                const matchesCategory = searchTerms.some(term =>
                    term.includes(normalizedQuery) || normalizedQuery.includes(term)
                );
                
                if (matchesCategory) {
                    results.push({
                        type: 'category',
                        id: categoryId,
                        name: getCategoryDisplayName(categoryId),
                        description: getCategoryDescription(categoryId),
                        priority: 1 // Alta prioridad para categorías
                    });
                }
            }
            
            // Luego buscar items del menú
            for (const categoryId in menuData) {
                const categoryData = menuData[categoryId];
                
                if (categoryData.hasSubcategories) {
                    // Buscar en subcategorías
                    categoryData.subcategories.forEach(subcat => {
                        subcat.items.forEach(item => {
                            if (matchesSearch(item, normalizedQuery)) {
                                results.push({
                                    type: 'item',
                                    ...item,
                                    category: categoryId,
                                    subcategory: subcat.name,
                                    priority: 2 // Prioridad media para items
                                });
                            }
                        });
                    });
                } else {
                    // Buscar en categorías simples
                    categoryData.forEach(item => {
                        if (matchesSearch(item, normalizedQuery)) {
                            results.push({
                                type: 'item',
                                ...item,
                                category: categoryId,
                                subcategory: null,
                                priority: 2
                            });
                        }
                    });
                }
            }
            
            // Ordenar resultados: primero categorías, luego items
            results.sort((a, b) => a.priority - b.priority);
            
            displaySearchResults(results, normalizedQuery);
        }
        
        // Función para obtener nombre de categoría para mostrar
        function getCategoryDisplayName(categoryId) {
            const names = {
                'entradas': 'Entradas',
                'hamburguesas': 'Hamburguesas',
                'para-picar': 'Para Picar',
                'licores': 'Licores',
                'cocteles': 'Cócteles'
            };
            return names[categoryId] || categoryId;
        }
        
        // Función para obtener descripción de categoría
        function getCategoryDescription(categoryId) {
            const descriptions = {
                'entradas': 'Aperitivos y entradas para comenzar',
                'hamburguesas': 'Hamburguesas artesanales con ingredientes frescos',
                'para-picar': 'Platos para compartir en grupo',
                'licores': 'Bebidas alcohólicas y licores premium',
                'cocteles': 'Cócteles clásicos y de autor'
            };
            return descriptions[categoryId] || `Sección de ${getCategoryDisplayName(categoryId)}`;
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
        
        // Función para mostrar resultados (categorías e items)
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
                
                if (result.type === 'category') {
                    // Resultado de categoría
                    resultElement.innerHTML = `
                        <div class="result-content">
                            <div class="result-category-badge">
                                <i class="fas fa-folder"></i>
                                <span>CATEGORÍA</span>
                            </div>
                            <h4>${result.name}</h4>
                            <p class="result-description">${result.description}</p>
                            <div class="result-meta">
                                <span class="result-category">Sección completa</span>
                            </div>
                        </div>
                        <button class="result-action" aria-label="Ir a ${result.name}">
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    `;
                } else {
                    // Resultado de item
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
                }
                
                // Agregar evento para navegar al elemento
                resultElement.addEventListener('click', () => {
                    navigateToSearchResult(result);
                });
                
                searchResults.appendChild(resultElement);
            });
            
            searchResults.classList.add('active');
        }
        
        // Función para navegar a un resultado (categoría o item)
        function navigateToSearchResult(result) {
            // Cerrar resultados
            searchResults.classList.remove('active');
            searchInput.value = '';
            
            if (result.type === 'category') {
                // Navegar directamente a la categoría
                navigateToCategory(result.id);
                
                // Resaltar la sección de categoría
                setTimeout(() => {
                    const categorySection = document.getElementById(result.id);
                    if (categorySection) {
                        // Resaltar toda la sección
                        categorySection.classList.add('highlighted');
                        
                        // Desplazarse a la categoría
                        categorySection.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                        
                        // Quitar resaltado después de 3 segundos
                        setTimeout(() => {
                            categorySection.classList.remove('highlighted');
                        }, 3000);
                    }
                }, 300);
            } else {
                // Navegar a la categoría del item
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
            
            // Crear notas musicales flotantes
            createFloatingMusicNotes();
            
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