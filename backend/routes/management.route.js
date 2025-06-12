const express = require('express');
const multer = require('multer');
const authenticateToken = require('../middleware/auth.middleware');

const router = express.Router();

const Login = require('../controllers/Management/login.controller');
const UsersTPO = require('../controllers/Management/tpo-users.controller');
const DeleteTPO = require('../controllers/Management/delete-tpo.controller');
const { AddTPO, AddManagement, AddStudent } = require('../controllers/Management/add-user.controller');
const { SendNotice, GetAllNotice, DeleteNotice, GetNotice } = require('../controllers/Management/notice.controller');

// Multer setup: memory storage for file buffer to upload to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
router.post('/login', Login);
router.get('/tpo-users', authenticateToken, UsersTPO);
router.post('/deletetpo', authenticateToken, DeleteTPO);

router.post('/addtpo', authenticateToken, AddTPO);
router.post('/add-management', authenticateToken, AddManagement);
router.post('/add-student', authenticateToken, AddStudent);

// Notice routes with file upload middleware
router.post('/send-notice', authenticateToken, upload.single('attachment'), SendNotice);
router.get('/get-all-notices', authenticateToken, GetAllNotice);
router.get('/get-notice', authenticateToken, GetNotice);
router.post('/delete-notice', authenticateToken, DeleteNotice);

module.exports = router;
