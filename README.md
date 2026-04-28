# 🎵 OYE BONITA - La Casa del Vallenato

## 📖 Manual de Usuario

¡Bienvenido! Este manual está diseñado para que cualquier persona, **sin importar si sabe o no de programación**, pueda usar y modificar este sitio web del menú de **Oye Bonita**.

---

## 📋 ¿Qué es esto?

Este es un **menú digital interactivo** para el restaurante Oye Bonita. Es una página web que funciona solita — solo necesitas abrir el archivo `index.html` en tu navegador (Chrome, Edge, Firefox, etc.) y listo.

No necesitas instalar nada, ni pagar servidores, ni tener internet más allá de la primera vez que la abras (para cargar las fuentes y los iconos).

---

## 🗂️ Archivos del proyecto (no te asustes)

Dentro de la carpeta `menu oye bonita` vas a encontrar estos archivos:

| Archivo | ¿Qué es? | ¿Lo tocas? |
|---------|----------|------------|
| `index.html` | La página principal | ❌ No lo toques |
| `style.css` | Los colores, tamaños y diseños | ❌ No lo toques |
| `script.js` | La lógica y animaciones | ❌ No lo toques |
| `data/menu-data.json` | **LOS DATOS DEL MENÚ** ✅ | ✅ **Sí, aquí se edita** |
| `README.md` | Este manual | ❌ No lo toques |
| `plans/todo.md` | Notas internas | ❌ No lo toques |

> ✅ **La única regla de oro**: para cambiar los platos, precios o descripciones, solo tocas el archivo `data/menu-data.json`.

---

## 🍔 Cómo cambiar el Menú (platos, precios, descripciones)

### Paso 1: Abrir el archivo correcto

1. Abre la carpeta `menu oye bonita`
2. Dentro hay una subcarpeta llamada `data`
3. Dentro de `data` hay un archivo llamado **`menu-data.json`**
4. Haz clic derecho sobre él → "Abrir con" → **Bloc de notas** (o cualquier editor de texto)

### Paso 2: Entender cómo está organizado

El archivo se ve así (simplificado):

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

**Traducción:**

- `"categories"` → Las secciones del menú (Entradas, Hamburguesas, etc.)
- `"items"` → Los platos dentro de cada sección
- `"name"` → El nombre del plato
- `"description"` → La descripción del plato
- `"price"` → El precio **en pesos colombianos, sin puntos ni comas** (15000 = $15.000)
- `"tags"` → Etiquetas especiales (déjalo como `[]` si no usas)

### Paso 3: Ejemplos de cambios comunes

#### 🔹 Cambiar el precio de un plato

Busca el plato en el archivo y cambia solo el número después de `"price"`:

```json
"price": 18000
```

Cambia `18000` por el nuevo precio. **Sin puntos, sin comas, solo números.**

#### 🔹 Cambiar la descripción de un plato

Busca el texto entre comillas después de `"description"`:

```json
"description": "Chorizos artesanales glaseados, acompañados con papas en cascos."
```

Cambia el texto entre las comillas `" "` por lo que quieras.

#### 🔹 Agregar un plato nuevo

Copia este bloque y pégalo dentro de `"items"` de la categoría que quieras (entre el último plato y el corchete `]`):

```json
{
  "id": "nombre-corto-sin-espacios",
  "name": "Nombre del Plato",
  "description": "Descripción del plato aquí.",
  "price": 20000,
  "tags": []
}
```

> **Importante**: Después del plato anterior debe haber una coma `,` antes de pegar el nuevo. El último plato de la lista **no lleva coma** al final.

#### 🔹 Eliminar un plato

Borra todo el bloque `{ ... }` del plato, desde la llave `{` de apertura hasta la llave `}` de cierre. Asegúrate de que no queden comas de más.

### Paso 4: Guardar y ver los cambios

1. Guarda el archivo (`Ctrl + S` en Windows)
2. Abre (o recarga) el archivo `index.html` en tu navegador
3. ¡Los cambios aparecerán automáticamente!

---

## 🧩 Categorías con subcategorías (Licores y Cócteles)

Algunas categorías como **Licores** y **Cócteles** tienen subcategorías (ej: dentro de Licores → Aguardiente, Ron, Whisky...).

Se ven así en el archivo:

```json
{
  "id": "licores",
  "name": "LICORES",
  "hasSubcategories": true,
  "subcategories": [
    {
      "id": "aguardiente",
      "name": "Aguardiente",
      "items": [ ... ]
    }
  ]
}
```

Para modificarlos, el principio es el mismo: busca el `"items"` dentro de la subcategoría que quieras y edita los platos igual que en las categorías normales.

---

## 🎨 Cómo cambiar el nombre del restaurante o la dirección

Estos datos están en el archivo `index.html`. Si necesitas cambiar:

- **Nombre del restaurante** ("Oye Bonita")
- **Dirección** (Calle 70 # 45-23, Ocaña)
- **Teléfono** (+57 321 456 7890)

Abre `index.html` con el Bloc de notas, busca esas palabras con `Ctrl + B` y cámbialas directamente. **Ten cuidado de no borrar los símbolos raros** como `< > / "`.

---

## 🖼️ Cómo cambiar la foto de fondo o el logo

Dentro de la carpeta `menu oye bonita` hay una subcarpeta `assets/images/`. Ahí puedes poner imágenes.

Si quieres cambiar el logo o alguna imagen, necesitarás ayuda de alguien que sepa de programación, porque hay que ajustar el código para que apunte a la imagen nueva.

---

## ❓ Preguntas frecuentes

### ¿Se necesita internet para que funcione?
Solo la primera vez que abras la página, para cargar los iconos y las fuentes bonitas. Después de eso, funciona sin internet.

### ¿Se puede ver en el celular?
✅ **Sí**. La página se adapta sola a cualquier pantalla (celular, tablet, computador).

### ¿Cómo le hago para que se vea en la calle?
Necesitarías subirla a internet. Puedes preguntarle a alguien que sepa de "hosting" o "subir una página web". Plataformas como Netlify, Vercel o GitHub Pages son gratis y fáciles.

### ¿Puedo dañar algo si edito el archivo?
Si borras una coma o una comilla sin querer, la página puede dejar de cargar el menú. **Siempre guarda una copia de seguridad** del archivo `menu-data.json` antes de editarlo. Si algo sale mal, reemplázalo con la copia.

### ¿Dónde está la copia de seguridad?
El proyecto ya incluye un respaldo automático llamado `menu-data-backup.json` dentro de la carpeta `data`. Si algo sale mal, borra `menu-data.json` y renombra `menu-data-backup.json` a `menu-data.json`.

---

## 🆘 ¿Problemas?

Si la página no carga bien después de editar:

1. **Revisa que no falten comas** entre los platos (cada plato debe tener una coma `,` después de la llave `}`, excepto el último)
2. **Revisa que los precios sean solo números** (sin puntos, sin comas, sin símbolos de pesos)
3. **Revisa que todas las comillas estén cerradas** (cada `"` debe tener su par `"`)
4. Si nada funciona, borra `menu-data.json` y renombra `menu-data-backup.json` a `menu-data.json` para restaurar la versión original

---

## ✨ Características del sitio

- ✅ Menú interactivo con categorías
- ✅ Buscador de platos en tiempo real
- ✅ Diseño adaptable a celulares y tablets
- ✅ Notas musicales flotantes decorativas
- ✅ Pantalla de bienvenida con animación
- ✅ Colores temáticos vallenatos
- ✅ Sin necesidad de servidor ni instalación

---

*¡Disfruta de Oye Bonita - La Casa del Vallenato!* 🎶
