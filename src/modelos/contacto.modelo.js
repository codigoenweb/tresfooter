import mongoose from "mongoose";

const contactoEsquema = new mongoose.Schema({
    tipo:{
        type: String,
        enum:['suscripcion', 'mensaje'],
        required:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
        maxlength:254,
        index:true
    },
    nombre:{
        type: String,
        trim:true,
        maxlength:100
    },
    mensaje:{
        type:String,
        trim:true,
        maxlength:5000
    },
    fuente:{
        type:String,
        trim:true,
        maxlength: 80,
        default: 'web'
    },
    leido:{
        type: Boolean,
        default:false,
        index:true
    }
},{timestamps:true});

export const Contacto = mongoose.model('Contacto',contactoEsquema);