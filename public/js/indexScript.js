
const temaBtn = document.querySelector('#tema');
const iconoTema = document.querySelector("#iconoTema");


const sol = "M14.13,14.13Q15,13.25 15,12T14.13,9.88T12,9T9.88,9.88T9,12t0.88,2.13T12,15t2.13-0.88ZM8.46,15.54Q7,14.08 7,12Q7,9.92 8.46,8.46T12,7t3.54,1.46T17,12t-1.46,3.54T12,17q-2.07,0-3.54-1.46ZM5,13H1V11H5v2Zm18,0H19V11h4v2ZM11,5V1h2V5H11Zm0,18V19h2v4H11ZM6.4,7.75L3.88,5.32L5.3,3.85l2.4,2.5L6.4,7.75Zm12.3,12.4l-2.42-2.52l1.32-1.38l2.52,2.43L18.7,20.15ZM16.25,6.4l2.43-2.52L20.15,5.3l-2.5,2.4l-1.4-1.3ZM3.85,18.7l2.53-2.43L7.75,17.6L5.33,20.13L3.85,18.7ZM12,12Z";

const luna ="M12,21q-3.75,0-6.38-2.63T3,12T5.63,5.63T12,3q0.35,0 0.69,0.02q0.34,0.02 0.66,0.07q-1.03,0.73-1.64,1.89T11.1,7.5q0,2.25 1.57,3.82T16.5,12.9q1.38,0 2.53-0.61t1.88-1.64q0.05,0.33 0.07,0.66T21,12q0,3.75-2.63,6.38T12,21Zm0-2q2.2,0 3.95-1.21t2.55-3.16q-0.5,0.13-1,0.2t-1,0.08q-3.07,0-5.24-2.16Q9.1,10.58 9.1,7.5q0-0.5 0.08-1t0.2-1Q7.43,6.3 6.21,8.05T5,12q0,2.9 2.05,4.95T12,19Zm-0.25-6.75Z";


temaBtn?.addEventListener('click',()=>{
    const nuevoTema = document.documentElement.getAttribute('data-tema') === 'oscuro' ? 'claro' : 'oscuro';

    document.documentElement.setAttribute('data-tema', nuevoTema);

    iconoTema?.querySelector('path')?.setAttribute('d', nuevoTema === 'oscuro' ? sol : luna);

    mostrarToast(`Modo ${nuevoTema === "oscuro" ? "Oscuro" : "Claro"}`)
});

function mostrarToast(mensaje){
    const toast = document.querySelector('#toast');
    const texto = document.querySelector('#toast-texto');
    if(!toast || !texto) return;

    texto.textContent = mensaje;

    toast.classList.add('mostrar');

    setTimeout(()=> toast.classList.remove('mostrar'), 3000);
}


function  mostrarMensajeFormulario(id, mensaje, ok){
    //itentificamos la etiqueta del HTML con ese id donde escribiremos el mensaje.
    const elemento = document.getElementById(id);

    if(!elemento)return; // por las dudas.
    elemento.className = `form-mensaje ${ok ? 'exitoso' : 'error'}`;
    elemento.textContent = mensaje;
    elemento.style.display ='block';

    //Para que lo borre a los 3 segundos
    setTimeout(()=> elemento.textContent="", 3000);
}

async function controlSuscripcion(evento){
    evento.preventDefault();

    const form = evento.currentTarget;

    const fuenteSuscripcion = form.dataset.fuente;
    const lugarMensajeRespuesta = form.dataset.mensajeid;
   
    const email = form.querySelector('input[type="email"]').value;
    const button = form.querySelector('button[type="submit"]'); // Para deshabilitarlo mientras demore el envío del dato y la respuesta del servidor.

    if (button) button.disabled = true; // lo deshabilito para que no realice múltiples envíos.

    //envío la info al servidor
    try {
        const respuesta = await fetch('/api/suscribir', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({email, fuente:fuenteSuscripcion})
        });

         const data = await respuesta.json(); // transformo la respuesta en un archivo json para poder usarlo.
        
        if (!respuesta.ok){
            throw new Error(`Error en el Servidor: ${data.error}`)
        }
        // si está todo bien
       

        mostrarMensajeFormulario ( lugarMensajeRespuesta, data.mensaje, true); // función que desarrollaremos;
        form.reset();
    
    } catch (error) {
        console.error(error);
        mostrarToast(error.mensaje); // función que ya hacemos en 5minutos
        mostrarMensajeFormulario ( lugarMensajeRespuesta, error.message, false);
    } finally{
        if (button) button.disabled = false ; // cuando finaliza todo habilito nuevamente el botón.
    }
}


//Como vamos a tener varios formularios. Los identificamos a todos.

document.addEventListener('DOMContentLoaded',()=>{

    const formularios = document.querySelectorAll('[data-subscribe-form]');
    formularios.forEach((form) => {
        form.addEventListener('submit', controlSuscripcion);
    });

});

document.getElementById("formulario-contacto")?.addEventListener('submit', async (evento)=>{
    evento.preventDefault();

    const form = evento.currentTarget;
    const button = form.querySelector('button[type="submit"]');

    if (button) button.disabled = true;

    try {
        const cargaDatos  =  Object.fromEntries(new FormData(form).entries());

        const respuesta = await fetch('/api/mensajes',{
            method: 'POST',
            headers:{'Content-Type': 'application/json'},
            body: JSON.stringify(cargaDatos)
        });

        const data = await respuesta.json();

        if (!respuesta.ok){
          
            throw new Error(data.error || 'No se pudo enviar el mensaje.')
        }

     

        mostrarMensajeFormulario('contacto-mensaje', data.mensaje, true);

        mostrarToast(data.mensaje); // falta desarrollar

        form.reset();

        
    } catch (error) {
       
        mostrarMensajeFormulario('contacto-mensaje', error.message, false);
    } finally{
        if (button) button.disabled = false;
    }

});

//Navegación
const botones = document.querySelectorAll('.tab-btn');
const sections = {
  ecommerce: document.getElementById('ecommerce'),
  noticias: document.getElementById('noticias'),
  blog: document.getElementById('blog')
};

botones.forEach(boton => {


    boton.addEventListener('click',()=> {

        const objetivo = boton.dataset.objetivo;
         
        botones.forEach(btn => btn.classList.remove('activo'));
        boton.classList.add('activo');

        Object.entries(sections).forEach(([key,section]) => {
            if(section){
                section.style.display = (objetivo === 'todos' || key === objetivo) ? 'block' : 'none';
            }
        });

    });

    

});

// 1. Botón Volver Arriba
const btnVolverArriba = document.querySelector('.volver-arriba-btn');

if (btnVolverArriba) {
  // 1. Mostrar u ocultar según la posición del scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btnVolverArriba.classList.add('visible');
    } else {
      btnVolverArriba.classList.remove('visible');
    }
  });

  // 2. Subir suavemente al hacer clic
  btnVolverArriba.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// 2. Copiar Email de Contacto
const btnCopiarEmail = document.getElementById('btn-copiar-email');

if (btnCopiarEmail) {
  btnCopiarEmail.addEventListener('click', async (e) => {
    e.preventDefault(); // Evita que el href="#" suba la página de golpe
    const email = 'contacto@sofiachen.dev';

    try {
      await navigator.clipboard.writeText(email);
      mostrarToast(`Copiado: ${email}`);
    } catch {
      mostrarToast('No se pudo copiar el correo.');
    }
  });
}
