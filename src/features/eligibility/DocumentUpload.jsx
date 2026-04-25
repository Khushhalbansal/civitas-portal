import React, { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../services/firebase/firebaseConfig';
import { useAuth } from '../../context/AuthContext';

/**
 * DocumentUpload Component
 * Demonstrates Firebase Cloud Storage integration by allowing users to securely
 * upload a proof of identity.
 *
 * @param {{ language: string }} props
 */
export const DocumentUpload = ({ language }) => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle'); // 'idle' | 'uploading' | 'success' | 'error'
  const { currentUser } = useAuth();

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setProgress(0);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    if (!currentUser) {
      alert(language === 'hi' ? 'कृपया पहले साइन इन करें।' : 'Please sign in first.');
      return;
    }

    setStatus('uploading');
    const fileRef = ref(storage, `documents/${currentUser.uid}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(prog);
      },
      (error) => {
        console.error('Upload failed:', error);
        setStatus('error');
      },
      () => {
        setStatus('success');
        // We could getDownloadURL(uploadTask.snapshot.ref) here if needed
      }
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-6">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <svg className="w-5 h-5 text-[#004A99]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <h3 className="text-lg font-semibold text-slate-800">
          {language === 'hi' ? 'दस्तावेज़ सत्यापन (वैकल्पिक)' : 'Document Verification (Optional)'}
        </h3>
      </div>
      <div className="p-6 space-y-4">
        <p className="text-sm text-slate-500">
          {language === 'hi' 
            ? 'अपनी पहचान सत्यापित करने के लिए एक सुरक्षित आईडी अपलोड करें (फायरबेस स्टोरेज द्वारा संचालित)।' 
            : 'Securely upload a valid ID to verify your identity (Powered by Firebase Storage).'}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <input 
            type="file" 
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png,.pdf"
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-[#004A99]/10 file:text-[#004A99]
              hover:file:bg-[#004A99]/20 transition-colors cursor-pointer"
          />
          <button
            onClick={handleUpload}
            disabled={!file || status === 'uploading' || status === 'success'}
            className="px-4 py-2 bg-[#004A99] text-white rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {status === 'uploading' ? (language === 'hi' ? 'अपलोड हो रहा है...' : 'Uploading...') : (language === 'hi' ? 'अपलोड करें' : 'Upload ID')}
          </button>
        </div>

        {status === 'uploading' && (
          <div className="w-full bg-slate-100 rounded-full h-2 mt-4">
            <div className="bg-[#004A99] h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        )}

        {status === 'success' && (
          <div className="mt-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {language === 'hi' ? 'दस्तावेज़ सफलतापूर्वक अपलोड किया गया!' : 'Document uploaded successfully!'}
          </div>
        )}

        {status === 'error' && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {language === 'hi' ? 'अपलोड विफल रहा। कृपया पुनः प्रयास करें।' : 'Upload failed. Please try again.'}
          </div>
        )}
      </div>
    </div>
  );
};
