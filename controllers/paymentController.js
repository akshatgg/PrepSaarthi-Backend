const instance = require('../razorpayIns');
const crypto = require('crypto')
const Student = require('../models/studentModel.js')
const Mentor = require("../models/mentorModel");
const Connection  = require("../models/connectionModel.js");
const Payment  = require("../models/paymentModel.js");
const errorCatcherAsync = require("../utils/errorCatcherAsync");
const ErrorHandler = require("../utils/errorHandeler.js");

exports.checkout = errorCatcherAsync(async (req, res, next) => {
  const amount = req.body.amount * 100
  const duration = req.body.duration
  const options = {
    amount , 
    currency: "INR",
  };
  const order = await instance.orders.create(options)
  res.status(200).json({
      success:true,
      duration,
      order
    }) 
});
exports.createPlan = errorCatcherAsync(async (req, res, next) => {
    const user = await Student.findById(req.user._id)
    if(user.role === 'admin' || user.role === 'mentor')
        {
            return next(new ErrorHandler("Not allowed", 400));
             
        }
    const amount = req.body.amount * 100
    const options = {
      period: "monthly",
      interval: 1,
      item: {
        name: "Test plan - Weekly",
        amount,
        currency: "INR",
        description: "Description for the test plan"
      },
    };
    const order =  await instance.plans.create(options)
    
   const subscription =  await instance.subscriptions.create({
        plan_id: order.id,
        customer_notify: 1,
        total_count: 12,
      })

    user.subscription.id = subscription.id;
    user.subscription.status = subscription.status;

    await user.save();

    res.status(201).json({
        success:true,
        subscriptionId:subscription.id
    })
});

exports.paymentVerification = errorCatcherAsync(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
    const { id, price , duration} = req.query
    
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAYKEY)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;
    if (isAuthentic) {
        // Database comes here
    
        // await Payment.create({
        //   razorpay_order_id,
        //   razorpay_payment_id,
        //   razorpay_signature,
        // });
        await Payment.create({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
          });
        const user = await Student.findById(req.user._id)
        if(!user){
          return next(new ErrorHandler("No such user exists", 400));
        }
        const mentor = await Mentor.findById(id);
        if(!mentor){
          return next(new ErrorHandler("No such mentor exists", 400));
        }
        user.mentorAssigned = true;
        const connection = {
          studentDetails:req.user.id,
          mentorDetails:id,
          expiresIn:duration === 'week' ? new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)) : (duration === 'month'? new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)): new Date(Date.now())),
          isActive:true,
          isConnected:false,
          price:price
        }
        await Connection.create(connection);
        await user.save({ validateBeforeSave: false });
    
        res.redirect(
          `http://${process.env.FRONTEND_URL}/payment/success?reference=${razorpay_payment_id}`
        );
      } else {
        res.status(400).json({
          success: false,
        });
      }


});
exports.paymentVerificationSub = errorCatcherAsync(async (req, res, next) => {
  const { razorpay_subscription_id, razorpay_payment_id, razorpay_signature } =
    req.body;
    const { id, price } = req.query
    const user = await Student.findById(req.user._id)

    const subscriptionId = user.subscription.id;

  const body = subscriptionId + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAYKEY)
    .update(body.toString(),'utf-8')
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;
    if (isAuthentic) {
        // Database comes here
    
        await Payment.create({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_subscription_id,
        });
    
        if(!user){
          return next(new ErrorHandler("No such user exists", 400));
        }
        const mentor = await Mentor.findById(id);
        if(!mentor){
          return next(new ErrorHandler("No such mentor exists", 400));
        }
        user.mentorAssigned = true;
        user.subscription.status = 'active' 
        const connection = {
          studentDetails:req.user.id,
          mentorDetails:id,
          expiresIn:new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)),
          isActive:true,
          isConnected:false,
          price:price
        }
        await Connection.create(connection);
        await user.save({ validateBeforeSave: false });
    
        res.redirect(
          `http://localhost:3000/payment/success?reference=${razorpay_payment_id}`
        );
      } else {
        res.redirect(`${process.env.FRONTEND_URL}/paymentfailed`);
      }

});
 
exports.cancelSubscription = errorCatcherAsync(async (req, res, next) => {
  const user = await Student.findById(req.user._id)

  const subscriptionId = user.subscription.id;

  await instance.subscriptions.cancel(subscriptionId)

  user.subscription.id = undefined;
  user.subscription.status = undefined;
  
  await user.save()

});
 
exports.getKey = errorCatcherAsync(async (req, res, next) => {
  res.status(200).json({
    key:process.env.RAZORPAYID
  })
});
 
