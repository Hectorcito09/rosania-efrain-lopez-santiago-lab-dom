# Laboratorio Avanzado JS: DOM, Eventos y Validación de Formularios

## Información

- Grupo: ISF133
- Integrantes:
  - Nombre: Efrain Rosania
  - Nombre: Santiago López
- Curso: Ingeniería Web
- Universidad: Universidad Tecnológica de Panamá
- Facultad: Facultad de Ingeniería de Sistemas Computacionales
- Fecha: 29 de septiembre de 2026

## Enlaces
Repositorio: https://github.com/Hectorcito09/rosania-efrain-lopez-santiago-lab-dom
Github Pages: https://hectorcito09.github.io/rosania-efrain-lopez-santiago-lab-dom/inscripcion/

## Objetivos

- **DOM:** Comprender el documento como un árbol de nodos que el JavaScript puede consultar y modificar en tiempo de ejecución, usando `querySelector` para localizar elementos por selector CSS y propiedades del DOM como `textContent`, `classList` y `value` para cambiar su contenido, sus clases y sus valores.
- **Eventos:** Registrar manejadores con `addEventListener`, entender el objeto de evento (`evento.target`, `evento.preventDefault()`) y controlar el flujo de envío de un formulario sin recargar la página.
- **Delegación de eventos:** Registrar los escuchas una sola vez sobre un elemento contenedor y usar `evento.target` para saber qué campo está modificando el usuario, en lugar de añadir un manejador por cada control.
- **Validación de formularios:** Implementar reglas de validación propias en JavaScript con un objeto centralizado de reglas y expresiones regulares, desactivando la validación nativa con `novalidate` y validando en `focusout`, `input`, `change` y `submit`.
- **Accesibilidad:** Proporcionar etiquetas asociadas a cada control, agrupar opciones con `fieldset`/`legend`, mostrar mensajes de error legibles junto al campo y llevar el foco al primer campo inválido al enviar.

## Desarrollo del laboratorio

### 1. DOM

El archivo `validacion.js` espera a que el documento esté listo con el evento `DOMContentLoaded` y luego localiza los elementos que necesita con `document.querySelector()`: el formulario (`#inscripcion`), la sección de confirmación (`#confirmacion`), el bloque de sede (`#campo-sede`), el medidor de fuerza de contraseña (`#meter-bar`, `#meter-lbl`) y el contador de caracteres (`#char-counter`). También usa `formularioInscripcion.querySelector(...)` para localizar el radio de modalidad seleccionado dentro del formulario.

Con esos elementos se practican cambios de texto, clases y atributos:

- `textContent` para escribir y limpiar los mensajes de error (`#nombre-error`, `#cedula-error`, etc.), la etiqueta del medidor de fuerza y el contador de caracteres.
- `classList.add()` / `classList.remove()` para marcar los campos inválidos con `input-error`, ocultar la sede con `oculto`, y resaltar el contador con `warning`.
- Atributos de estilo en tiempo de ejecución (`barraMedidorFuerza.style.width` y `.style.background`) para dibujar la barra de fuerza de la contraseña.
- `document.createElement()` junto con `appendChild()` para construir la tarjeta de confirmación: un `<div class="tarjeta-confirmacion">` que contiene un `<h2>` y una lista `<dl>` con un `<dt>` y un `<dd>` por cada dato del formulario.
- Limpieza del contenido previo con `seccionConfirmacion.textContent = ''` antes de insertar la tarjeta, y `formularioInscripcion.reset()` al finalizar.

Toda la información proveniente del usuario se inserta con `textContent`, nunca con `innerHTML`, de modo que el contenido se muestra tal cual y no se interpreta como HTML.

### 2. Eventos

Los eventos se registran con `addEventListener` y se trabaja con el objeto de evento para saber sobre qué elemento se disparó la acción:

- `focusout` sobre el formulario: usa `evento.target` para obtener el campo que perdió el foco, lo marca como "tocado" en un `Set` y ejecuta `validarCampo()`.
- `input` sobre el formulario: actualiza el medidor de fuerza de la contraseña, el contador de caracteres del textarea y vuelve a validar solo los campos que ya fueron tocados.
- `change` sobre el formulario: valida el `<select>` de curso y sede, el checkbox de términos y la modalidad; al cambiar la modalidad ejecuta `gestionarCambioModalidad()`, que muestra u oculta el campo de sede y reinicia su valor.
- `submit` sobre el formulario: llama a `evento.preventDefault()` para evitar la recarga del navegador, valida todos los campos aplicables, enfoca el primer inválido con `camposInvalidos[0].focus()` y, si todo es correcto, construye la tarjeta de confirmación y reinicia el formulario.

**Delegación de eventos:** en lugar de registrar un manejador en cada `<input>`, los cuatro escuchas (`focusout`, `input`, `change` y `submit`) están registrados directamente sobre el `<form id="inscripcion">`, que actúa como contenedor. A partir de ahí se identifica el control con `evento.target` y se decide qué hacer según su `name`. Esto evita tener que enlazar y desenlazar manejadores cuando la estructura del formulario cambia y mantiene el número de manejadores constante sin importar cuántos campos tenga el formulario.

### 3. Validación de formularios

El formulario se declara en `index.html` con el atributo `novalidate`, por lo que el navegador no bloquea el envío y toda la validación se realiza con JavaScript, sin usar `alert()`.

El objeto `reglas` concentra una función por cada campo. Cada función devuelve `true` cuando el valor es válido o un mensaje de error cuando no lo es:

- `nombre`: obligatorio, entre 5 y 60 caracteres y solo letras y espacios (expresión regular con tildes y `Ñ`).
- `cedula`: formato panameño con expresión regular (`8-123-4567`, además de prefijos `PE`, `E` y `N`).
- `correo`: formato `nombre@dominio.com` con expresión regular.
- `celular`: 8 dígitos que empiezan con 6, con guion opcional.
- `fechaNacimiento`: obligatoria, no puede ser futura y debe cumplir 16 años de edad mínima, comparando la fecha ingresada con la fecha límite calculada con `setFullYear()`.
- `curso`: selección obligatoria del `<select>`.
- `modalidad`: debe haber un radio `presencial` o `virtual` marcado.
- `sede`: obligatoria únicamente si la modalidad es `presencial`; si es `virtual` se omite la validación.
- `clave`: 8 caracteres o más, una mayúscula, una minúscula, un número y un símbolo; la función acumula los requisitos faltantes y los informa todos juntos.
- `clave2`: debe coincidir con `clave`.
- `comentarios`: máximo 200 caracteres.
- `terminos`: el checkbox debe estar marcado.

La función `validarCampo(elementoEntrada)` es el punto único de validación: busca la regla según el `name` del campo, escribe el mensaje de error en el `<p>` correspondiente con `textContent`, agrega o quita la clase `input-error` en los campos de texto y devuelve `true` o `false`.

Los momentos de validación son tres:

1. **Al salir del campo** (`focusout`): el campo se marca como tocado y se valida.
2. **En vivo** (`input`): solo se revalida si el campo ya fue tocado, para no mostrar errores mientras el usuario apenas está escribiendo. El `Set` `camposTocados` lleva ese control, y también se usa para revalidar la confirmación de contraseña cuando la principal cambia.
3. **Al enviar** (`submit`): se filtran los campos a validar —excluyendo la sede si está oculta—, se marcan todos como tocados, se validan en bloque y, si hay errores, se limpia la sección de confirmación y el foco se desplaza al primer campo inválido. Si todo es correcto, se construye la tarjeta de confirmación con los datos.

**Accesibilidad:** cada control tiene su `<label for>` apuntando a su `id`; los radios de modalidad están dentro de un `<fieldset>` con su `<legend>`; los mensajes de error son texto real y visible (no solo color), y el campo inválido se distingue con borde y fondo; al enviar con errores el foco se mueve automáticamente al primer campo problemático, lo que ayuda a quien navega con teclado o lector de pantalla; y la tarjeta de confirmación se genera con etiquetas semánticas (`<h2>`, `<dl>`, `<dt>`, `<dd>`).

## Capturas del formulario

### Llenado del Formulario
<img width="349" height="649" alt="image" src="https://github.com/user-attachments/assets/6a8b3730-81c8-4c0d-b257-b3d757b673a6" />

### Resultado de la Inscripción Exitosa
<img width="925" height="519" alt="image" src="https://github.com/user-attachments/assets/56e5c9f2-b718-47fa-a652-c73062f29dbc" />

## Preguntas de control

### Pregunta 1

¿Qué devuelve `document.querySelector('.inexistente')` y qué pasa si luego escribes `.textContent = 'x'`?

**Respuesta:** Devuelve `null`. Si después se intenta asignar `.textContent` a ese valor, JavaScript genera un `TypeError` porque no se puede acceder a propiedades de `null`. Por eso se debe comprobar que el elemento exista antes de modificarlo o utilizar optional chaining cuando corresponda.

### Pregunta 2

Si agregas 100 tareas nuevas a la lista, ¿cuántos manejadores de clic tiene la página con delegación? ¿Y sin delegación?

**Respuesta:** Con delegación de eventos se mantiene un solo manejador de clic en el elemento contenedor, como el `<ul>`. Sin delegación, normalmente habría que registrar un manejador para cada elemento interactivo nuevo.

Aplicado a este laboratorio, el mismo criterio se ve en los escuchas registrados sobre el `<form>`: con delegación son siempre los mismos escuchas (uno por tipo de evento) sin importar cuántos campos se agreguen, mientras que sin delegación habría que añadir un manejador por cada control y retirarlo cuando el control desaparezca.

### Pregunta 3

¿Por qué el manejador de `blur` se registra con `true` como tercer argumento?

**Respuesta:** `blur` no burbujea. Al usar `true`, el evento se escucha durante la fase de captura, es decir, desde el elemento superior hacia el elemento que recibió el evento. De esta manera, se puede colocar un solo manejador en el `<form>` para detectar cuando cualquiera de sus campos pierde el foco. Otra alternativa sería utilizar `focusout`, que sí permite la propagación del evento.

