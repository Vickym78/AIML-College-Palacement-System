import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BASE_URL } from '../config/backend_url';

function ViewNotice() {
  document.title = 'APMS | Notice';
  const { noticeId } = useParams();
  const navigate = useNavigate();

  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchNotice = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/management/get-notice?noticeId=${noticeId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });

      if (response.status === 200 && response.data) {
        setNotice(response.data);
      }
    } catch (error) {
      console.error("Error fetching notice => ", error);
      if (error.response?.status === 404) {
        navigate('/404');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotice();
  }, [noticeId]);

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (!notice) {
    return <div className="p-4 text-center text-red-500">Notice not found</div>;
  }

  return (
    <div className="my-4 mx-2 backdrop-blur-md bg-white/30 border border-white/20 rounded-lg py-4 px-5 shadow shadow-red-400 text-base max-sm:text-sm max-w-3xl mx-auto">
      <div className="flex flex-col gap-3 justify-between">
        <h1 className="text-3xl font-semibold max-sm:text-xl">{notice.title}</h1>
        <p className="whitespace-pre-wrap text-gray-800">{notice.message}</p>

        {/* Attachment section */}
        {notice.attachment && (
          <div className="mt-4">
            <strong>Attachment: </strong>
            <a 
              href={notice.attachment} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 underline"
            >
              View / Download
            </a>
          </div>
        )}

        <p className="text-right text-gray-500 text-sm mt-4">
          {new Date(notice.createdAt).toLocaleDateString('en-IN')}{" "}
          {new Date(notice.createdAt).toLocaleTimeString('en-IN')}
        </p>
      </div>
    </div>
  );
}

export default ViewNotice;
