const mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');

const userSchema= new mongoose.Schema({
    admno:{
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
    year:{
        type:Number,
        required: true
    },
    totalfees:{
        type:Number,

    },
    feesdue:{
        type:Number,

    },
    totalpaid:
    {
        type:Number,
    },
    status:{
        type:Number,
        default:1
    },
    is_admin:{
        type:Number,
        required: true,
    },
    is_varified:{
        type:Number,
        default:0
    },
    paid: [
        {
          amount: {
            type: Number,
          },
          timestamp: {
            type: Date,
            default: Date.now
          }
        }
      ]
});

userSchema.plugin(uniqueValidator, { message: '{PATH} already exists!' });
module.exports =mongoose.model('User',userSchema);