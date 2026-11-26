import jwt from 'jsonwebtoken';
import {obtenerCookies, descifrarCookie, limpiarCookie, getCookieOptions} from '../utilidades/cookie.util.js'



export async function requiereAutorizacion(peticion, respuesta, siguiente){
    
    //1- Obtenemos todas las cookies que pueda haber en la peticion. En este caso hay solo 1, pero podría haber más.

    const cookies = obtenerCookies(peticion); // función auxiliar que pronto desarrollaremos

    //2- Identificamos la que tiene el token firmado

    const tokenFirmado = cookies.admin_token; // es el nombre que le pusimos nosotros cuando la creamos

    //3 - Si no existe esta cookie, directamente salimos

    if(!tokenFirmado) {
        return respuesta.status(401).json({error: 'Sesión no iniciada'});
        
    }
    //4- Si existe obtenemos el token de la cookie, la desciframos

    const token  = descifrarCookie(tokenFirmado); // función auxiliar que pronto desarrollaremos

    //5- Si no logramos obtener el token , salimos

    if(!token){
        limpiarCookie (respuesta, 'admin_token', getCookieOptions()); // función auxiliar que pronto desarrollaremos
        // La limpiamos porque hay una cookie, que aparenta ser de aquí pero sin el token correspondiente.
        return respuesta.status(401).json({error: 'Firma de cookie inválida o alterada.'})
    }

    //Si está todo bien, Procesamos el token
    try {

        // verifica si el token es válido, con nuestra clave que está en el .env
        const datosCargados = jwt.verify(token, process.env.JWT_SECRET, {
            issuer:'footer-hub',
            audience:'footer-hub-admin'
        });
        // datos que escribimos cuando creamos el token.

        if (datosCargados.role !== 'admin' || datosCargados.sub !== process.env.ADMIN_EMAIL){
            throw new Error('invalido');
        }

        //Le agregamos a la petición nuestros datos

        peticion.admin = datosCargados;

        // y continúa a la función que da la respuesta final.
        siguiente();

        
    } catch (error) {

        limpiarCookie(respuesta, 'admin_token', getCookieOptions());
        return respuesta.status(401).json({error: 'Sesión vencida o inválida'});
        
    }





   
}