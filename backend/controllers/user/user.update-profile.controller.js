const User = require("../../models/user.model");

// Update any user data by admin
const UpdateProfile = async (req, res) => {
  try {
    const userId = req.body._id || req.body.id;
    const user = await User.findById(userId);

    if (!user) return res.status(400).json({ msg: "User doesn't exist!" });

    // === Email Check ===
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists)
        return res.status(400).json({ msg: "Email already exists. Please enter another email!" });
      user.email = req.body.email;
    }

    // === UIN Check for students ===
    if (req.body.studentProfile?.UIN !== undefined) {
      const uinExists = await User.findOne({
        'studentProfile.UIN': req.body.studentProfile.UIN,
        _id: { $ne: userId } // Exclude current user
      });
      if (uinExists)
        return res.status(400).json({ msg: "UIN already exists. Please enter a correct UIN!" });
    }

    // === Number Validation ===
    if (req.body.number) {
      const number = req.body.number;
      if (!/^[0-9]{10}$/.test(number))
        return res.status(400).json({ msg: "Phone number must be exactly 10 digits!" });

      const duplicateNumberUser = await User.findOne({
        number,
        _id: { $ne: userId } // Exclude current user
      });

      if (duplicateNumberUser)
        return res.status(409).json({ msg: "Phone number already in use!" });

      user.number = number;
    }

    // === Basic Info ===
    if (req.body.name) user.name = req.body.name;
    if (req.body.gender) user.gender = req.body.gender;
    if (req.body.dateOfBirth) user.dateOfBirth = req.body.dateOfBirth;
    if (req.body.profile) user.profile = req.body.profile;

    if (req.body.fullAddress) {
      if (req.body.fullAddress.address) user.fullAddress.address = req.body.fullAddress.address;
      if (req.body.fullAddress.pincode) user.fullAddress.pincode = req.body.fullAddress.pincode;
    }

    // === Student Profile ===
    if (user.role === "student" && req.body.studentProfile) {
      const profile = req.body.studentProfile;
      if (profile.rollNumber) user.studentProfile.rollNumber = profile.rollNumber;
      if (profile.UIN) user.studentProfile.UIN = profile.UIN;
      if (profile.department) user.studentProfile.department = profile.department;
      if (profile.year) user.studentProfile.year = profile.year;
      if (profile.addmissionYear) user.studentProfile.addmissionYear = profile.addmissionYear;
      if (profile.gap !== undefined) user.studentProfile.gap = profile.gap;
      if (profile.liveKT) user.studentProfile.liveKT = profile.liveKT;

      if (profile.SGPA) {
        const sgpa = profile.SGPA;
        ['sem1', 'sem2', 'sem3', 'sem4', 'sem5', 'sem6', 'sem7', 'sem8'].forEach((sem) => {
          if (sgpa[sem] && sgpa[sem] !== "undefined") {
            user.studentProfile.SGPA[sem] = sgpa[sem];
          }
        });
      }

      if (profile.pastQualification) {
        const pq = profile.pastQualification;
        if (pq.ssc) {
          if (pq.ssc.board) user.studentProfile.pastQualification.ssc.board = pq.ssc.board;
          if (pq.ssc.year) user.studentProfile.pastQualification.ssc.year = pq.ssc.year;
          if (pq.ssc.percentage) user.studentProfile.pastQualification.ssc.percentage = pq.ssc.percentage;
        }

        if (pq.hsc && pq.hsc.board !== "undefined") {
          user.studentProfile.pastQualification.hsc.board = pq.hsc.board;
          user.studentProfile.pastQualification.hsc.year = pq.hsc.year;
          user.studentProfile.pastQualification.hsc.percentage = pq.hsc.percentage;
        }

        if (pq.diploma && pq.diploma.board !== "undefined") {
          user.studentProfile.pastQualification.diploma.department = pq.diploma.board;
          user.studentProfile.pastQualification.diploma.year = pq.diploma.year;
          user.studentProfile.pastQualification.diploma.percentage = pq.diploma.percentage;
        }
      }
    }

    // === Profile Completion Flag ===
    if (req.body.role !== 'superuser') {
      user.isProfileCompleted = true;
    }

    await user.save();

    return res.status(200).json({ msg: "Data updated successfully!" });
  } catch (error) {
    console.error("user.update-profile.controller ==> ", error);
    return res.status(500).json({ msg: "Internal Server Error!" });
  }
};

module.exports = UpdateProfile;
