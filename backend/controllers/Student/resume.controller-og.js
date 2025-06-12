const User = require("../../models/user.model.js");
const cloudinary = require("../../config/Cloudinary.js");
const path = require("path");

const UploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No resume uploaded" });
    }

    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ msg: "Only PDF files are allowed" });
    }

    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(404).json({ msg: "Student not found!" });
    }

    const resumeUrl = user?.studentProfile?.resume;
    if (typeof resumeUrl === "string" && resumeUrl.trim() !== "") {
      try {
        const lastSlashIndex = resumeUrl.lastIndexOf("/");
        const lastDotIndex = resumeUrl.lastIndexOf(".");
        const fileName = resumeUrl.substring(lastSlashIndex + 1, lastDotIndex);
        const publicId = `CPMS/Resume/${fileName}`;
        await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
      } catch (err) {
        console.error("Error deleting old resume from Cloudinary:", err.message);
      }
    }

    const originalName = path.parse(req.file.originalname).name;
    const uniqueFilename = `${originalName}_${Date.now()}_${req.body.userId}`;

    const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
      folder: "CPMS/Resume",
      public_id: uniqueFilename,
      resource_type: "raw"
    });

    user.studentProfile.resume = cloudinaryResponse.secure_url;
    await user.save();

    return res.status(200).json({ msg: "Resume uploaded successfully!", url: cloudinaryResponse.secure_url });

  } catch (error) {
    console.error("UploadResume Error:", error);
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
};

module.exports = UploadResume;
