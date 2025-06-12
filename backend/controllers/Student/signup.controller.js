const User = require("../../models/user.model");
const bcrypt = require('bcrypt');

const Signup = async (req, res) => {
  const { name, email,number, department, password } = req.body;

  try {
    if (await User.findOne({ email }))
      return res.status(400).json({ msg: "User Already Exists!" });

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name: name,
      email: email,
      number:number,
      department: department,  
      password: hashPassword,
      role: "student",
      studentProfile: {
        isApproved: false
      }
    });

    await newUser.save();
    return res.json({ msg: "User Created!" });

  } catch (error) {
    console.log("student.signup.controller.js => ", error);
    return res.status(500).json({ msg: "Internal Server Error!" });
  }
}

module.exports = Signup;
