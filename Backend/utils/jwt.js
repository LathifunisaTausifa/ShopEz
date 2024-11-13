const sendToken = (user , statusCode , res)=>{
    //creating jwt tokens
    const token = user.getJwtToken();

    //settin cookies
    const options = {
        expires : new Date(Date.now() + process.env.COOKIE_EXPIRES_TIME*24*60*60*1000),
        httpOnly : true , //can be accessed onlt by http  
    }


    res.status(statusCode)
    .cookie('token', token, options)
    .json({
        success : true,
        token,
        user
    })
}

module.exports = sendToken;