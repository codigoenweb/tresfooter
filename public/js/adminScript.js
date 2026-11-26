//Valores iniciales
let tipo = 'todos', pagina = 1, cantidadPaginas = 1;

// Atajo nativo para getElementById (no es jQuery)
const $ = id => document.getElementById(id);

//función auxiliar para mostrar mensajes
function mostrarMensaje (id, texto, clase = 'error'){
    $(id).textContent = texto;
    $(id).classList = clase;

    setTimeout(()=>{
        $(id).textContent = '';
    },3000);
}

async function chequearSesion(){
    //Para chequear si hay sesión le pregunto con un endpoint si hay cookie válida
    try {
        
        const respuesta = await fetch("/api/admin/sesion");
        
  
        if(!respuesta.ok){
            //Si la respuesta es no ok, lanza el error
            throw new Error('No inició sesión.')

        }
        const data = await  respuesta.json();
    
        //Si la respuesta es ok status 200 continúa

        $('login').classList.add('oculto');
        $('dashboard').classList.remove('oculto');

        //oculto el login , muestro el dashboard

        await cargarDatos();   //lo desarrollamos ahora.


    } catch (error) {
        //y el error cae aquí. Modifico la interfaz (lo que el usuario ve. Muestro el login y oculto el dashboard.)
        $('login').classList.remove('oculto');
        $('dashboard').classList.add('oculto');
    }
}

async function cargarDatos(){

    try {
         //Pido los datos al servidor mediante una petición HTTP o request HTTP(en inglés)

        const respuestaDesdeElServidor = await fetch(`/api/admin/contactos?tipo=${tipo}&pagina=${pagina}`);
      
          const data = await respuestaDesdeElServidor.json();

        // La respuesta puede ser ok o no ok
        if(!respuestaDesdeElServidor.ok){
            throw new Error( data.error ||'Error en la carga de datos'); // y salta al catch
        }
        // Si la respuesta ok es true continúa.
        // Transformo la respuesta a un formato json que pueda usar.
    
      
       

        cantidadPaginas = data.cantidadPaginas;
        $('total').textContent = `${data.total} registros.`;
        $('noleidos').textContent = `. ${data.noleidos} sin leer.`;
        $('pagina').textContent = ` Página ${pagina} de ${cantidadPaginas}`;
        $('prev').disabled = pagina <= 1;
        $('next').disabled = pagina >= cantidadPaginas;

        $('registros').innerHTML = "";
        $('registros').innerHTML = data.items.length ? data.items.map((item)=>`<article class="item">
            <div class="barra">
                <strong>${item.tipo === "mensaje" ? "Mensaje" : "Suscripción"}${item.leido ? "" : ` <span class="exitoso">Nuevo</span>`}</strong>
                <span class="meta">${new Date(item.createdAt).toLocaleString("es-AR")}</span>
            </div>
            <p><strong>${esc(item.nombre || "")}</strong> ${esc(item.email)}</p>
            <p>${item.mensaje ? esc(item.mensaje) : ""}</p>
            <div class="fila">
                ${!item.leido ? `<button data-leido="${item._id}" class="secundario">Marcar leído</button>` : ""}            
                <button data-eliminar="${item._id}"  class="danger">Eliminar</button>
            </div>
         </article>
        `).join("")
        : '<div class="tarjeta atenuado">No hay registros para mostrar.</div>';

        // Seleccionamos los botones "Marcar leído" acá dentro porque recién se generan en cargarDatos().

        document.querySelectorAll("[data-leido]").forEach((btn) => (
            btn.onclick = async () => {
                try {
                 
                    //Le avisamos al servidor y esperamos la respuesta 
                    const respuestaDesdeElServidor = await fetch(`/api/admin/contactos/${btn.dataset.leido}/leido`,{
                        method: "PATCH"
                    });

                    const data = await respuestaDesdeElServidor.json().catch(() => ({}));
                     
                    if (!respuestaDesdeElServidor.ok) throw new Error(data.error || "Error en la comunicación.");

                    // Si está todo bien volvemos a cargar los datos
                  
                    await cargarDatos();

                    
                } catch (error) {
                    console.log('Error en cargar datos. Marcar leido',error);
                }
            }
        ));

        // Seleccionamos los botones "Eliminar" acá dentro porque recién se generan en cargarDatos().
        document.querySelectorAll("[data-eliminar]").forEach((btn) => (
            btn.onclick = async () => {

                //Antes de hacer algo pedimos confirmación
                if (confirm("¿Eliminar definitivamente este registro?")){

                     try {
                 
                    //Le avisamos al servidor a otro endpoint y esperamos la respuesta 
                    const respuestaDesdeElServidor = await fetch(`/api/admin/contactos/${btn.dataset.eliminar}`,{
                        method: "DELETE"
                    });

                    const data = await respuestaDesdeElServidor.json().catch(() => ({}));
                     
                    if (!respuestaDesdeElServidor.ok) throw new Error(data.error || "Error en la comunicación.");

                    // Si está todo bien volvemos a cargar los datos
                  
                    await cargarDatos();

                    
                } catch (error) {
                    console.log('Error en cargar datos. Marcar leido',error);
                }

                }
               
            }
        ));

       
        
    } catch (error) {
        console.log(error);
        //envio a la pantalla un vacío
        $('registros').innerHTML =`<div class="tarjeta error">Hubo un error en la carga de mensajes y suscriptores.</div>`
    }
   
}


$('prev').onclick = ()=>{
    if (pagina > 1){
        pagina--;
        cargarDatos();
    }
}
$('next').onclick = ()=>{
    if (pagina < cantidadPaginas){
        pagina++;
        cargarDatos();
    }
}

//botones de filtrado
document.querySelectorAll("[data-tipo]").forEach((btn) => (
    btn.addEventListener("click", ()=> {
        tipo = btn.dataset.tipo;
        pagina = 1;
        document.querySelectorAll("[data-tipo]").forEach((b)=>{
            b.classList.toggle("activo", b===btn);
            b.classList.toggle("secundario", b !== btn);
        });
        cargarDatos();
    })
));



//Atento al formulario de contacto
$('formulario-contacto').addEventListener('submit', async(evento) => {
    evento.preventDefault();

    const form = evento.currentTarget;
    const datosForm = Object.fromEntries(new FormData(form));

    

    try {
       
        //envío los datos al servidor a la ruta donde se los recibe 
        const respuestaDesdeElServidor = await fetch('/api/admin/login',{
            headers:{'Content-Type': 'application/json'},
            method:'POST',
            body: JSON.stringify(datosForm)
        });

         //transformo los datos para poder ser leidos a un json
        const data = await respuestaDesdeElServidor.json();

        //verifico que no haya respuesta de error

        if (!respuestaDesdeElServidor.ok){
          
            throw new Error( data.error || 'No se pudo completar la identificación.');
        }

       

        //reseteo el formulario
        form.reset();
     
        //chequeo que haya cookie para ver si se autorizó la sesion
        await chequearSesion();
        
    } catch (error) {
        mostrarMensaje('login-msg',error.message, 'error');
    }
});

// Así cuando inicia, si hay cookie, abre directamente sin loguearse.
 chequearSesion();

 $('logout').addEventListener("click", async () =>{

    await fetch("/api/admin/logout", {
        method:"POST"
    });

    chequearSesion();

 });

 /**Esa función se suele usar para "escapar" caracteres especiales de HTML (como <, >, &, ") y evitar inyecciones de código (XSS) al mostrar textos ingresados por los usuarios (como nombres, emails o mensajes). */
function esc(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}