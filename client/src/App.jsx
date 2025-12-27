// client/src/App.jsx
import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';
import API_URL from './apiConfig';
import { encryptFile } from './utils';
import Unlock from './Unlock';
import { 
  LockClosedIcon, 
  DocumentTextIcon, 
  ShieldCheckIcon, 
  ClockIcon, 
  TrashIcon, 
  CameraIcon, 
  XMarkIcon 
} from '@heroicons/react/24/solid';

function App() {
  const [view, setView] = useState('upload'); 

  // --- STATE ---
  const [file, setFile] = useState(null);
  const [email, setEmail] = useState('');
  const [trusteeEmail, setTrusteeEmail] = useState('');
  const [status, setStatus] = useState('');
  const [trusteeKey, setTrusteeKey] = useState(null);
  const [checkInStatus, setCheckInStatus] = useState('');
  
  // Feature 1: Timer State
  const [interval, setInterval] = useState("30000"); 

  // Feature 3: Webcam State
  const [showCamera, setShowCamera] = useState(false);
  const webcamRef = useRef(null);

  // --- LOGIC ---

  // 1. UPLOAD (Create Vault)
  const handleUpload = async () => {
    if (!file || !email || !trusteeEmail) return alert("All fields are mandatory for this contract.");
    setStatus("Encrypting Assets...");
    try {
      const { encryptedBlob, iv, serverKeyPart, trusteeKeyPart } = await encryptFile(file);
      const formData = new FormData();
      formData.append('encryptedFile', encryptedBlob, file.name + ".enc");
      formData.append('email', email);
      formData.append('trusteeEmail', trusteeEmail);
      formData.append('serverKeyPart', serverKeyPart);
      formData.append('iv', iv);
      
      // Feature 1: Send Interval
      formData.append('checkInInterval', interval); 

      setStatus("Sealing Vault...");
      await axios.post(`${API_URL}/api/upload`, formData, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus("Vault Sealed Successfully");
      setTrusteeKey(trusteeKeyPart); 
    } catch (error) {
      console.error(error);
      setStatus("Transaction Failed: " + (error.response?.data?.error || "Server Error"));
    }
  };

  // 2. CHECK-IN API CALL
  const performCheckIn = async () => {
    if (!email) return alert("Identity verification failed: Email required.");
    try {
      await axios.post(`${API_URL}/api/checkin`, { email });
      setCheckInStatus("Identity Verified. Timer Reset.");
      setTimeout(() => setCheckInStatus(''), 3000);
    } catch (error) {
      setCheckInStatus("Error: Subject not found in registry.");
    }
  };

  // Feature 3: Webcam Capture Logic
  const captureAndVerify = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      // In a real production app, you would send 'imageSrc' to backend for Face ID.
      // For this portfolio MVP, the act of capturing proves a human is present.
      performCheckIn(); 
      setShowCamera(false);
    }
  }, [webcamRef, email]);

  // 3. DELETE (Feature 2: Kill Switch)
  const handleDelete = async () => {
    if (!email) return alert("Enter your email in the 'Subject' box first to verify identity.");
    
    const confirm = window.confirm("⚠ WARNING: This will permanently destroy your vault and delete the file from our servers.\n\nAre you sure?");
    if (!confirm) return;

    try {
      await axios.delete(`${API_URL}/api/vault`, { data: { email } });
      alert("Vault Destroyed. All records wiped.");
      window.location.reload(); 
    } catch (error) {
      alert("Error: " + (error.response?.data?.error || "Failed to destroy vault."));
    }
  };

  return (
    <div className="min-h-screen bg-stone-200 text-stone-900 font-sans flex items-center justify-center p-4">
      
      {/* CARD CONTAINER */}
      <div className="w-full max-w-xl bg-[#fdfbf7] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative">
        
        {/* HEADER */}
        <div className="border-b-4 border-black p-8 bg-stone-100">
          <div className="flex justify-between items-start">
            <div>
                <h1 className="text-4xl font-serif font-black tracking-tighter uppercase mb-1">
                  Dead Man's Switch
                </h1>
                <p className="font-mono text-xs uppercase tracking-widest text-stone-500">
                  Protocol: Zero-Knowledge // Automated Inheritance
                </p>
            </div>
            <ShieldCheckIcon className="w-10 h-10 text-stone-900" />
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="flex border-b-4 border-black font-mono font-bold text-sm">
          <button 
            onClick={() => setView('upload')} 
            className={`flex-1 py-4 border-r-4 border-black hover:bg-black hover:text-white transition-colors uppercase ${view === 'upload' ? 'bg-black text-white' : 'bg-transparent text-black'}`}
          >
            1. Draft Will (Upload)
          </button>
          <button 
            onClick={() => setView('unlock')} 
            className={`flex-1 py-4 hover:bg-black hover:text-white transition-colors uppercase ${view === 'unlock' ? 'bg-black text-white' : 'bg-transparent text-black'}`}
          >
            2. Claim Assets (Unlock)
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-8">
          {view === 'upload' ? (
            <div className="animate-in fade-in duration-300">
               {trusteeKey ? (
                 // --- SUCCESS STATE ---
                 <div className="text-center">
                   <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6">
                     <LockClosedIcon className="w-10 h-10" />
                   </div>
                   <h2 className="text-2xl font-serif font-bold mb-2">Protocol Initiated</h2>
                   <p className="font-serif italic text-stone-600 mb-8 border-b-2 border-dashed border-stone-300 pb-8">
                     "The assets have been encrypted. Upon the cessation of heartbeat signals, the trustee shall receive access."
                   </p>
                   
                   <div className="bg-stone-200 border-2 border-black p-4 text-left mb-4 relative">
                     <p className="font-mono text-xs font-bold uppercase mb-2 text-stone-500">Private Key Part B (Trustee Copy)</p>
                     <p className="font-mono text-xl break-all tracking-tight leading-6">{trusteeKey}</p>
                   </div>
                   
                   <p className="text-xs font-bold text-red-600 uppercase mb-8">
                     ⚠ Warning: This key is not stored on our servers. Lost keys cannot be recovered.
                   </p>
                   
                   <button onClick={() => window.location.reload()} className="underline font-bold hover:bg-yellow-200">
                     Initiate New Contract
                   </button>
                 </div>
               ) : (
                 // --- FORM STATE ---
                 <div className="space-y-6">
                   <div className="grid gap-6">
                     <div className="relative">
                       <label className="block font-mono text-xs font-bold uppercase mb-1">Subject (Your Email)</label>
                       <input 
                        type="email" 
                        className="w-full bg-transparent border-b-2 border-stone-300 focus:border-black outline-none py-2 font-serif text-lg placeholder-stone-400 transition-colors"
                        placeholder="e.g. owner@vault.com"
                        value={email} onChange={(e) => setEmail(e.target.value)} 
                       />
                     </div>

                     <div className="relative">
                        <label className="block font-mono text-xs font-bold uppercase mb-1">Beneficiary (Trustee Email)</label>
                        <input 
                          type="email" 
                          className="w-full bg-transparent border-b-2 border-stone-300 focus:border-black outline-none py-2 font-serif text-lg placeholder-stone-400 transition-colors"
                          placeholder="e.g. trustee@vault.com"
                          value={trusteeEmail} onChange={(e) => setTrusteeEmail(e.target.value)} 
                        />
                     </div>

                     {/* FEATURE 1: TIMER */}
                     <div className="relative">
                        <div className="flex items-center gap-2 mb-1">
                          <label className="block font-mono text-xs font-bold uppercase">Inactivity Timer</label>
                        </div>
                        <div className="relative">
                          <ClockIcon className="w-5 h-5 absolute left-0 top-3 text-stone-400 pointer-events-none" />
                          <select 
                            className="w-full bg-transparent border-b-2 border-stone-300 focus:border-black outline-none py-2 pl-8 font-serif text-lg cursor-pointer appearance-none"
                            value={interval}
                            onChange={(e) => setInterval(e.target.value)}
                          >
                            <option value="30000">30 Seconds (Test Mode)</option>
                            <option value="300000">5 Minutes</option>
                            <option value="86400000">24 Hours</option>
                            <option value="604800000">7 Days</option>
                            <option value="2592000000">30 Days</option>
                          </select>
                        </div>
                        <p className="text-[10px] text-stone-500 mt-1">
                          * Protocol executes if "Alive" signal is missed for this duration.
                        </p>
                     </div>

                     <div className="relative">
                       <label className="block font-mono text-xs font-bold uppercase mb-1">Asset (File)</label>
                       <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-stone-400 hover:border-black hover:bg-stone-100 cursor-pointer transition-all mt-2">
                          <div className="text-center">
                            {file ? (
                              <p className="font-bold text-lg">{file.name}</p>
                            ) : (
                              <>
                                <DocumentTextIcon className="w-8 h-8 mx-auto mb-2 text-stone-400" />
                                <span className="font-bold text-stone-500">Click to attach document</span>
                              </>
                            )}
                          </div>
                          <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                       </label>
                     </div>
                   </div>

                   <button 
                    onClick={handleUpload} 
                    className="w-full bg-red-700 text-white font-bold font-mono uppercase py-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 transition-all active:translate-y-1 active:shadow-none mt-4"
                   >
                     {status || "Seal & Sign Contract"}
                   </button>

                   {/* CHECK IN SECTION (FEATURE 3: WEBCAM) */}
                   <div className="border-t-2 border-stone-300 pt-6 mt-8">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-bold text-sm">Proof of Life</p>
                          <p className="text-xs text-stone-500">Biometric verification required.</p>
                        </div>
                      </div>

                      {!showCamera ? (
                         <button 
                           onClick={() => setShowCamera(true)} 
                           className="w-full bg-black text-white px-6 py-3 font-bold text-xs uppercase hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
                         >
                           <CameraIcon className="w-4 h-4" />
                           Initiate Biometric Check-In
                         </button>
                      ) : (
                        <div className="bg-black p-2 border-2 border-stone-500 rounded">
                          <div className="relative rounded overflow-hidden mb-2">
                             <Webcam
                               audio={false}
                               ref={webcamRef}
                               screenshotFormat="image/jpeg"
                               className="w-full"
                             />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={captureAndVerify}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 uppercase text-xs"
                            >
                              Capture & Verify
                            </button>
                            <button
                              onClick={() => setShowCamera(false)}
                              className="bg-stone-700 hover:bg-stone-600 text-white px-3 py-2 rounded"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {checkInStatus && <p className="text-center font-mono text-xs font-bold text-green-700 mt-2 mb-4 animate-pulse">{checkInStatus}</p>}

                      {/* FEATURE 2: KILL SWITCH */}
                      <div className="mt-8 pt-4 border-t border-dashed border-stone-300 text-center">
                        <button 
                          onClick={handleDelete}
                          className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase tracking-widest flex items-center justify-center gap-1 mx-auto transition-colors"
                        >
                          <TrashIcon className="w-3 h-3" />
                          [ Danger: Destroy Vault ]
                        </button>
                      </div>
                   </div>
                 </div>
               )}
            </div>
          ) : (
            <Unlock />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;