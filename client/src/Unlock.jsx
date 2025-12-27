// client/src/Unlock.jsx
import React, { useState } from 'react';
import axios from 'axios';
import API_URL from './apiConfig';
import { decryptFile } from './utils';

const Unlock = () => {
  const [email, setEmail] = useState('');
  const [trusteeKey, setTrusteeKey] = useState('');
  const [status, setStatus] = useState('');

  const handleUnlock = async () => {
    try {
      setStatus("Querying Ledger...");
      const { data: meta } = await axios.get(`${API_URL}/api/status/${email}`);
      
    
     const response = await axios.get(`${API_URL}/api/download/${meta.filename}`, {
         responseType: 'blob'
      });

      setStatus("Applying Decryption Key...");
      const decryptedBlob = await decryptFile(
        response.data, 
        meta.serverKeyPart, 
        trusteeKey,
        meta.iv             
      );

      const url = window.URL.createObjectURL(decryptedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = meta.originalName;
      document.body.appendChild(a);
      a.click();
      
      setStatus("Asset Released to Trustee.");
    } catch (error) {
      console.error(error);
      setStatus("Access Denied: Invalid Credentials.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
        <p className="text-sm font-serif italic text-yellow-900">
          "To claim inheritance, the beneficiary must provide the email of the subject and the private key fragment previously entrusted to them."
        </p>
      </div>

      <div className="space-y-6">
        <div className="relative">
            <label className="block font-mono text-xs font-bold uppercase mb-1">Subject Email</label>
            <input 
                className="w-full bg-transparent border-b-2 border-stone-300 focus:border-black outline-none py-2 font-serif text-lg placeholder-stone-400"
                placeholder="owner@vault.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
            />
        </div>

        <div className="relative">
            <label className="block font-mono text-xs font-bold uppercase mb-1">Private Key Fragment</label>
            <input 
                className="w-full bg-transparent border-b-2 border-stone-300 focus:border-black outline-none py-2 font-mono text-lg placeholder-stone-400"
                placeholder="Paste key here..."
                value={trusteeKey}
                onChange={e => setTrusteeKey(e.target.value)}
            />
        </div>
      </div>

      <button 
        onClick={handleUnlock}
        className="w-full bg-black text-white font-bold font-mono uppercase py-4 border-2 border-transparent shadow-[4px_4px_0px_0px_rgba(100,100,100,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-stone-900 transition-all active:translate-y-1 active:shadow-none"
      >
        Decrypt & Claim
      </button>

      {status && (
        <div className="text-center font-mono text-xs border-t-2 border-stone-200 pt-4">
           STATUS: <span className="font-bold">{status}</span>
        </div>
      )}
    </div>
  );
};

export default Unlock;