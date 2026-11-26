//  import mongoose from "mongoose";
// export async function conectarBD(){

//   await mongoose.connect(process.env.MONGO_URI);
//     console.log('Base de datos Conectada');
//  }
import mongoose from 'mongoose';

let cached = global.mongoose;
 if (!cached) {
   cached = global.mongoose = { conn: null, promise: null };
 }

 export async function connectBDgit () {
   if (cached.conn) {
     return cached.conn;
   }
   if (!cached.promise) {
     cached.promise = mongoose.connect(process.env.MONGO_URI).then((mongoose) => {
       return mongoose;
     });
   }
   cached.conn = await cached.promise;
   console.log('Conectado a MongoDB Atlas.');
   return cached.conn;
/ }