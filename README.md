# OYE BONITA - La Casa del Vallenato

![Estado del Proyecto](https://img.shields.io/badge/Estado-En%20Desarrollo-yellow)
![Licencia](https://img.shields.io/badge/Licencia-MIT-blue)
![Tecnologías](https://img.shields.io/badge/Tecnologías-HTML%2C%20CSS%2C%20JS-green)

Sitio web para el restaurante **"OYE BONITA - La Casa del Vallenato"**, especializado en gastronomía colombiana y ambiente vallenato.

## 📋 Descripción

Este proyecto es un sitio web moderno y responsive para un restaurante temático de vallenato. Incluye:
- Diseño atractivo con paleta de colores inspirada en la cultura colombiana
- Secciones informativas (inicio, menú, eventos, reservas, ubicación)
- Interfaz completamente responsive (adaptable a móviles, tablets y desktop)
- Estructura modular y escalable para futuras expansiones

## 🏗️ Estructura del Proyecto

```
menu oye bonita/
├── index.html          # Página principal HTML
├── style.css           # Estilos CSS con variables y diseño responsive
├── script.js           # Lógica JavaScript para interactividad
├── assets/             # Carpeta para imágenes, iconos y recursos
│   ├── images/         # Imágenes del restaurante y platos
│   ├── icons/          # Iconos personalizados
│   └── fonts/          # Fuentes locales (si se requieren)
└── README.md           # Este archivo de documentación
```

## 🎨 Paleta de Colores

La paleta está inspirada en la cultura colombiana y el vallenato:

| Color | Código HEX | Uso |
|-------|------------|-----|
| Rojo Vibrante | `#E63946` | Botones principales, acentos |
| Azul Profundo | `#457B9D` | Elementos secundarios |
| Naranja Dorado | `#F4A261` | Acentos, hover states |
| Verde Esmeralda | `#2A9D8F` | Elementos de éxito, notificaciones |
| Azul Oscuro | `#1D3557` | Textos, headers, fondo oscuro |
| Blanco Crema | `#F1FAEE` | Fondos claros, cards |

## 🚀 Características Implementadas

### ✅ Completadas
- **Estructura HTML5 semántica** con todas las secciones requeridas
- **CSS con variables personalizadas** para mantener consistencia
- **Diseño responsive** que se adapta a diferentes dispositivos
- **Tipografía moderna** con Google Fonts (Poppins y Montserrat)
- **Iconografía** con Font Awesome 6
- **Smooth scrolling** para navegación interna
- **Sistema de grid CSS** para layouts flexibles
- **Componentes reutilizables** (botones, cards, headers, footers)

### 🔄 En Desarrollo
- Sistema de menú interactivo con categorías
- Carrito de compras para pedidos en línea
- Sistema de reservas de mesas
- Galería de imágenes del restaurante
- Integración con APIs de pago

## 📱 Secciones del Sitio

1. **Header/Navegación**
   - Logo y eslogan
   - Menú de navegación principal
   - Botón de pedidos

2. **Hero Section**
   - Mensaje principal
   - Llamados a acción (Ver Menú, Reservar Mesa)
   - Imagen representativa

3. **Sección de Menú**
   - Categorías de productos (platos fuertes, bebidas, postres, especiales)
   - Cards informativas
   - Nota sobre menú en desarrollo

4. **Footer**
   - Información de contacto
   - Horarios de atención
   - Redes sociales
   - Derechos de autor

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica y accesible
- **CSS3**: Variables CSS, Flexbox, Grid, Media Queries
- **JavaScript (ES6)**: Interactividad básica
- **Font Awesome 6**: Iconografía
- **Google Fonts**: Tipografía moderna

## 📦 Instalación y Uso

1. **Clonar o descargar** el proyecto
2. **Abrir** el archivo `index.html` en cualquier navegador moderno
3. **No se requiere** servidor ni instalación de dependencias

Para desarrollo:
```bash
# Navegar al directorio del proyecto
cd "menu oye bonita"

# Abrir en editor de código (VS Code recomendado)
code .
```

## 🔧 Personalización

### Cambiar colores
Editar las variables CSS en `style.css` (sección `:root`):
```css
:root {
    --primary: #NUEVO_COLOR;
    --secondary: #NUEVO_COLOR;
    /* ... otras variables */
}
```

### Agregar nuevas secciones
1. Añadir estructura HTML en `index.html`
2. Estilizar en `style.css`
3. Agregar interactividad en `script.js` si es necesario

### Agregar imágenes
Colocar imágenes en `assets/images/` y actualizar referencias en HTML.

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver archivo `LICENSE` para más detalles.

## 👥 Contribuciones

Las contribuciones son bienvenidas. Para contribuir:

1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Contacto

**Equipo de Desarrollo OYE BONITA**
- Email: desarrollo@oyebonita.com
- Sitio web: [www.oyebonita.com](https://www.oyebonita.com)
- GitHub: [@oyebonita](https://github.com/oyebonita)

---

**Nota**: Este es un proyecto en desarrollo. Algunas funcionalidades pueden estar en fase de implementación.