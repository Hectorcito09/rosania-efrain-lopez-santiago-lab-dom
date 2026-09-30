//Parte 1

// 1.1 Seleccionar elementos
const titulo = document.querySelector('#titulo');     
const items  = document.querySelectorAll('li');     

console.log(titulo.textContent);
items.forEach(li => console.log(li.textContent));


// 1.2 Cambiar texto, clases y atributos
titulo.textContent = '¡Hola DOM!';          
titulo.classList.add('destacado');          
titulo.setAttribute('title', 'Encabezado');
titulo.dataset.estado = 'activo';           
titulo.style.color = 'steelblue';           


// 1.3 Crear y eliminar nodos
const lista = document.querySelector('#lista');
const lenguajes = ['HTML', 'CSS', 'JavaScript'];

for (const nombre of lenguajes) {
  const li = document.createElement('li');
  li.textContent = nombre;
  lista.append(li);                         
}

lista.lastElementChild.remove();           



//Parte 2

// 2.1 addEventListener y el objeto event
const boton = document.querySelector('#saludar');

boton.addEventListener('click', (event) => {
  console.log(event.type);     // "click"
  console.log(event.target);   // el elemento que recibió el clic
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') console.log('Cerrar modal');
});


// 2.2 Delegación de eventos
const listaTareas = document.querySelector('#tareas');

listaTareas.addEventListener('click', (e) => {
  const borrar = e.target.closest('.borrar');
  if (borrar) {
    borrar.closest('li').remove();
    return;
  }
  const texto = e.target.closest('.texto');
  if (texto) texto.closest('li').classList.toggle('hecha');
});


// 2.3 preventDefault
const formRegistro = document.querySelector('#registro');

formRegistro.addEventListener('submit', (e) => {
  e.preventDefault();                // no recargar la página
  const datos = new FormData(formRegistro);
  console.log(Object.fromEntries(datos));
});

//Parte 3
// 3.2 API de validación del navegador 
const correoInput = document.querySelector('#correo');
if (correoInput) {
  correoInput.checkValidity();          
}

// 3.3 Reglas propias, reutilizables
const form = document.querySelector('#registro');

const reglas = {
  nombre: v => v.trim().length >= 3 || 'Escribe al menos 3 caracteres.',
  correo: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Usa un correo como nombre@dominio.com.',
  cedula: v => /^([1-9]|1[0-3]|PE|E|N)-\d{1,4}-\d{1,6}$/.test(v) || 'Formato: 8-123-4567.',
  clave:  v => (v.length >= 8 && /[A-Z]/.test(v) && /\d/.test(v))
               || 'Mínimo 8 caracteres, una mayúscula y un número.',
  clave2: v => v === form.clave.value || 'Las contraseñas no coinciden.',
};

function validarCampo(input) {
  if (!reglas[input.name]) return true;
  
  const resultado = reglas[input.name](input.value);
  const valido = resultado === true;
  const error = document.getElementById(`${input.name}-error`);

  input.setAttribute('aria-invalid', String(!valido));
  if (error) error.textContent = valido ? '' : resultado;
  return valido;
}

// 3.4 Cuándo mostrar los errores
const tocados = new Set();

form.addEventListener('blur', (e) => {
  if (!reglas[e.target.name]) return;
  tocados.add(e.target.name);
  validarCampo(e.target);
}, true);   

form.addEventListener('input', (e) => {
  if (tocados.has(e.target.name)) validarCampo(e.target);
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const campos = [...form.elements].filter(el => reglas[el.name]);
  const invalidos = campos.filter(el => !validarCampo(el));
  
  if (invalidos.length) { 
    invalidos[0].focus(); 
    return; 
  }
  
  const datos = new FormData(form);
  console.log(Object.fromEntries(datos));
  form.reset();
  tocados.clear();
});