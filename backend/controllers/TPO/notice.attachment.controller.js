const Notice = require("../../models/notice.model.js");
const User = require("../../models/user.model.js");
const cloudinary = require("../../config/Cloudinary.js");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);

const UploadNoticeAttachment = async (req, res) => {
  try {
    // Validate request
    if (!req.file) {
      return res.status(400).json({ success: false, msg: "No attachment uploaded" });
    }

    if (!req.body.userId) {
      return res.status(400).json({ success: false, msg: "User ID is required" });
    }

    if (!req.body.noticeId) {
      await unlinkAsync(req.file.path);
      return res.status(400).json({ success: false, msg: "Notice ID is required" });
    }

    // Validate file types (now includes Excel files)
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel", // .xls
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "image/jpeg",
      "image/png",
      "text/plain"
    ];

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      await unlinkAsync(req.file.path);
      return res.status(400).json({ 
        success: false, 
        msg: "Only PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, and TXT files are allowed" 
      });
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (req.file.size > maxSize) {
      await unlinkAsync(req.file.path);
      return res.status(400).json({ 
        success: false, 
        msg: "File size exceeds 10MB limit" 
      });
    }

    // Find user and notice
    const [user, notice] = await Promise.all([
      User.findById(req.body.userId),
      Notice.findById(req.body.noticeId)
    ]);

    if (!user) {
      await unlinkAsync(req.file.path);
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    if (!notice) {
      await unlinkAsync(req.file.path);
      return res.status(404).json({ success: false, msg: "Notice not found" });
    }

    // Check if user is the sender of the notice
    if (!notice.sender.equals(user._id)) {
      await unlinkAsync(req.file.path);
      return res.status(403).json({ 
        success: false, 
        msg: "Only the notice sender can add attachments" 
      });
    }

    // Delete old attachment if exists
    if (notice.attachment) {
      try {
        const oldAttachmentUrl = notice.attachment;
        const publicId = oldAttachmentUrl.split("/").slice(-2).join("/").split(".")[0];
        await cloudinary.uploader.destroy(publicId, { resource_type: "auto" });
      } catch (cloudinaryError) {
        console.error("Error deleting old attachment:", cloudinaryError);
        // Continue with upload even if deletion fails
      }
    }

    // Generate secure filename
    const originalName = path.parse(req.file.originalname).name;
    const sanitizedFilename = originalName.replace(/[^a-zA-Z0-9-_]/g, "");
    const uniqueFilename = `notice_${sanitizedFilename}_${Date.now()}_${req.body.noticeId}`;

    // Upload to Cloudinary with appropriate resource type
    const uploadOptions = {
      folder: "CPMS/NoticeAttachments",
      public_id: uniqueFilename,
      resource_type: "auto" // Auto-detect resource type
    };

    // Special handling for Excel files to ensure proper format
    if (req.file.mimetype.includes("excel") || req.file.mimetype.includes("spreadsheet")) {
      uploadOptions.resource_type = "raw";
      uploadOptions.format = path.extname(req.file.originalname).substring(1); // Gets 'xls' or 'xlsx'
    }

    const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, uploadOptions);

    // Update notice with attachment
    notice.attachment = cloudinaryResponse.secure_url;
    await notice.save();

    // Clean up local file
    await unlinkAsync(req.file.path);

    return res.status(200).json({ 
      success: true,
      msg: "Notice attachment uploaded successfully",
      url: cloudinaryResponse.secure_url,
      publicId: cloudinaryResponse.public_id,
      noticeId: notice._id
    });

  } catch (error) {
    console.error("Notice attachment upload error:", error);
    
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
      msg: "Failed to upload notice attachment",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

module.exports = UploadNoticeAttachment;