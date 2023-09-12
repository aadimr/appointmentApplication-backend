const express = require("express");
const router = express.Router();
const { createAppointment,getAllAppointment } = require("../controller/appointmentController")

router.post("/createAppointment", createAppointment);
router.post("/getAllAppointment", getAllAppointment);

module.exports = router