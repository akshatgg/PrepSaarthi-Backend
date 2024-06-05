const express = require("express");

const isAuthorize = require("../middlewares/isAuthorize");
const roleAuth = require("../utils/roleAuth");
const { registerMentor, loginMentor, logout, forgotPass, resetPassord, getMentorDetails, updatePassword, updateProfile, updateMentorInfo, getSingleUsers, getAllMentors, loadUserDetails, updateMentorInfoAfter, getAllMentorByStatus, updateRole, getAllStudents, deleteUser, getAllMentorsAdmin, getAllAdmin, allConnection, assignConnection, removeConnection, allMentorConnection } = require("../controllers/mentorController");
const router = express.Router();


router.route("/register/mentor").post(registerMentor);
router.route("/login").post(loginMentor);
router.route("/logout").post(logout);
router.route("/password/forgot").post(forgotPass);
router.route("/password/reset/:tkid").put(resetPassord); 

router.route("/self").get(isAuthorize, loadUserDetails);
router.route("/user/info/:id").get(getMentorDetails);
router.route("/self/update/password").put(isAuthorize, updatePassword);
router.route("/self/update/profile").put(isAuthorize, updateProfile);
router.route("/self/update/profile/info").put(isAuthorize, updateMentorInfo);
router.route("/self/update/profile/info/after").put(isAuthorize, updateMentorInfoAfter);
// router.route("/user/info/:id").get(getSingleUsers);


// // Admin Routes
router.route("/admin/mentors").get(getAllMentors);

router.route("/admin/users/request").get(isAuthorize,roleAuth("admin"), getAllMentorByStatus)
router.route("/admin/users/:id").put(isAuthorize,roleAuth("admin"), updateRole)
router.route("/admin/students/all").get(isAuthorize,roleAuth("admin"), getAllStudents)
router.route("/admin/mentors/all").get(isAuthorize,roleAuth("admin"), getAllMentorsAdmin)
router.route("/admins/all").get(isAuthorize,roleAuth("admin"), getAllAdmin)
router.route("/admin/user/delete/:id").delete(isAuthorize,roleAuth("admin"), deleteUser)
router.route("/admin/all/connection/").get(isAuthorize,roleAuth("admin"), allConnection)
router.route("/mentor/all/connection/").get(isAuthorize,roleAuth("mentor"), allMentorConnection)
router.route("/admin/edit/connection/:id").put(isAuthorize,roleAuth("admin"), assignConnection)
router.route("/admin/remove/connections").put(isAuthorize,roleAuth("admin"), removeConnection)


module.exports = router;
