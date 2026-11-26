import { Router } from "express";
import {login, tengoSesionAbierta, logout} from '../controladores/autenticacion.controlador.js';
import { requiereAutorizacion } from "../middleware/autenticacion.middleware.js";
import { authLimiter } from "../middleware/seguridad.middleware.js";


const enrutador = Router();



enrutador.post('/login',authLimiter,login);
enrutador.get('/sesion', requiereAutorizacion, tengoSesionAbierta);

enrutador.post('/logout', logout);




export default enrutador;