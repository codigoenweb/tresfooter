import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { setCookie, getCookieOptions, limpiarCookie } from '../utilidades/cookie.util.js';


function limpiarString(valor){
    return typeof valor === 'string' ? valor.trim() : '';
}
function crearToken(){
    return jwt.sign(
        {sub: process.env.ADMIN_EMAIL, role: 'admin'},
        process.env.JWT_SECRET,
        {expiresIn:'2h', issuer: 'footer-hub', audience: 'footer-hub-admin'}
    );
}

export async function login(peticion,respuesta){
    //toma los datos y los verifica
    const email = limpiarString(peticion.body.email).toLowerCase();
    const password = typeof peticion.body.password === 'string' ? peticion.body.password : '';

    const usuarioValido = email === process.env.ADMIN_EMAIL.toLowerCase(); // Por este ejercicio, tendremos un usuarioa administrador fijo escrito en el .env. En el próximo ejercicio desarrollaremos la registración de usuarios.

    const passValida = await bcrypt.compare(password, process.env.ADMIN_PASS_HASH); //Simulamos una contraseña encryptda en la BD, pero por ahora en el .env. La generamos en la consola manualmente. 


     //Si están mal mensaje de error
    if (!usuarioValido || !passValida){
        return respuesta.status(401).json({error: 'Correo o contraseña incorrecta.'})
    }
  

    //Si está todo bien

    // creo el token
    const token = crearToken();
    //seteo la cookie

    setCookie(respuesta, 'admin_token', token, getCookieOptions());  // esta es una función que voy a definir yo.


    respuesta.status(200).json({mensaje:'Sesión iniciada'});
}


// A esta función solo llega si está autorizado
export async function tengoSesionAbierta(peticion,respuesta){
    respuesta.status(200).json({datos:'datos del administrador'})
}

export async function logout(peticion, respuesta){
    limpiarCookie(respuesta, 'admin_token', getCookieOptions());
    respuesta.status(200).json({mensaje: 'Sesión cerrada'})
}