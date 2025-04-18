const ErrorHandler = require("./errorHandeler");

const   roleAuth = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`You are not a ${roles[0]}`, 403));
        }
        next();
    }
}
module.exports = roleAuth