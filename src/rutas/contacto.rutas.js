import {Router} from 'express';

import { crearSuscripcion, leerContactos,marcarComoLeido,eliminarContacto, crearMensaje } from '../controladores/contacto.controlador.js'; // aquí si va entre paréntesis porque es una función individual del archivo. Vamos a tener varias más.
import { requiereAutorizacion } from "../middleware/autenticacion.middleware.js";
import { publicLimiter } from '../middleware/seguridad.middleware.js';

const enrutador = Router();





enrutador.post('/suscribir',publicLimiter, crearSuscripcion);
enrutador.post('/mensajes', publicLimiter, crearMensaje);


//Parte privada a la que solo accede el administrador
enrutador.get('/admin/contactos',requiereAutorizacion, leerContactos );
enrutador.patch('/admin/contactos/:id/leido', requiereAutorizacion, marcarComoLeido);
enrutador.delete('/admin/contactos/:id', requiereAutorizacion, eliminarContacto);




export default enrutador;