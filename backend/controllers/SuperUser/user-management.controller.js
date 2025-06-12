const User = require("../../models/user.model");
const bcrypt = require("bcrypt");

// Get all management users
const managementUsers = async (req, res) => {
  try {
    const managementUsers = await User.find({ role: "management_admin" });
    res.json({ managementUsers });
  } catch (error) {
    console.error("Error fetching management users:", error);
    res.status(500).json({ msg: "Internal Server Error!" });
  }
};

// Add a management user
const managementAddUsers = async (req, res) => {
  const { name, email, number, password } = req.body;

  if (!name || !email || !number || !password) {
    return res.status(400).json({ msg: "All fields are required!" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.json({ msg: "User Already Exists!" });

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      number,
      password: hashPassword,
      role: "management_admin",
    });

    await newUser.save();
    return res.json({ msg: "User Created!" });

  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ msg: "Internal Server Error!" });
  }
};

// Delete a management user
const managementDeleteUsers = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ msg: "Email is required!" });

  try {
    const result = await User.deleteOne({ email });
    if (result.deletedCount === 1) {
      return res.json({ msg: "User Deleted Successfully!" });
    } else {
      return res.status(404).json({ msg: "User not found!" });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ msg: "Error While Deleting User!" });
  }
};

module.exports = {
  managementUsers,
  managementAddUsers,
  managementDeleteUsers,
};
