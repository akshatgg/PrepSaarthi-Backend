const ErrorHandler = require("./errorHandeler");

const errorCatcher = (err, req, res, next) => {
    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || 500;


    // MongoDb Error For Inavlid Id

    if(err.name === "CastError")
    {
        const message = `Resource not found ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    // Duplicate Email
    if(err.code === 11000){
        const message = `User with same ${Object.keys(err.keyValue)} already exists`;
        err = new ErrorHandler(message, 400)
    }
    
    
    //JWT Expire token
    
    if(err.name === "TokenExpiredError"){
        const message = `Your link has expired`
        err = new ErrorHandler(message, 400)
    }
    res.status(err.statusCode).json({
        success: false,
        message : err.message,
    }) 
}

module.exports = errorCatcher