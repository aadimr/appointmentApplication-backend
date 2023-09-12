const adminModel = require("../model/adminModel")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const jwtSecret = process.env.JWT_SECRET;
const regEmail = /^[a-zA-Z0-9_!#$%&’*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+$/
const regPswd = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()-_=+\[\]{}|;:'",.<>?/])[A-Za-z\d!@#$%^&*()-_=+\[\]{}|;:'",.<>?/]{8,50}$/

const createAdmin = async function (req, res) {

    try {
        let data = req.body;
        const { emailId, password } = data
        if (!emailId && !password) {
            return res.status(400).send({ status: false, message: "provide all the details" })
        }

        if (!emailId) return res.status(200).send({ status: false, message: "emailId is mandatory" })
        if (!emailId.match(regEmail)) {
            return res.status(400).send({ status: false, message: "invalid email" })
        }
        let validEmailId = await adminModel.findOne({ emailId })
        if (validEmailId) return res.status(400).send({ status: false, message: "email is already exist" })

        if (!password) return res.status(400).send({ status: false, message: "password is mandatory" })
        if (typeof password !== "string" || password.trim().length === 0) {
            return res.status(400).send({ status: false, message: "please provide a valid password" })
        }
        if (!password.match(regPswd)) {
            return res.status(400).send({ status: false, message: "password must contain at least one uppercase letter, one lowercase letter, one digit and one special character and the length must be between 8 to 50 characters " })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt);
        data.password = hashedPassword;

        let savedata = await adminModel.create(data)

        return res.status(200).send({ status: true, message: "admin created successfully", data: savedata })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}

const loginAdmin = async (req, res) => {
    try {
        let data = req.body
        let { emailId, password } = data
        if (!emailId && !password) return res.status(400).send({ status: false, message: "please provide the details" })
        if (!emailId) return res.status(200).send({ status: false, message: "enter your email" })
        if (!emailId.match(regEmail)) {
            return res.status(400).send({ status: false, message: "invalid email" })
        }
        if (!password) return res.status(400).send({ status: false, message: "enter your password" })
        if (typeof password !== "string" || password.trim().length === 0) {
            return res.status(400).send({ status: false, message: "please provide a valid password" })
        }
        if (!password.match(regPswd)) {
            return res.status(400).send({ status: false, message: "password must contain at least one uppercase letter, one lowercase letter, one digit and one special character and the length must be between 8 to 50 characters " })
        }
        let adminExist = await adminModel.findOne({ $or: [{ emailId: emailId }] })
        if (!adminExist) { return res.status(404).send({ status: false, message: "User doesn't exists !" }) }
        const passwordCompare = bcrypt.compare(password,adminExist.password)
        if (!passwordCompare) { return res.status(400).send({ status: false, message: "Please enter correct password" }) }
        let token = jwt.sign({ adminId: adminExist._id, email: adminExist.emailId }, jwtSecret, { expiresIn: "1096h" })
        let saveData = {
            token: token
        }
        return res.status(200).send({ status: true, message: "Admin login successfull", data: saveData })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



module.exports = {
   createAdmin,
   loginAdmin
};