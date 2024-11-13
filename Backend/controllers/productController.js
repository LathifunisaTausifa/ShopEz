const Product = require('../models/productModel')
const ErrorHandler = require('../utils/errorhandler')
const catchAsyncErrors = require('../middlewares/catchAsyncError')
const APIFeatures = require('../utils/apiFeatures')

//fetch products - {{base_url}}/api/v1/products/
exports.getProducts = async (req, res, next) => {
    const resPerPage = 2;
    const apiFeatures = new APIFeatures(Product.find(), req.query).search().filter().paginate(resPerPage);

    const products = await apiFeatures.query;
    res.status(200).json({
        success: true,
        count: products.length,
        products
    })
}

//create product  - {{base_url}}/api/v1/product/new
exports.newProduct = catchAsyncErrors(async (req, res, next) => {
    req.body.user = req.user.id;
    const product = await Product.create(req.body);
    res.status(201).json({
        success: true,
        product
    })
})

//fetch single product - {{base_url}}/api/v1/product/id
exports.getSingleProduct = async (req, res, next) => {
    const product = await Product.findById(req.params.id)
    //to check whether the product is valid
    if (!product) {
        return next(new ErrorHandler('Product Not Found', 400));
    }
    res.status(200).json({
        success: true,
        product
    })
}


//update products - {{base_url}}/api/v1/product/id
exports.updateProduct = async (req, res, next) => {
    let product = await Product.findById(req.params.id)
    //to check whether the product is valid
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        })
    }
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    res.status(200).json({
        success: true,
        product
    })
}

//delete product -{{base_url}}/api/v1/product/id
exports.deleteProduct = async (req, res, next) => {
    let product = await Product.findById(req.params.id)
    //to check whether the product is valid
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        })
    }
    await Product.deleteOne({ _id: req.params.id });

    res.status(200).json({
        success: true,
        message: "data Deleted"
    })
}