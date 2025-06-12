const User = require("../../models/user.model.js");
const cloudinary = require("../../config/Cloudinary.js");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);

const UploadResume = async (req, res) => {
  try {
    // Validate request
    if (!req.file) {
      return res.status(400).json({ msg: "No resume uploaded" });
    }

    if (!req.body.userId) {
      return res.status(400).json({ msg: "User ID is required" });
    }

    // Validate file type
    const allowedMimeTypes = ["application/pdf"];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      await unlinkAsync(req.file.path); // Clean up uploaded file
      return res.status(400).json({ msg: "Only PDF files are allowed" });
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      await unlinkAsync(req.file.path);
      return res.status(400).json({ msg: "File size exceeds 5MB limit" });
    }

    // Find user
    const user = await User.findById(req.body.userId);
    if (!user) {
      await unlinkAsync(req.file.path);
      return res.status(404).json({ msg: "Student not found" });
    }

    // Delete old resume if exists
    if (user.studentProfile.resume) {
      try {
        const oldResumeUrl = user.studentProfile.resume;
        const publicId = oldResumeUrl.split("/").slice(-2).join("/").split(".")[0];
        await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
      } catch (cloudinaryError) {
        console.error("Error deleting old resume:", cloudinaryError);
        // Continue with upload even if deletion fails
      }
    }

    // Generate secure filename
    const originalName = path.parse(req.file.originalname).name;
    const sanitizedFilename = originalName.replace(/[^a-zA-Z0-9-_]/g, "");
    const uniqueFilename = `resume_${sanitizedFilename}_${Date.now()}_${req.body.userId}`;

    // Upload to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
      folder: "CPMS/Resume",
      public_id: uniqueFilename,
      resource_type: "raw",
      format: "pdf",
    });

    // Update user record
    user.studentProfile.resume = cloudinaryResponse.secure_url;
    await user.save();

    // Clean up local file
    await unlinkAsync(req.file.path);

    return res.status(200).json({ 
      success: true,
      msg: "Resume uploaded successfully",
      url: cloudinaryResponse.secure_url,
      publicId: cloudinaryResponse.public_id
    });

  } catch (error) {
    console.error("Resume upload error:", error);
    
    // Clean up local file if it exists
    if (req.file?.path) {
      try {
        await unlinkAsync(req.file.path);
      } catch (cleanupError) {
        console.error("Error cleaning up file:", cleanupError);
      }
    }

    return res.status(500).json({ 
      success: false,
      msg: "Failed to upload resume",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

module.exports = UploadResume;