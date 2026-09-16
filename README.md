# Señales y Sistemas — BEINEL021

Sitio web del curso **Señales y Sistemas** del programa de Ingeniería Electrónica
(Universidad Surcolombiana, microdiseño MI-FOR-FO-34 v2).

**Sitio publicado:** (https://johnchia-dev.github.io/senales-y-sistemas/)

Sitio estático: HTML5 + CSS3 + JavaScript (ES5, sin dependencias ni proceso de compilación).

## Estructura

```
sitio/
├── index.html            Inicio: presentación, mapa de contenidos, unidades
├── unidad-1.html         Fundamentos sobre sistemas          (10 secciones)
├── unidad-2.html         Sistemas LTI y convolución           (8 secciones)
├── unidad-3.html         Transformada de Laplace             (10 secciones)
├── unidad-4.html         Transformada Z                       (9 secciones)
├── matlab.html           Guía de MATLAB: guiones por tema
├── formulario.html       Formulario y tablas de consulta
├── talleres.html         Talleres, quiz y práctica final (PDF)
├── programa.html         Microdiseño curricular completo
├── css/estilos.css       Hoja de estilos única (identidad institucional)
├── js/app.js             Navegación, buscador, copiar código y laboratorios
├── js/tex-svg.js         MathJax 3.2.2 (composición de las fórmulas en LaTeX)
├── js/indice.js          Índice de búsqueda, generado a partir de las páginas
├── img/                  Logotipo oficial USCO + favicon
└── docs/*.pdf            Talleres, prácticas y microdiseño
```

## Identidad institucional

El diseño aplica el **Manual de Identidad e Imagen Institucional** (Acuerdo 046 de
2016 del CSU) y la **Circular N.º 2 de 2026** de la Oficina Asesora de
Comunicaciones:

- **Colores oficiales** tomados de usco.edu.co/imagen-institucional:
  vinotinto `#8F141B`, ocre `#DFD4A6` / `#C7B363`, gris `#4D626C` / `#1E262B`.
- **Logotipo**: se usan los archivos oficiales descargados de
  `usco.edu.co/imagen-institucional/logo/`, sin recolorear, deformar ni aplicar
  efectos. Aparece **una sola vez** por página, en la parte superior izquierda,
  sobre fondo blanco y respetando su área de protección.
  - `universidad-surcolombiana.png` — versión a color (la que usa el sitio)
  - `universidad-surcolombiana-m.png` — monocromática
  - `universidad-surcolombiana-p.png` — versión para fondo oscuro
  - `universidad-surcolombiana-v*.png` — versiones verticales
- Ningún símbolo institucional fue generado ni modificado con inteligencia
  artificial, conforme al numeral 5 de la circular.
- El favicon **no** es el logotipo institucional: es una marca gráfica propia del
  sitio (una onda) en los colores del curso.

## Características

- Menú de navegación funcional en las 9 páginas, con la página actual marcada
  mediante `aria-current="page"` y menú desplegable en pantallas pequeñas.
- Índice lateral fijo en las páginas interiores, que resalta la sección visible.
- Diseño responsive: una sola columna por debajo de 960 px; sin desbordamiento
  horizontal; tablas y bloques de código con desplazamiento propio.
- Fórmulas escritas en LaTeX y compuestas con MathJax (salida SVG). La librería
  viaja dentro del proyecto, así que el sitio no depende de ningún CDN y
  funciona también sin conexión.
- Buscador en la cabecera sobre las 73 secciones del sitio, sin librerías.
- Diagramas de bloques dibujados en SVG (serie, paralelo y realimentación).
- Más de 20 bloques de código MATLAB con botón de copiado.
- Cuatro laboratorios interactivos dibujados con la API Canvas, sin librerías:
  constructor de señales, convolución discreta paso a paso, plano *s* con
  respuesta al escalón y plano *z* con respuesta al impulso.
- Accesibilidad: enlace de salto al contenido, textos alternativos en cada
  gráfica, foco visible y respeto por `prefers-reduced-motion`.

## Ejecución local

No requiere servidor: basta abrir `index.html` en el navegador. Para servirlo
con un servidor local:

```bash
python -m http.server 8000
```

## Publicación en GitHub Pages

1. Crear un repositorio **público** (por ejemplo `senales-y-sistemas`), sin marcar
   «Add a README file».
2. Subir el **contenido** de esta carpeta a la raíz del repositorio, no la carpeta
   en sí: `index.html` debe quedar en la raíz. Con la interfaz web:
   *Add file → Upload files*, arrastrar todo y confirmar con *Commit changes*.
3. En **Settings → Pages**, elegir *Deploy from a branch*, rama `main`,
   carpeta `/ (root)`, y guardar.
4. Esperar uno o dos minutos. El sitio queda en
   `https://<usuario>.github.io/<repositorio>/`.

Notas:

- El archivo `.nojekyll` desactiva el procesador Jekyll, que no hace falta aquí.
  Es un archivo vacío pero debe subirse.
- GitHub Pages distingue mayúsculas de minúsculas en las rutas, a diferencia de
  Windows. Los enlaces de este sitio ya están verificados con esa grafía exacta.
- Para actualizar el sitio basta volver a subir los archivos cambiados; el
  despliegue se rehace solo.

## Créditos

Contenido académico basado en el microdiseño curricular del curso BEINEL021 y en
el material de trabajo del semestre 2025-2. Bibliografía básica:
Oppenheim y Willsky, *Señales y sistemas*, Prentice Hall.
