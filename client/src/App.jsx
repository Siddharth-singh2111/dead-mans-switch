// client/src/App.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { encryptFile } from './utils';
import Unlock from './Unlock';
import { LockClosedIcon, DocumentTextIcon, KeyIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';

function App() {
  const [view, setView] = useState('upload'); 

  // --- STATE ---
  const [file, setFile] = useState(null);
  const [email, setEmail] = useState('');
  const [trusteeEmail, setTrusteeEmail] = useState('');
  const [status, setStatus] = useState('');
  const [trusteeKey, setTrusteeKey] = useState(null);
  const [checkInStatus, setCheckInStatus] = useState('');

  // --- LOGIC ---
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
      
      setStatus("Sealing Vault...");
      await axios.post('http://localhost:5000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus("Vault Sealed Successfully");
      setTrusteeKey(trusteeKeyPart); 
    } catch (error) {
      console.error(error);
      setStatus("Transaction Failed: " + (error.response?.data?.error || "Server Error"));
    }
  };

  const handleCheckIn = async () => {
    if (!email) return alert("Identity verification failed: Email required.");
    try {
      await axios.post('http://localhost:5000/api/checkin', { email });
      setCheckInStatus("Identity Verified. Timer Reset.");
      setTimeout(() => setCheckInStatus(''), 3000);
    } catch (error) {
      setCheckInStatus("Error: Subject not found in registry.");
    }
  };

  return (
    <div className="min-h-screen bg-stone-200 text-stone-900 font-sans flex items-center justify-center p-4">
      
      {/* CARD CONTAINER - The "Paper" Look */}
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

        {/* NAVIGATION (Tab Switcher) */}
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

                   {/* CHECK IN */}
                   <div className="border-t-2 border-stone-300 pt-6 mt-8 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm">Proof of Life</p>
                        <p className="text-xs text-stone-500">Signal verifying subject status.</p>
                      </div>
                      <button 
                        onClick={handleCheckIn} 
                        className="bg-black text-white px-6 py-2 font-bold text-xs uppercase hover:bg-stone-800 transition-colors"
                      >
                        Signal "Alive"
                      </button>
                   </div>
                   {checkInStatus && <p className="text-center font-mono text-xs font-bold text-green-700 mt-2">{checkInStatus}</p>}
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