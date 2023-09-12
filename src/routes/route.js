const express = require("express");
const router = express.Router();
const { createAppointment,getAllAppointment } = require("../controller/appointmentController")
const { createAdmin,loginAdmin } = require("../controller/adminController")

router.post("/createAppointment", createAppointment);
router.post("/getAllAppointment", getAllAppointment);
router.post("/createAdmin", createAdmin);
router.post("/logInAdmin", loginAdmin);

module.exports = router;