const products = require('../data/products.json')
const Product = require('../models/productModel')
const dotenv = require('dotenv')
const connectDatabase = require('../config/db')
dotenv.config({path:'config/config.env'})
connectDatabase();

const seedProducts =async ()=>{
    try{
        await Product.deleteMany();
        console.log("Datas in the Schema has been deleted");
        await Product.insertMany(products)
        console.log("Products added");
    }catch(error){
        console.log(error.message);
    }
    process.exit()
}

seedProducts()