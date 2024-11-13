const app = require('./app')
const dotenv = require('dotenv')
const path = require('path')
const connectDatabase = require('./config/db')

dotenv.config({path :path.join(__dirname, "config/config.env")})

connectDatabase();

const server = app.listen(process.env.PORT, ()=>{
    console.log(`Server is connected in ${process.env.PORT} in ${process.env.NODE_ENV} mode`);
})

//when any promsie function has some erroor
//ex : Mongodb conection uri error
process.on('unhandledRejection', (err)=>{
    console.log(`Error : ${err.message}`);
    console.log("Shutting down the server due to unhandled rejection");
    server.close(()=>{
        process.exit()
    })
})

//due to some unassigned values earlier
//ex: log(a)
process.on('uncaughtException', ()=>{
    console.log(`Error : ${err.message}`);
    console.log("Shutting down the server due to uncaught Exception");
    server.close(()=>{
        process.exit()
    })
})