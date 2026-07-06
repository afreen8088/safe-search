import { useState } from "react";
import api from "../services/api";

export default function CreateAuditorCard({ onCreated, showToast }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [privateKey, setPrivateKey] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      showToast("Please enter an auditor identity name", "warning");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/api/auditor/create/", { name });
      const key = res.data?.data?.private_key;

      setPrivateKey(key);
      setName("");
      showToast(`Auditor ${name} created successfully!`, "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to register new auditor identity", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (privateKey) {
      await navigator.clipboard.writeText(privateKey);
      setCopied(true);
      showToast("Private key copied to clipboard", "success");
    }
  };

  const handleClose = () => {
    setPrivateKey(null);
    setCopied(false);
    if (onCreated) onCreated();
  };

  return (
    <>
      {/* CREATE CARD */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold mb-2 text-base sm:text-lg text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Register New Auditor
        </h3>
        <p className="text-gray-500 text-xs mb-5 font-light">
          Generate an RSA public key directory entry and return a downloadable private credential key.
        </p>

        {/* INPUT AND ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Authority name (e.g. RBI-Auditor, Compliance-Dept)"
            className="flex-grow border border-gray-300 bg-white rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none text-gray-800"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
          />

          <button
            onClick={handleCreate}
            disabled={loading}
            className="bg-black hover:bg-gray-900 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition duration-200 disabled:opacity-50 cursor-pointer w-full sm:w-auto text-center font-sans"
          >
            {loading ? "Registering..." : "Add Auditor"}
          </button>
        </div>
      </div>

      {/* PRIVATE KEY MODAL */}
      {privateKey && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-xl shadow-2xl animate-[slideIn_0.3s_cubic-bezier(0.16,1,0.3,1)]">
            
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              ⚠️ Save This Auditor Private Key
            </h2>

            <p className="text-xs text-red-650 mb-4 font-sans font-semibold">
              This private key is shown ONLY once.
              Please copy and save it securely. It cannot be recovered later.
            </p>

            <textarea
              readOnly
              value={privateKey}
              className="w-full h-44 border border-gray-200 bg-gray-50 p-3 rounded-xl font-mono text-2xs text-gray-800 mb-4 select-all custom-scrollbar focus:outline-none"
            />

            <div className="flex flex-col sm:flex-row sm:justify-end gap-2.5">
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-xl transition cursor-pointer shadow-sm animate-none"
              >
                {copied ? "Copied ✔" : "Copy to Clipboard"}
              </button>

              <button
                onClick={handleClose}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
              >
                I Have Stored This Securely
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}