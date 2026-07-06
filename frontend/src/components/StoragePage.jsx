import { useState } from "react";
import { Spinner } from "./Loader";

export default function StoragePage({ showToast }) {
  const documents = [
    {
      id: "vault-doc-001",
      time: "2026-07-06, 11:15 AM",
      blob: "AES256:7f9a3b2e8c1d4f6a9e2b5c8d3f6a9e2b5c8d3f6a9e2b5c8d3f6a9e2b5c8d3f6a",
      tokens: [
        "HMAC:a3f2e1d939c0f99ab2134e12",
        "HMAC:b7c4f2a89901ef5b6d19a28e",
        "HMAC:e9d3c1f720abfcd18e10ffea"
      ],
      plaintext: {
        customer_id: "CUST1001",
        name: "Ravi Kumar",
        pan: "ABCDE1234F",
        aadhaar: "123412341234",
        compliance_flag: "high_risk"
      }
    },
    {
      id: "vault-doc-002",
      time: "2026-07-06, 12:40 PM",
      blob: "AES256:1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f",
      tokens: [
        "HMAC:c5e7a2f1de9a023bd7c1e9ea",
        "HMAC:d8f3b9e288fc0dfa9021990c",
        "HMAC:f1a6c4d9bc9901fe227bde21"
      ],
      plaintext: {
        customer_id: "CUST1002",
        name: "Jane Doe",
        pan: "XYZPD9876Q",
        aadhaar: "987654321012",
        compliance_flag: "normal"
      }
    },
    {
      id: "vault-doc-003",
      time: "2026-07-06, 02:10 PM",
      blob: "AES256:9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e",
      tokens: [
        "HMAC:a3f2e1d939c0f99ab2134e12",
        "HMAC:g2h5j8k100e478fdab91e102",
        "HMAC:m4n7p0q3ef0901da44a1e90d"
      ],
      plaintext: {
        customer_id: "CUST1003",
        name: "Aarav Sharma",
        pan: "KLMNO5678Z",
        aadhaar: "567856785678",
        compliance_flag: "audited"
      }
    }
  ];

  const [decrypting, setDecrypting] = useState({});
  const [decrypted, setDecrypted] = useState({});

  const handleSimulateDecrypt = async (docId) => {
    if (decrypted[docId]) {
      setDecrypted((prev) => ({ ...prev, [docId]: false }));
      showToast("Cleared decrypted view", "info");
      return;
    }

    try {
      setDecrypting((prev) => ({ ...prev, [docId]: true }));
      showToast("Fetching decryption subkey...", "info");
      
      // Simulate cryptographic calculation time
      await new Promise((res) => setTimeout(res, 800));
      
      setDecrypted((prev) => ({ ...prev, [docId]: true }));
      showToast("Document decrypted successfully!", "success");
    } catch (err) {
      showToast("Decryption failed", "error");
    } finally {
      setDecrypting((prev) => ({ ...prev, [docId]: false }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-[fadeIn_0.3s_ease-out] space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Encrypted Database Storage
        </h1>
        <p className="text-slate-500 text-sm mt-1 font-light">
          Inspect how document fields exist in the database: AES-256 ciphertexts accompanied by isolated HMAC index trapdoors.
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-slate-400 text-xs font-mono uppercase tracking-wider mb-1">Total Vault Documents</p>
          <p className="text-2xl font-bold text-slate-800 font-mono">3 Records</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-slate-400 text-xs font-mono uppercase tracking-wider mb-1">Encryption Core</p>
          <p className="text-2xl font-bold text-blue-600 font-mono">AES-256-GCM</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-slate-400 text-xs font-mono uppercase tracking-wider mb-1">Indexing Hash</p>
          <p className="text-2xl font-bold text-cyan-600 font-mono">HMAC-SHA256</p>
        </div>
      </div>

      {/* DOCUMENT LIST */}
      <div className="space-y-5">
        {documents.map((doc) => {
          const isDecrypting = decrypting[doc.id];
          const isDecrypted = decrypted[doc.id];

          return (
            <div
              key={doc.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:border-gray-300 transition duration-200"
            >
              {/* TOP ROW */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4 mb-4 gap-2">
                <div>
                  <p className="font-bold text-gray-800 text-sm sm:text-base flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    {doc.id}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">Stored Sync Time: {doc.time}</p>
                </div>

                <div className="flex gap-2">
                  <span className="text-[10px] border border-blue-200 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 font-mono uppercase tracking-wider font-semibold">
                    AES-256 protected
                  </span>
                  
                  <button
                    onClick={() => handleSimulateDecrypt(doc.id)}
                    disabled={isDecrypting}
                    className={`text-[10px] px-3 py-1 rounded-full transition font-semibold font-mono tracking-wider cursor-pointer uppercase border ${
                      isDecrypted
                        ? "bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                        : "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                    }`}
                  >
                    {isDecrypting ? (
                      <span className="flex items-center gap-1">
                        <svg className="animate-spin h-2.5 w-2.5 text-blue-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deciphering...
                      </span>
                    ) : isDecrypted ? (
                      "Lock Plaintext"
                    ) : (
                      "Decrypt Vault"
                    )}
                  </button>
                </div>
              </div>

              {/* BLOB BLOCK */}
              <div className="space-y-2 mb-5">
                <p className="text-xs font-bold text-slate-500 uppercase font-mono tracking-wider">
                  {isDecrypted ? "Decrypted Plaintext Record Schema" : "Encrypted Vault Blob (AES-256-GCM)"}
                </p>

                {isDecrypting ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl h-24 flex items-center justify-center">
                    <Spinner size="sm" text="Applying secure key matrix..." />
                  </div>
                ) : isDecrypted ? (
                  <div className="bg-slate-50 border border-emerald-200 rounded-xl p-4 font-mono text-xs text-emerald-800 leading-relaxed shadow-inner animate-[fadeIn_0.3s_ease-out]">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(doc.plaintext, null, 2)}</pre>
                  </div>
                ) : (
                  <div className="bg-slate-900 border border-slate-950 rounded-xl p-4 font-mono text-xs text-green-400 leading-relaxed break-all select-all shadow-inner relative group">
                    {doc.blob}
                  </div>
                )}
              </div>

              {/* TOKENS */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase font-mono tracking-wider">
                  Inverted Search Index Tokens (HMAC-SHA256)
                </p>

                <div className="flex flex-wrap gap-2">
                  {doc.tokens.map((t, i) => (
                    <span
                      key={i}
                      className="text-2xs bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl font-mono"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SECURITY NOTICE */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
        <div className="w-10 h-10 bg-yellow-100 border border-yellow-200 text-yellow-800 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="space-y-1 text-yellow-900">
          <p className="font-bold text-sm">Security Architecture Blueprint</p>
          <p className="text-xs leading-relaxed font-medium">
            Vault records are symmetrically locked at-rest. Plaintext columns do not persist. 
            Search matching is processed via HMAC trapdoor tokens, preserving field privacy even in the event of an adversary acquiring database access.
          </p>
        </div>
      </div>
    </div>
  );
}
