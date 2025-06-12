const User = require("../../models/user.model");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "Please provide both email and password." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User Doesn't Exist!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credentials Not Matched!' });
    }

    if (user.role !== "tpo_admin") {
      return res.status(400).json({ msg: 'Not Authorized!' });
    }

    const payload = { userId: user.id };
    
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ msg: "JWT secret not configured." });
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Optionally save the token in the user model
    user.token = token;
    await user.save();

    return res.json({ token });
  } catch (error) {
    console.error("student.login.controller.js => ", error);
    return res.status(500).json({ msg: "Internal Server Error!" });
  }
};

module.exports = Login;
