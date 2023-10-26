const mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');

const adminSchema= new mongoose.Schema({
    empid:{
        type:String,
        required:true,
        unique:true

    },
    name:{
        type:String,
        required: true,
        
    },
    email:{
         type:String,
        required: true,
         
         unique:true
    },
    mobile:{
        type:String,
        required: true,

         
         unique:true
    },
    password:{
        type:String,
        required: true,   
    },
    is_admin:{
        type:Number,
        required: true,
    },
    is_varified:{
        type:Number,
        default:0
    },
});

adminSchema.plugin(uniqueValidator, { message: '{PATH} already exists!' });
module.exports =mongoose.model('Admin',adminSchema);