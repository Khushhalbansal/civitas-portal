import { useState, useRef } from 'react';
import DOMPurify from 'dompurify';
import { ocrVoterID } from '../../services/geminiService';

/**
 * VoterIDVerification Component
 * Uses Gemini's multimodal AI capabilities to perform OCR on voter ID images.
 * Images are processed at runtime — no data is stored (Zero-PII design).
 */
const VoterIDVerification = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  /** Validates file size and reads it as base64 data URL */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setError(null);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  /** Sends the image to Gemini for multimodal OCR extraction */
  const processOCR = async () => {
    if (!image) return;
    
    setLoading(true);
    setError(null);
    try {
      const text = await ocrVoterID(image);
      setResult(text);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /** Resets all state for a fresh upload */
  const clear = () => {
    setImage(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /**
   * Sanitizes OCR result for safe rendering.
   * Converts markdown bold (**text**) to <strong> and newlines to <br/>.
   */
  const sanitizeResult = (raw) => {
    const formatted = raw
      .replace(/\n/g, '<br/>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return DOMPurify.sanitize(formatted);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
          <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-800">Smart EPIC Verification</h3>
      </div>

      {!image ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
          role="button"
          tabIndex={0}
          aria-label="Upload Voter ID photo for AI verification"
          className="border-2 border-dashed border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-[#004A99] hover:bg-slate-50 transition-all group"
        >
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-slate-400 group-hover:text-[#004A99]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-600">Upload Voter ID Photo</p>
          <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden"
            aria-label="Choose voter ID photo to upload"
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-50">
            <img src={image} alt="Uploaded voter ID preview" className="w-full h-full object-contain" />
            <button 
              onClick={clear}
              aria-label="Remove uploaded image"
              className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!result && !loading && (
            <button
              onClick={processOCR}
              aria-label="Verify voter ID with AI"
              className="w-full py-3 bg-[#004A99] text-white rounded-xl font-bold hover:bg-[#003366] transition-all shadow-md"
            >
              Verify with AI
            </button>
          )}

          {loading && (
            <div className="flex flex-col items-center py-4" role="status" aria-label="Analyzing document">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-[#004A99] rounded-full animate-spin mb-3" aria-hidden="true" />
              <p className="text-sm font-medium text-slate-500 italic">AI is analyzing your document...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium" role="alert">
              {error}
            </div>
          )}

          {result && (
            <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wider">Verification Result</h4>
              </div>
              <div 
                className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-mono"
                dangerouslySetInnerHTML={{ __html: sanitizeResult(result) }}
              />
              <button
                onClick={clear}
                aria-label="Upload another voter ID"
                className="mt-6 w-full py-2 border-2 border-indigo-200 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors"
              >
                Upload Another
              </button>
            </div>
          )}
        </div>
      )}
      
      <p className="text-[10px] text-slate-400 mt-4 text-center leading-relaxed">
        * No data is stored on our servers. Images are processed at runtime via Gemini&apos;s secure AI pipeline.
      </p>
    </div>
  );
};

export default VoterIDVerification;
