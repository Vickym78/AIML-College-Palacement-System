const User = require("../../models/user.model");
const JobSchema = require("../../models/job.model");
const bcrypt = require("bcrypt");

// Get all student users
const studentUsers = async (req, res) => {
  try {
    const studentUsers = await User.find({ role: "student" });
    return res.json({ studentUsers });
  } catch (error) {
    console.error("studentUsers error:", error);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Add a new student user
const studentAddUsers = async (req, res) => {
  const { name, email, number, password } = req.body;

  if (!name || !email || !number || !password) {
    return res.status(400).json({ msg: "All fields are required!" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ msg: "User Already Exists!" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      number,
      password: hashPassword,
      role: "student",
      studentProfile: {
        isApproved: true,
      },
    });

    await newUser.save();
    return res.json({ msg: "User Created!" });

  } catch (error) {
    console.error("studentAddUsers error:", error);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Delete a student user
const studentDeleteUsers = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ msg: "User not found!" });
    }

    await user.deleteOne();
    return res.json({ msg: "User Deleted Successfully!" });

  } catch (error) {
    console.error("studentDeleteUsers error:", error);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Approve a student user
const studentApprove = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    user.studentProfile.isApproved = true;
    await user.save();
    return res.json({ msg: "Student Successfully Approved!" });

  } catch (error) {
    console.error('studentApprove error:', error);
    return res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = {
  studentUsers,
  studentAddUsers,
  studentDeleteUsers,
  studentApprove
};
