const express = require("express");
const router = express.Router();
const { createAppointment,getAllAppointment,rescheduleAppointment,appointmentConfirmation } = require("../controller/appointmentController")
const { createAdmin,loginAdmin } = require("../controller/adminController")

router.post("/createAppointment", createAppointment);
router.post("/getAllAppointment", getAllAppointment);
router.post("/createAdmin", createAdmin);
router.post("/admin/logInAdmin", loginAdmin);
router.put("/admin/rescheduleAppointment/:appointmentId", rescheduleAppointment)
router.put("/admin/appointmentConfirmation/:appointmentId", appointmentConfirmation)

module.exports = router;