const express = require("express");
const isAuthorizeStu = require("../middlewares/isAuthorizeStu");
const {checkout, paymentVerification, getKey, createPlan, paymentVerificationSub} = require('../controllers/paymentController')
const router = express.Router();

router.route("/checkout").post(isAuthorizeStu , checkout)
router.route("/subscribe").post(isAuthorizeStu , createPlan)
router.route("/get/key").get(isAuthorizeStu , getKey)
router.route("/paymentVerification").post(isAuthorizeStu , paymentVerification)
router.route("/paymentVerification/subscription").post(isAuthorizeStu , paymentVerificationSub)
router.route("/paymentVerification/subscription/cancel").delete(isAuthorizeStu , paymentVerificationSub)
module.exports = router;