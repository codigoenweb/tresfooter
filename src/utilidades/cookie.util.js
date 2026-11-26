import crypto from 'node:crypto';

const SECRET = process.env.JWT_SECRET;

export function firmarCookie(valor){
 
    const hmac = crypto.createHmac('sha256', SECRET).update(valor).digest('hex');
   
    return `${valor}.${hmac}`;
}

export function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
    maxAge: 2 * 60 * 60 * 1000 // 2 horas
  };
}


export function setCookie (respuesta, nombre, valor, options = {}){

    const valorFirmado = firmarCookie(valor);

    let cookieString = `${nombre}=${encodeURIComponent(valorFirmado)}`;

    if (options.maxAge) cookieString += `; Max-Age=${Math.floor(options.maxAge / 1000)}`;
    if (options.path) cookieString += `; Path=${options.path}`;
    if (options.httpOnly) cookieString += `; HttpOnly`;
    if (options.secure) cookieString += `; Secure`;
    if (options.sameSite) cookieString += `; SameSite=${options.sameSite}`;

    respuesta.setHeader('Set-Cookie', cookieString);
}

export function  obtenerCookies(peticion){
  // para el caso de que hubiera varias

  const lista = {};

  // la petición tiene todas las cookies separadas por ; en un solo string
  const cookieEncabezado = peticion.headers.cookie;

  if(!cookieEncabezado) return lista; // si no hay nada retorna vacío.

  //si hay, las separa

  /**Este bloque de código en JavaScript convierte una cadena de texto de cookies (como la que viene en una cabecera HTTP) en un objeto llave-valor más fácil de manipular. */

  cookieEncabezado.split (';').forEach(cookie =>{
    const partes = cookie.split('=');

    const nombre = partes.shift().trim(); // el primer valor es el nombre

    /**decodeURIComponent(...) traduce caracteres especiales de URL a texto normal (por ejemplo, convierte %20 en un espacio). */
    const valor = decodeURIComponent(partes.join('='));

    // arma el listado de cookies.
    /**lista[nombre] = valor;• Guarda el resultado dentro de un objeto previamente creado llamado lista, usando el nombre de la cookie como clave y su contenido como valor (ej. lista["tema"] = "oscuro"). */
    lista[nombre] = valor;
  });

  return lista;
}

export function descifrarCookie(tokenFirmado){

  if (typeof tokenFirmado !== 'string') return false; // Si no es string sale

  //verifica si tiene punto, sino lo tiene significa que no está firmado.
  const ultimoPunto = tokenFirmado.lastIndexOf('.');
  /**Si NO encuentra ningún punto: Por convención en JavaScript, devuelve -1 porque esa posición no existe dentro del texto. */
  if (ultimoPunto === -1) return false;

  const tokenSinFirmar = tokenFirmado.slice(0, ultimoPunto);
  const laFirma = tokenFirmado.slice(ultimoPunto + 1);

  //Verifica que la firma sea nuestra, la que le pusimos cuando lo creamos.
  const hmacEsperado = crypto.createHmac('sha256', SECRET).update(tokenSinFirmar).digest('hex');

  const firmaBuffer = Buffer.from(laFirma, 'hex');
  const esperadoBuffer = Buffer.from(hmacEsperado, 'hex');

  if(firmaBuffer.length !== esperadoBuffer.length) return false;
  if(!crypto.timingSafeEqual(firmaBuffer,esperadoBuffer)) return false;

  // Si pasa todo sin error, a la cookie lo firmamos nosotros

  return tokenSinFirmar;


}

export function  limpiarCookie (respuesta, nombre, options ={}){

  // vacía la cookie y le asigna duración cero.

  let cookieString = `${nombre}=; Max-Age=0`;
  if (options.path) cookieString += `; Path=${options.path}`;
  if (options.httpOnly) cookieString += `; HttpOnly`;
  if (options.secure) cookieString += `; Secure`;
  if (options.sameSite) cookieString += `; SameSite=${options.sameSite}`;

  respuesta.setHeader('Set-Cookie', cookieString);

}

//Para poner pausa y leer si es de interés
/**¿Qué hace cada propiedad dentro de options?

Tu función toma esas propiedades y las traduce al formato de texto que exige el encabezado HTTP Set-Cookie:
• maxAge: Define cuánto tiempo dura la cookie en milisegundos (por eso tu código lo divide por 1000, ya que el estándar HTTP Max-Age espera segundos). Si no lo ponés, la cookie se borra al cerrar el navegador.
• path: Indica en qué rutas de tu web se envía la cookie. Si ponés '/', sirve para todo el sitio.
• httpOnly: Si es true, impide que el código JavaScript del navegador (document.cookie) pueda leer la cookie. Protege contra ataques XSS.
• secure: Si es true, el navegador solo enviará la cookie si la conexión usa HTTPS. (Ojo: en localhost sin HTTPS puede hacer que el navegador ignore la cookie si está en true).
• sameSite: Controla si la cookie se envía cuando el usuario viene desde otro sitio web ('Strict', 'Lax' o 'None'). Protege contra ataques CSRF. */