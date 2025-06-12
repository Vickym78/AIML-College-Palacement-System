import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { BASE_URL } from '../../config/backend_url';

const UploadNoticeAttachment = ({ noticeId, fetchNoticeData }) => {
  const [uploadStatus, setUploadStatus] = useState('');
  const [currentUser, setCurrentUser] = useState({
    id: '',
    role: '',
  });

  // Check authentication and get current user
  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`${BASE_URL}/user/detail`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        setCurrentUser({
          id: res.data.id,
          role: res.data.role,
        });
      })
      .catch(err => {
        console.log("UploadNoticeAttachment.jsx => ", err);
      });
  }, []);

  // Handle attachment upload
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!e.target.files[0]) {
      setUploadStatus('Please select a file');
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'text/plain'
    ];

    if (!allowedTypes.includes(e.target.files[0].type)) {
      setUploadStatus('Only PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, and TXT files are allowed');
      return;
    }

    // Validate file size (10MB)
    if (e.target.files[0].size > 10 * 1024 * 1024) {
      setUploadStatus('File size exceeds 10MB limit');
      return;
    }

    const formData = new FormData();
    formData.append('attachment', e.target.files[0]);
    formData.append('userId', currentUser.id);
    formData.append('noticeId', noticeId);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BASE_URL}/notice/upload-attachment`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (fetchNoticeData) fetchNoticeData();
      setUploadStatus('Attachment uploaded successfully');
      
      // Clear status after 3 seconds
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (error) {
      console.error('Error uploading attachment', error);
      setUploadStatus(error.response?.data?.msg || 'Error uploading attachment');
    }
  };

  return (
    <>
      <FloatingLabel controlId="floatingAttachment" label="Add Attachment">
        <Form.Control
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
          placeholder="Upload Attachment"
          name="attachment"
          onChange={handleSubmit}
        />
        {uploadStatus && (
          <p className={`text-sm mt-1 ${
            uploadStatus.includes('success') ? 'text-success' : 'text-danger'
          }`}>
            {uploadStatus}
          </p>
        )}
      </FloatingLabel>
    </>
  );
};

export default UploadNoticeAttachment;