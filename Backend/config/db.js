const mongoose = require('mongoose')

const connectDatabase = ()=>{
    mongoose.connect(process.env.DB_LOCAL_URI).then(conn =>{
        console.log(`MongoDB is connected to the ${conn.connection.host}`);  
    }) 
} 
module.exports = connectDatabase