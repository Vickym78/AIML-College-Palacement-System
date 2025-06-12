const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authenticateToken = require('../middleware/auth.middleware');

// ========================= Multer Temp Storage ========================= //
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Temp upload folder (will be auto-deleted after Cloudinary upload)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '');
    cb(null, `${name}_${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

// ========================= Controllers ========================= //
const Login = require('../controllers/TPO/tpo.login.controller');
const PostJob = require('../controllers/TPO/tpo.post-job.controller');

const {
  AllJobs,
  DeleteJob,
  JobData,
  JobWithApplicants,
  StudentJobsApplied
} = require('../controllers/user/user.all-jobs.controller');

const UploadNoticeAttachment = require('../controllers/TPO/notice.attachment.controller');

// ========================= Routes ========================= //

// Auth
router.post('/login', Login);

// Job Management
router.post('/post-job', authenticateToken, PostJob);
router.get('/jobs', authenticateToken, AllJobs);
router.post('/delete-job', authenticateToken, DeleteJob);
router.get('/job/:jobId', authenticateToken, JobData);
router.get('/job/applicants/:jobId', authenticateToken, JobWithApplicants);
router.get('/myjob/:studentId', authenticateToken, StudentJobsApplied);

// Upload Notice Attachment (PDF, Word, Excel, etc. to Cloudinary)
router.post(
  '/notice/upload-attachment',
  authenticateToken,
  upload.single('attachment'), // frontend field name: attachment
  UploadNoticeAttachment
);

module.exports = router;
