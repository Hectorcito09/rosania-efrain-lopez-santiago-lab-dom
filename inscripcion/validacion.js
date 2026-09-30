// Esperar a que cargue el documento
document.addEventListener('DOMContentLoaded', () => {
// Selección de elementos
  const formularioInscripcion = document.querySelector('#inscripcion');
  const seccionConfirmacion = document.querySelector('#confirmacion');
  const contenedorSede = document.querySelector('#campo-sede');
  const selectorSede = document.querySelector('#sede');
  const barraMedidorFuerza = document.querySelector('#meter-bar');
  const etiquetaMedidorFuerza = document.querySelector('#meter-lbl');
  const contadorCaracter = document.querySelector('#char-counter');

  // Set para controlar qué campos han sido interactuados
  const camposTocados = new Set();

  // Objeto con Reglas de Validación y Expresiones Regulares
  const reglas = {
  nombre: valorTexto => {
  const textoLimpio = valorTexto.trim();
  if (!textoLimpio) return 'Escribe tu nombre y apellido.';
  if (textoLimpio.length < 5 || textoLimpio.length > 60) return 'Debe tener entre 5 y 60 caracteres.';
  const expreRegNombre = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(\s+[A-Za-zÁÉÍÓÚáéíóúÑñ]+)+$/;
  return expreRegNombre.test(textoLimpio) || 'Escribe tu nombre y apellido (solo letras).';
  },

  cedula: valorTexto => {
    const expreRegCedula = /^([1-9]|1[0-3]|PE|E|N)-\d{1,4}-\d{1,6}$/i;
    return expreRegCedula.test(valorTexto.trim()) || 'Usa el formato 8-123-4567.';
  },

  correo: valorTexto => {
    const expreRegCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return expreRegCorreo.test(valorTexto.trim()) || 'Usa un correo como nombre@dominio.com.';
  },

  celular: valorTexto => {
    const expreRegCelular = /^6\d{3}-?\d{4}$/;
    return expreRegCelular.test(valorTexto.trim()) || 'El celular debe tener 8 dígitos y empezar con 6.';
  },

  fechaNacimiento: valorTexto => {
    if (!valorTexto) return 'Selecciona tu fecha de nacimiento.';
    const fechaIngresada = new Date(valorTexto + 'T00:00:00');
    const fechaHoy = new Date();
    if (fechaIngresada > fechaHoy) return 'La fecha no puede ser futura.';

    if (fechaIngresada.getFullYear() < 1900) return 'Ingresa una fecha de nacimiento válida.';

    const fechaLimiteEdad = new Date();
    fechaLimiteEdad.setFullYear(fechaLimiteEdad.getFullYear() - 16);
    return fechaIngresada <= fechaLimiteEdad || 'Debes tener al menos 16 años cumplidos.';
  },

  curso: valorTexto => valorTexto !== '' || 'Elige un curso.',

  modalidad: () => {
    const modalidadSeleccionada = formularioInscripcion.querySelector('input[name="modalidad"]:checked');
    return modalidadSeleccionada ? true : 'Elige una modalidad.';
  },

  sede: valorTexto => {
    const modalidadSeleccionada = formularioInscripcion.querySelector('input[name="modalidad"]:checked')?.value;
    if (modalidadSeleccionada === 'presencial') {
      return valorTexto !== '' || 'Elige una sede.';
    }
    return true;
  },

  clave: valorTexto => {
    const requisitosFaltantes = [];
    if (valorTexto.length < 8) requisitosFaltantes.push('8 caracteres');
    if (!/[A-Z]/.test(valorTexto)) requisitosFaltantes.push('una mayúscula');
    if (!/[a-z]/.test(valorTexto)) requisitosFaltantes.push('una minúscula');
    if (!/\d/.test(valorTexto)) requisitosFaltantes.push('un número');
    if (!/[^A-Za-z0-9]/.test(valorTexto)) requisitosFaltantes.push('un símbolo');

    return requisitosFaltantes.length === 0 || `Te falta: ${requisitosFaltantes.join(', ')}.`;
  },

  clave2: valorTexto => {
    if (!valorTexto) return 'Confirma tu contraseña.';
    return valorTexto === formularioInscripcion.clave.value || 'Las contraseñas no coinciden.';
  },

  comentarios: valorTexto => valorTexto.length <= 200 || 'Máximo 200 caracteres.',

  terminos: () => formularioInscripcion.terminos.checked || 'Debes aceptar los términos y condiciones.'


  };

  // Función para Validar y Mostrar Mensajes de Error
  function validarCampo(elementoEntrada) {
  const nombreCampo = elementoEntrada.name;
  if (!reglas[nombreCampo]) return true;

  const resultadoValidacion = reglas[nombreCampo](elementoEntrada.value || '');
  const esValido = resultadoValidacion === true;
  const contenedorError = document.querySelector(`#${nombreCampo}-error`);

  if (contenedorError) {
    contenedorError.textContent = esValido ? '' : resultadoValidacion;
  }

  if (elementoEntrada.type !== 'radio' && elementoEntrada.type !== 'checkbox') {
    if (esValido) {
      elementoEntrada.classList.remove('input-error');
    } else {
      elementoEntrada.classList.add('input-error');
    }
  }

  return esValido;


  }

  // Lógica para Mostrar u Ocultar la Sede
  function gestionarCambioModalidad() {
  const modalidadSeleccionada = formularioInscripcion.querySelector('input[name="modalidad"]:checked')?.value;

  if (modalidadSeleccionada === 'presencial') {
    contenedorSede.classList.remove('oculto');
  } else {
    contenedorSede.classList.add('oculto');
    if (selectorSede) {
      selectorSede.value = '';
      selectorSede.classList.remove('input-error');
    }
    const contenedorErrorSede = document.querySelector('#sede-error');
    if (contenedorErrorSede) contenedorErrorSede.textContent = '';
  }


  }

  // Medidor de fuerza de contraseña (Corregido con colores existentes)
  function calcularFuerzaClave(valorClave) {
  let puntosFuerza = 0;
  if (valorClave.length >= 8) puntosFuerza++;
  if (/[A-Z]/.test(valorClave)) puntosFuerza++;
  if (/[a-z]/.test(valorClave)) puntosFuerza++;
  if (/\d/.test(valorClave)) puntosFuerza++;
  if (/[^A-Za-z0-9]/.test(valorClave)) puntosFuerza++;

  const nivelesFuerza = [
    ['—', '0%', 'var(--color-error)'],
    ['Muy débil', '20%', 'var(--color-error)'],
    ['Débil', '40%', 'var(--color-error)'],
    ['Aceptable', '60%', 'var(--color-advertencia)'],
    ['Buena', '80%', 'var(--color-exito)'],
    ['Fuerte', '100%', 'var(--color-exito)']
  ];

  const [textoFuerza, anchoBarra, colorEstado] = valorClave ? nivelesFuerza[puntosFuerza] : nivelesFuerza[0];
  if (barraMedidorFuerza) {
    barraMedidorFuerza.style.width = anchoBarra;
    barraMedidorFuerza.style.background = colorEstado;
  }
  if (etiquetaMedidorFuerza) {
    etiquetaMedidorFuerza.textContent = `Fuerza: ${textoFuerza}`;
  }


  }

  // Manejadores de Eventos del Formulario
  formularioInscripcion.addEventListener('focusout', (evento) => {
  const campoObjetivo = evento.target;
  if (reglas[campoObjetivo.name]) {
  camposTocados.add(campoObjetivo.name);
  validarCampo(campoObjetivo);
  }
  });

  formularioInscripcion.addEventListener('input', (evento) => {
  const campoObjetivo = evento.target;

  if (campoObjetivo.name === 'clave') {
    calcularFuerzaClave(campoObjetivo.value);
    if (camposTocados.has('clave2')) {
      validarCampo(formularioInscripcion.clave2);
    }
  }

  if (campoObjetivo.name === 'comentarios') {
    const longitudTexto = campoObjetivo.value.length;
    if (contadorCaracter) {
      contadorCaracter.textContent = `${longitudTexto}/200`;
      if (longitudTexto > 180) {
        contadorCaracter.classList.add('warning');
      } else {
        contadorCaracter.classList.remove('warning');
      }
    }
  }

  if (camposTocados.has(campoObjetivo.name)) {
    validarCampo(campoObjetivo);
  }


  });

  formularioInscripcion.addEventListener('change', (evento) => {
  const campoObjetivo = evento.target;
  if (campoObjetivo.name === 'modalidad') {
  gestionarCambioModalidad();
  camposTocados.add('modalidad');
  validarCampo(campoObjetivo);
  } else if (campoObjetivo.name === 'terminos' || campoObjetivo.tagName === 'SELECT') {
  camposTocados.add(campoObjetivo.name);
  validarCampo(campoObjetivo);
  }
  });

  formularioInscripcion.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const elementosAValidar = Array.from(formularioInscripcion.elements).filter(elementoForm => {
    if (!elementoForm.name || !reglas[elementoForm.name]) return false;
    if (elementoForm.name === 'sede' && contenedorSede.classList.contains('oculto')) return false;
    return true;
  });

  elementosAValidar.forEach(elementoForm => camposTocados.add(elementoForm.name));

  const camposInvalidos = elementosAValidar.filter(elementoForm => !validarCampo(elementoForm));

  if (camposInvalidos.length > 0) {
    seccionConfirmacion.textContent = '';
    camposInvalidos[0].focus();
    return;
  }

  const datosFormulario = new FormData(formularioInscripcion);
  seccionConfirmacion.textContent = '';

  const tarjetaConfirmacion = document.createElement('div');
  tarjetaConfirmacion.classList.add('tarjeta-confirmacion');

  const tituloConfirmacion = document.createElement('h2');
  tituloConfirmacion.textContent = '¡Inscripción Exitosa!';
  tarjetaConfirmacion.appendChild(tituloConfirmacion);

  const listaDatos = document.createElement('dl');

  const camposAMostrar = [
    ['Nombre Completo', 'nombre'],
    ['Cédula', 'cedula'],
    ['Correo Electrónico', 'correo'],
    ['Celular', 'celular'],
    ['Fecha de Nacimiento', 'fechaNacimiento'],
    ['Curso', 'curso'],
    ['Modalidad', 'modalidad']
  ];

  if (datosFormulario.get('modalidad') === 'presencial') {
    camposAMostrar.push(['Sede', 'sede']);
  }

  if (datosFormulario.get('comentarios')?.trim()) {
    camposAMostrar.push(['Comentarios', 'comentarios']);
  }

  camposAMostrar.forEach(([etiquetaVisible, claveCampo]) => {
    const terminoClave = document.createElement('dt');
    terminoClave.textContent = etiquetaVisible;

    const descripcionValor = document.createElement('dd');
    descripcionValor.textContent = datosFormulario.get(claveCampo);

    listaDatos.appendChild(terminoClave);
    listaDatos.appendChild(descripcionValor);
  });

  tarjetaConfirmacion.appendChild(listaDatos);
  seccionConfirmacion.appendChild(tarjetaConfirmacion);

  formularioInscripcion.reset();
  camposTocados.clear();
  calcularFuerzaClave('');
  gestionarCambioModalidad();

  if (contadorCaracter) {
    contadorCaracter.textContent = '0/200';
    contadorCaracter.classList.remove('warning');
  }

  elementosAValidar.forEach(elementoForm => elementoForm.classList.remove('input-error'));


  });
});