# OYE BONITA - La Casa del Vallenato

## Manual de Usuario

Bienvenido. Este manual está escrito para que cualquier persona, **sin saber de programación**, pueda usar, modificar y publicar el menú digital de **Oye Bonita**.

---

## ¿Qué es esto?

Es un **menú digital interactivo** para el restaurante Oye Bonita. Funciona abriendo el archivo `index.html` en cualquier navegador (Chrome, Edge, Firefox, Safari). No necesitas instalar nada ni pagar un servidor para probarlo.

Para que otros lo vean desde sus celulares, solo hay que subir los archivos a un hosting gratuito como **Cloudflare Pages**, **Netlify**, **Vercel** o **GitHub Pages**.

---

## Archivos del proyecto

| Archivo | ¿Qué es? | ¿Lo editas? |
|---------|----------|-------------|
| `index.html` | Menú completo (comidas y bebidas) | ❌ No |
| `menu-comidas.html` | Menú reducido (solo comidas) | ❌ No |
| `style.css` | Colores, tamaños y diseño | ❌ No |
| `script.js` | Lógica, animaciones y búsqueda | ❌ No |
| `data/menu-data.js` | **Datos del menú** | ✅ **Sí, aquí editas** |
| `data/menu-data-backup.json` | Copia de seguridad del menú | ❌ Solo en emergencias |
| `logo-oye-bonita.png` | Logo del restaurante | ❌ No |
| `qr-menu-completo.png` | QR del menú completo | ❌ No |
| `qr-menu-comidas.png` | QR del menú de comidas | ❌ No |
| `README.md` | Este manual | ❌ No |

> **Regla de oro:** para cambiar platos, precios o descripciones, edita únicamente `data/menu-data.js`.

---

## Cómo editar el menú

### 1. Abrir el archivo correcto

1. Abre la carpeta del proyecto.
2. Entra a la carpeta `data`.
3. Haz clic derecho en `menu-data.js` → **Abrir con** → **Bloc de notas** (o cualquier editor de texto).

### 2. Entender la estructura

El archivo comienza con esta línea:

```javascript
window.EMBEDDED_MENU_DATA = {
```

**No la borres ni la modifiques.** Después de esa línea viene el menú organizado en categorías.

```json
{
  "categories": [
    {
      "id": "entradas",
      "name": "ENTRADAS",
      "items": [
        {
          "id": "chorizos-caramelizados",
          "name": "Chorizos Caramelizados",
          "description": "Chorizos artesanales glaseados, acompañados con papas en cascos.",
          "price": 15000,
          "tags": []
        }
      ]
    }
  ]
}
```

- `"categories"` → Las secciones del menú (Entradas, Hamburguesas, etc.).
- `"items"` → Los platos dentro de cada sección.
- `"name"` → Nombre del plato.
- `"description"` → Descripción del plato.
- `"price"` → Precio en pesos colombianos, **sin puntos ni comas** (`15000` = $15.000).
- `"tags"` → Etiquetas opcionales. Déjalo como `[]` si no usas etiquetas.

### 3. Cambiar un precio

Busca el plato y cambia solo el número:

```json
"price": 18000
```

### 4. Cambiar una descripción

Cambia el texto entre comillas:

```json
"description": "Chorizos artesanales glaseados, acompañados con papas en cascos."
```

### 5. Agregar un plato nuevo

Copia este bloque dentro de `"items"` de la categoría que quieras, después del último plato:

```json
{
  "id": "nombre-corto-sin-espacios",
  "name": "Nombre del Plato",
  "description": "Descripción del plato aquí.",
  "price": 20000,
  "tags": []
}
```

> **Importante:** después de cada plato debe haber una coma `,`, excepto después del último.

### 6. Categorías con subcategorías

Las categorías **Licores** y **Cócteles** tienen subcategorías. Edítalas igual: busca la subcategoría y modifica sus `"items"`.

---

## Cómo cambiar el nombre, dirección o teléfono

1. Abre `index.html` con el Bloc de notas.
2. Presiona `Ctrl + B` y busca el texto que quieres cambiar (por ejemplo: `Calle 5 No. 31-45` o `318 789 9803`).
3. Cámbialo con cuidado de no borrar los símbolos `<`, `>`, `/` o `"`.
4. Repite el cambio en `menu-comidas.html` si quieres que ambos menús muestren la misma información.

---

## Cómo cambiar el logo

1. Reemplaza el archivo `logo-oye-bonita.png` por tu nuevo logo.
2. El archivo debe llamarse exactamente `logo-oye-bonita.png`.
3. Recarga la página para ver el cambio.

---

## Cómo publicar el menú en internet

1. Crea una cuenta gratuita en **Cloudflare Pages**, **Netlify**, **Vercel** o **GitHub Pages**.
2. Sube todos los archivos de esta carpeta.
3. La página principal será `index.html`.
4. El menú completo estará disponible en `https://tudominio.com`.
5. El menú de solo comidas estará en `https://tudominio.com/menu-comidas.html`.

### Si necesitas regenerar los códigos QR

Usa cualquier generador de QR gratuito en internet (por ejemplo, `qr-code-generator.com`) e ingresa estas URLs:

- Menú completo: `https://tudominio.com`
- Menú de comidas: `https://tudominio.com/menu-comidas.html`

Descarga las imágenes y reemplaza `qr-menu-completo.png` y `qr-menu-comidas.png` si es necesario.

---

## Preguntas frecuentes

### ¿Se necesita internet para que funcione?
Solo la primera vez que se abre, para cargar las fuentes y los iconos. Después, el menú puede usarse sin conexión.

### ¿Funciona en celulares?
Sí. El menú se adapta automáticamente a celulares, tablets y computadores.

### ¿Puedo dañar algo si edito el menú?
Si borras una coma o una comilla sin querer, la página puede dejar de cargar. **Siempre guarda una copia de seguridad** de `data/menu-data.js` antes de editar.

### ¿Dónde está la copia de seguridad?
El proyecto incluye `data/menu-data-backup.json`. Si algo sale mal, puedes restaurar el menú copiando el contenido de ese archivo.

### ¿Qué hago si la página no carga después de editar?
1. Revisa que no falten comas entre los platos.
2. Revisa que los precios sean solo números (sin puntos, comas ni signos de pesos).
3. Revisa que todas las comillas `"` estén cerradas.
4. Si no encuentras el error, restaura la copia de seguridad.

---

## Características del sitio

- Menú interactivo con navegación por categorías.
- Buscador de platos en tiempo real.
- Diseño adaptable a cualquier pantalla.
- Notas musicales y partículas decorativas.
- Pantalla de bienvenida animada.
- Paleta de colores vallenata (negro y dorado).
- Sin necesidad de servidor ni instalación para probarlo localmente.

---

*Oye Bonita - La Casa del Vallenato*
