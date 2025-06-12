const User = require("../../models/user.model.js");
const JobSchema = require("../../models/job.model.js");
const cloudinary = require("../../config/Cloudinary.js");

// Upload Offer Letter to Cloudinary
const UploadOfferLetter = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: "No offer letter uploaded" });

    const job = await JobSchema.findById(req.body.jobId);
    if (!job) return res.status(404).json({ msg: "Job not found!" });

    // Finding the applicant
    const applicant = job.applicants.find((app) => app.studentId == req.body.studentId);
    if (!applicant) return res.status(400).json({ msg: "Student has not applied to this job!" });

    // Upload offer letter to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
      folder: "CPMS/Offer Letter",
    });

    // Update offer letter path in MongoDB
    applicant.offerLetter = cloudinaryResponse.secure_url;

    await job.save();
    return res.json({ msg: "Offer Letter Uploaded Successfully!", url: cloudinaryResponse.secure_url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Server error", error });
  }
};

// Delete Offer Letter from Cloudinary & MongoDB
const DeleteOfferLetter = async (req, res) => {
  try {
    const { jobId, studentId } = req.params;

    // Validate input
    if (!jobId || !studentId) {
      return res.status(400).json({ msg: "Job ID and Student ID are required!" });
    }

    const job = await JobSchema.findById(jobId);
    if (!job) return res.status(404).json({ msg: "Job not found!" });

    const applicant = job.applicants.find((app) => app.studentId == studentId);
    if (!applicant) {
      return res.status(404).json({ msg: "Applicant not found for this job!" });
    }
    if (!applicant.offerLetter) {
      return res.status(400).json({ msg: "No offer letter found for this applicant!" });
    }

    // Improved public ID extraction from Cloudinary URL
    const cloudinaryUrl = applicant.offerLetter;
    let publicId;
    
    try {
      // Extract the part after the last slash and before the file extension
      const urlParts = cloudinaryUrl.split('/');
      const fileNameWithExt = urlParts[urlParts.length - 1];
      publicId = fileNameWithExt.split('.')[0];
      
      // The full path in Cloudinary including the folder
      const fullPublicId = `CPMS/Offer Letter/${publicId}`;
      
      // Delete from Cloudinary
      const deletionResult = await cloudinary.uploader.destroy(fullPublicId, { resource_type: "raw" });
      
      if (deletionResult.result !== 'ok') {
        console.error('Cloudinary deletion failed:', deletionResult);
        return res.status(500).json({ msg: "Failed to delete file from Cloudinary" });
      }

      // Update MongoDB
      applicant.offerLetter = null;
      await job.save();

      return res.json({ 
        msg: "Offer Letter Deleted Successfully!",
        deletionResult 
      });
      
    } catch (cloudinaryError) {
      console.error('Cloudinary error:', cloudinaryError);
      return res.status(500).json({ 
        msg: "Error deleting from Cloudinary",
        error: cloudinaryError.message 
      });
    }

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ 
      msg: "Server error during deletion",
      error: error.message 
    });
  }
};

module.exports = {
  UploadOfferLetter,
  DeleteOfferLetter,
};



