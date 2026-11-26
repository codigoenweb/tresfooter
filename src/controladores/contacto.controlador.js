import mongoose from 'mongoose';
import {Contacto} from '../modelos/contacto.modelo.js'

function limpiarString(datoEnviado){
    return typeof datoEnviado === 'string' ? datoEnviado.trim() : '';
}
//Para validar que sea email
function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}


export async function crearSuscripcion(peticion, respuesta, siguiente){
    try {
        
        //verificamos los datos recibidos. Vienen en la petición.
        const email = limpiarString(peticion.body.email).toLowerCase();

        if (!validarEmail(email)){
            return respuesta.status(400).json({error: 'Ingresá un correo electrónico válido.' });
        }

        //validamos si existe en la base de datos
        const yaExiste = await Contacto.findOne({tipo:'suscripcion', email});
        if (yaExiste){
            //finalizamos y le enviamos respuesta al Frontend
            return respuesta.status(200).json({mensaje:'Ese correo ya está registrado. Gracias!'})
        }
  
        //Sino continúa y Guardamos en la base de datos

        await Contacto.create({
            tipo:'suscripcion',
            email,
            fuente: limpiarString(peticion.body.fuente).slice(0,80) || 'noticias'
        });

        //Si está todo bien respondemos al frontend ok

        respuesta.status(201).json({mensaje : 'Gracias por suscribirte! Tu correo quedó registrado.'})

    } catch (error) {
        

        //continúa y el error lo toma al final el server.js. Si hay error la respuesta está en server.js
    }
}

export async function leerContactos (peticion,respuesta, siguiente){

    try {
        const tipo = ['suscripcion', 'mensaje'].includes(peticion.query.tipo) ? peticion.query.tipo : null;
        const filter = tipo ? {tipo} : {}; 
        const pagina = Math.max(1, Number.parseInt(peticion.query.pagina, 10) || 1);
        const limite = 3; //Es el límite por pagina para la paginación. Es un valor arbitrario.


        // Para que tome desde la base de datos toda la info junta. Es sentencia de MongoDB

        const [items, total, noleidos] = await Promise.all([
            Contacto.find(filter).sort({createdAt: -1}).skip((pagina - 1) * limite).limit(limite).lean(),
            Contacto.countDocuments(filter),
            Contacto.countDocuments({...filter, leido: false})
        ]);

     
        respuesta.status(200).json({items, total,noleidos, pagina, cantidadPaginas: Math.max(1, Math.ceil(total / limite))});
        
    } catch (error) {
        console.log(error);
        siguiente(error);
    }


}


export async function marcarComoLeido (peticion, respuesta,siguiente){
   
    try {
        //1- Verifico que sea un id válido de MongoDB. Observar que lo recibimos como params, no como query, ni como body.
        if(!mongoose.isValidObjectId(peticion.params.id)){
            return respuesta.status(400).json({error: 'Identificador inválido.'})
        }

        //2- Lo busco en el modelo (el programa busca directamente en la base de datos). Si lo encuentro lo modifica

        const item = await Contacto.findByIdAndUpdate(peticion.params.id, {leido:true}, {returnDocument: 'after'}).lean(); // sentencia de mongoose.


        //3- Si no lo encuentra responde no encontrado
        if (!item){
            return respuesta.status(404).json({error: 'Registro no encontrado.'})
        }

        //4- Todo bien, responde ok y continúa.

        respuesta.status(200).json({mensaje: 'Marcar como leido.'})
        
    } catch (error) {
        siguiente(error);
    }
}


export async function eliminarContacto(peticion,respuesta,siguiente){

    try {

        if (!mongoose.isValidObjectId(peticion.params.id)){
            return respuesta.status(400).json({error: 'Identificador inválido.'})
        }
        const item = await Contacto.findByIdAndDelete(peticion.params.id);

        if(!item){
            return respuesta.status(404).json({error: ' Registro no encontrado.'})
        }
        respuesta.status(200).json({mensaje: ' Registro eliminado.'})
        
    } catch (error) {
            siguiente(error)
    }

}

export async function crearMensaje(peticion,respuesta,siguiente){
    try {
        


        const nombre = limpiarString(peticion.body.nombre);
        const email = limpiarString(peticion.body.email);
        const mensaje = limpiarString(peticion.body.mensaje);

        if (nombre.length < 2 || nombre.length > 100){
            return respuesta.status(400).json({error: 'El nombre debe tener entre 2 y 100 caracteres.'});
        }
        if (!validarEmail(email)){
             return respuesta.status(400).json({error: 'Ingresá un correo electrónico válido.'});
        }
         if (mensaje.length < 5 || mensaje.length > 5000){
            return respuesta.status(400).json({error: 'El mensaje debe tener entre 5 y 5000 caracteres.'});
        }

        // Si está todo bien. Lo guarda

        await Contacto.create({tipo:'mensaje', nombre, email, mensaje, fuente: 'formulario-contacto'});

        respuesta.status(201).json({mensaje:'Mensaje enviado correctamente. Gracias por escribirnos'})
    } catch (error) {
        siguiente(error)
    }
}