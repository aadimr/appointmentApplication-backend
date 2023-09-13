const appointmentModel = require("../model/appointmentModel")
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');
require("dotenv").config()
const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.EMAIL_PASSWORD;
const regEmail = /^[a-zA-Z0-9_!#$%&’*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+$/
const regName = /^[A-Za-z]+(?: [A-Za-z]+)*$/
const regPhone = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/

const createAppointment = async function (req, res) {

    try {
        let data = req.body;
        const { fullName, emailId, phoneNo, PurposeOfTheMeeting, DateAndTime } = data
        if (!fullName && !emailId && !phoneNo && !PurposeOfTheMeeting && !DateAndTime) {
            return res.status(400).send({ status: false, message: "provide all the details" })
        }
        if (!fullName) return res.status(400).send({ status: false, message: "full name is mandatory" })
        if (typeof fullName !== "string" || fullName.trim().length === 0) {
            return res.status(400).send({ status: false, message: "please provide a valid name" })
        }
        if (!fullName.match(regName)) {
            return res.status(400).send({ status: false, message: "invalid name" })
        }

        if (!emailId) return res.status(200).send({ status: false, message: "emailId is mandatory" })
        if (!emailId.match(regEmail)) {
            return res.status(400).send({ status: false, message: "invalid email" })
        }

        if (!phoneNo) return res.status(400).send({ status: false, message: "Phone number is mandatory" })
        if (typeof phoneNo !== "string" || phoneNo.trim().length === 0) {
            return res.status(400).send({ status: false, message: "please provide a valid phone number" })
        }
        if (!phoneNo.match(regPhone)) {
            return res.status(400).send({ status: false, message: "please provide a valid phone number" })
        }

        if (!PurposeOfTheMeeting) return res.status(400).send({ status: false, message: "can't be empty" })
        if (typeof PurposeOfTheMeeting !== "string" || PurposeOfTheMeeting.trim().length === 0) {
            return res.status(400).send({ status: false, message: "can't be empty" })
        }

        if (!DateAndTime) return res.status(400).send({ status: false, message: "please select the date and time" })
        if (typeof DateAndTime !== "string" || DateAndTime.trim().length === 0) {
            return res.status(400).send({ status: false, message: "please select the date and time" })
        }
        console.log(DateAndTime)

        let savedata = await appointmentModel.create(data)

        let config = {
            service: 'gmail',
            auth: {
                user: EMAIL,
                pass: PASSWORD
            }
        }

        let transporter = nodemailer.createTransport(config);

        let clientMessage = {
            from: EMAIL,
            to: savedata.emailId,
            subject: "Appointment scheduled",
            html: `<p>Hello ${savedata.fullName},</p>
            <p>Your appointment has been scheduled successfully now wait for confirmation mail</p>
            <p>Thank you!</p>
            <p>Aditya Shaw</p>`
        }

        let adminMessage = {
            from: EMAIL,
            to: EMAIL,
            subject: "New Appointment",
            html: `
                <p>Hello Admin,</p>
                <p>A new appointment has been scheduled by the client ${savedata.fullName}:</p>
                <ul>
                    <li><strong>Client Email:</strong> ${savedata.emailId}</li>
                    <li><strong>Purpose of Meeting:</strong> ${savedata.PurposeOfTheMeeting}</li>
                    <li><strong>Client phoneNo.:</strong> ${savedata.phoneNo}</li>
                    <li><strong>Date and Time:</strong> ${savedata.DateAndTime}</li>
                </ul>
                <p>Thank you!</p>
            `
        };

        res.status(200).send({ status: true, message: "appointment scheduled successfully", data: savedata })

        await transporter.sendMail(clientMessage);
        await transporter.sendMail(adminMessage);
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}

const getAllAppointment = async function (req, res) {
    try {
        const allData = await appointmentModel.find()
        return res.status(200).send({ status: true, message: "getting all scheduled appointment successfully", data: allData })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

const rescheduleAppointment = async function (req, res) {
    try {
        const appointmentId = req.params.appointmentId

        let data = req.body;

        const { DateAndTime } = data

        if (!DateAndTime) return res.status(400).send({ status: false, message: "please select the date and time" })
        if (typeof DateAndTime !== "string" || DateAndTime.trim().length === 0) {
            return res.status(400).send({ status: false, message: "please select the date and time" })
        }

        let updatedData = await appointmentModel.findOneAndUpdate({ _id: appointmentId }, {
            $set: { DateAndTime: DateAndTime },
        }, { new: true });

        let config = {
            service: 'gmail',
            auth: {
                user: EMAIL,
                pass: PASSWORD
            }
        }

        let transporter = nodemailer.createTransport(config);

        let message = {
            from: EMAIL,
            to: updatedData.emailId,
            subject: "Appointment rescheduled",
            html: `<p>Hello ${updatedData.fullName},</p>
            <p>Your appointment has been rescheduled because originally planned time or date is no longer suitable and your new timing is ${updatedData.DateAndTime}</p>
            <p>Thank you!</p>
            <p>Aditya Shaw</p>`
        }

        res.status(200).send({ status: true, message: "Appointment rescheduled successfully", data: updatedData })

        await transporter.sendMail(message);

    } catch (error) { res.status(500).send({ status: false, msg: error.message }) }
};

const appointmentConfirmation = async function (req, res) {
    try {
        const appointmentId = req.params.appointmentId
        let updatedData = await appointmentModel.findOneAndUpdate({ _id: appointmentId }, {
            $set: { confirmOrCancelAppointment: "confirm" }
        }, { new: true });

        let config = {
            service: 'gmail',
            auth: {
                user: EMAIL,
                pass: PASSWORD
            }
        }

        let transporter = nodemailer.createTransport(config);

        let message = {
            from: EMAIL,
            to: updatedData.emailId,
            subject: "Appointment confirmed",
            html: `<p>Hello ${updatedData.fullName},</p>
            <p>Your appointment has been confirmed</p>
            <p>Thank you!</p>
            <p>Aditya Shaw</p>`
        }

        res.status(200).send({ status: true, message: "Appointment confirmed", data: updatedData, })

        await transporter.sendMail(message);

    } catch (error) { res.status(500).send({ status: false, msg: error.message }) }
};

const appointmentcancellation = async function (req, res) {
    try {
        const appointmentId = req.params.appointmentId
        let updatedData = await appointmentModel.findOneAndUpdate({ _id: appointmentId }, {
            $set: { confirmOrCancelAppointment: "cancel" }
        }, { new: true });

        let config = {
            service: 'gmail',
            auth: {
                user: EMAIL,
                pass: PASSWORD
            }
        }

        let transporter = nodemailer.createTransport(config);

        let message = {
            from: EMAIL,
            to: updatedData.emailId,
            subject: "Appointment cancelled",
            html: `<p>Hello ${updatedData.fullName},</p>
            <p>Your appointment has been cancelled</p>
            <p>Thank you!</p>
            <p>Aditya Shaw</p>`
        }

        res.status(200).send({ status: true, message: "Appointment cancelled", data: updatedData, })

        await transporter.sendMail(message);

    } catch (error) { res.status(500).send({ status: false, msg: error.message }) }
};


module.exports = {
    createAppointment,
    getAllAppointment,
    rescheduleAppointment,
    appointmentConfirmation,
    appointmentcancellation
};