  import mongoose from "mongoose";
 export async function conectarBD(){

   await mongoose.connect(process.env.MONGO_URI);
     console.log('Base de datos Conectada');
  }
