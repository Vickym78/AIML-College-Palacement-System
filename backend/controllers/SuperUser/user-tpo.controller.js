const User = require("../../models/user.model");
const bcrypt = require("bcrypt");

// Get all TPO users
const tpoUsers = async (req, res) => {
  try {
    const tpoUsers = await User.find({ role: "tpo_admin" });
    return res.json({ tpoUsers });
  } catch (error) {
    console.error("tpoUsers error =>", error);
    return res.status(500).json({ msg: "Server Error!" });
  }
};

// Add a new TPO user
const tpoAddUsers = async (req, res) => {
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
      role: "tpo_admin"
    });

    await newUser.save();
    return res.json({ msg: "User Created!" });
  } catch (error) {
    console.error("tpoAddUsers error =>", error);
    return res.status(500).json({ msg: "Internal Server Error!" });
  }
};

// Delete a TPO user
const tpoDeleteUsers = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ msg: "User Not Found!" });
    }

    await user.deleteOne();
    return res.json({ msg: "User Deleted Successfully!" });
  } catch (error) {
    console.error("tpoDeleteUsers error =>", error);
    return res.status(500).json({ msg: "Error While Deleting User!" });
  }
};

module.exports = {
  tpoUsers,
  tpoAddUsers,
  tpoDeleteUsers
};
