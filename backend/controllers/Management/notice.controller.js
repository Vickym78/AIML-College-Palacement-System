const mongoose = require('mongoose');
const Notice = require('../../models/notice.model');
const cloudinary = require('cloudinary').v2;

// Configure your Cloudinary credentials (ideally from env variables)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  
   timeout: 10000,
});

// Helper function for uploading buffer to Cloudinary using Promises and streams
function uploadFromBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto', folder: 'notices' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

const SendNotice = async (req, res) => {
  try {
    const receiver_role = req.body.receiver_role || "student";
    const sender_role = req.body.sender_role;
    const title = req.body.title;
    const message = req.body.message;
    const sender = new mongoose.Types.ObjectId(req.body.sender);

    // Handle file upload to Cloudinary if attachment is present
    let attachment_url = null;
    if (req.file) {
      attachment_url = await uploadFromBuffer(req.file.buffer);
    }

    // Create the notice with attachment URL if any
    const newNotice = new Notice({
      sender,
      sender_role,
      receiver_role,
      title,
      message,
      attachment: attachment_url,  // Store URL in DB
    });

    await newNotice.save();

    return res.json({ msg: "Notice Sent Successfully!" });
  } catch (error) {
    console.error('Error in notice.controller.js => ', error);
    return res.status(error.http_code || 500).json({ msg: error.message || "Internal Server Error!" });
  }
};

const GetAllNotice = async (req, res) => {
  try {
    const notices = await Notice.find();
    return res.json(notices);
  } catch (error) {
    console.error('Error in notice.controller.js => ', error);
    return res.status(500).json({ msg: "Internal Server Error!" });
  }
};

const GetNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.query.noticeId);
    if (!notice) {
      return res.status(404).json({ msg: "Notice not found!" });
    }
    return res.status(200).json(notice);
  } catch (error) {
    console.error('Error in notice.controller.js => ', error);
    return res.status(500).json({ msg: "Internal Server Error!" });
  }
};

const DeleteNotice = async (req, res) => {
  try {
    if (!req.query.noticeId) {
      return res.status(400).json({ msg: "Notice ID required for deletion!" });
    }
    await Notice.findByIdAndDelete(req.query.noticeId);
    return res.json({ msg: "Notice Deleted Successfully!" });
  } catch (error) {
    console.error('Error in notice.controller.js => ', error);
    return res.status(500).json({ msg: "Internal Server Error!" });
  }
};

module.exports = {
  SendNotice,
  GetAllNotice,
  DeleteNotice,
  GetNotice,
};
