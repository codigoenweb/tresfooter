import 'dotenv/config';
import express from 'express';
//Debo especificar una ruta absoluta para mi computadora y también para cuando esté desplegado.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { manualHelmet } from './src/middleware/seguridad.middleware.js';


import contactoRutas from './src/rutas/contacto.rutas.js' // no va con paréntesis porque el archivo tiene export default
import autenticacionRutas from './src/rutas/autenticacion.rutas.js'
import { conectarBD } from './src/config/db.js';



const miApp = express();

const PORT = process.env.PORT || 3000;
const _dirname = path.dirname(fileURLToPath(import.meta.url));


// Para el caso de que no se configuren las variables de entorno que se necesitan para funcionar

for (const palabraClave of ['PORT', 'ADMIN_EMAIL', 'MONGO_URI']){
    if(!process.env[palabraClave]){
        console.log(`Falta configurar ${palabraClave} en el archivo .env`);
        //sale
        process.exit(1);
    }
}

//Para asegurarnos que nuestra clave firma JWT sea robusta.

if (process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET debe tener al menos 32 caracteres.');
  process.exit(1);
}
/**La línea miAplicacion.set('trust proxy', 1); sirve para indicarle a una aplicación en Express.js (Node.js) que está funcionando detrás de un proxy inverso (como Nginx, Cloudflare, Heroku, Render o AWS) y que debe confiar en los encabezados HTTP que este le envía.
El número 1 significa que la aplicación debe confiar únicamente en el primer salto (el proxy más cercano) en la red.*/

miApp.set('trust proxy', 1);


/** protege tu aplicación web configurando automáticamente encabezados HTTP de seguridad. Su objetivo principal es bloquear ataques comunes del lado del navegador con una sola línea de código. */
miApp.use(manualHelmet); 




//Para poder recibirlos, debemos configurar
miApp.use(express.json({limit:'20kb'}));


miApp.use('/api/admin',autenticacionRutas);
miApp.use('/api',contactoRutas); /**En Express.js, usamos app.use() para montar middlewares y conectar grupos enteros de rutas, mientras que app.get() sirve únicamente para responder a una petición puntual de tipo GET en una ruta exacta. */




miApp.use(express.static(path.join(_dirname,'public'),{ extensions :['html']}));
miApp.get('/admin',(peticion,respuesta)=> respuesta.sendFile(path.join(_dirname,'public', 'admin.html')));
miApp.get('*path', (peticion,respuesta) => respuesta.sendFile(path.join(_dirname, 'public' , 'index.html')));


//Y si no cayese en ningún lado y hay un error entra aquí y continúa sin romperse

miApp.use((error, peticion, respuesta, siguiente)=>{
    console.error(error)

    if (respuesta.headersSent){
        return siguiente(error);
    }
    respuesta.status(500).json({error: 'Ocurrió un error interno. Intentá nuevamente.'})
});


await conectarBD();

// ✅ Solo enciende el puerto si NO está en Vercel (ej. Render o localhost)
if (!process.env.VERCEL) {
    miApp.listen(PORT, () => console.log(`Servidor funcionando en http://localhost:${PORT}`))
}
// ✅ Exporta la app para que Vercel la tome como función serverless
export default miApp;