import { useState } from "react";
import api from "./services/api";
import Dashboard from "./pages/Dashboard";
import Toast from "./components/Toast";
import { Spinner } from "./components/Loader";
import { sha256Hex, signHashHex, verifySignatureHex } from "./utils/crypto";
import { handleApiError } from "./utils/errorHandler";

export default function App() {
  const [role, setRole] = useState(null);
  const [externalAuditors, setExternalAuditors] = useState([]);
  const [selectedAuditor, setSelectedAuditor] = useState(null);
  const [privateKeyInput, setPrivateKeyInput] = useState("");
  const [loadingAuditors, setLoadingAuditors] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  const logout = () => {
    setRole(null);
    setSelectedAuditor(null);
    setPrivateKeyInput("");
    showToast("Logged out successfully", "info");
  };

  const fetchAuditors = async () => {
    try {
      setLoadingAuditors(true);
      const res = await api.get("/api/metrics/internal/");
      const data = res.data?.data || {};
      const auditors = data.auditors || [];
      setExternalAuditors(auditors);
      return auditors;
    } catch (err) {
      console.error("Failed to fetch auditors", err);
      showToast("Failed to retrieve auditors directory", "error");
      return [];
    } finally {
      setLoadingAuditors(false);
    }
  };

  const handleExternalContinue = async () => {
    if (!privateKeyInput.trim()) {
      showToast("Auditor private key required", "warning");
      return;
    }

    if (!selectedAuditor) {
      showToast("Select an auditor identity", "warning");
      return;
    }

    try {
      const probe = `auditor-probe:${selectedAuditor.auditor_id}`;
      const probeHash = await sha256Hex(probe);
      const signature = await signHashHex(probeHash, privateKeyInput);
      let verifiedAuditor = selectedAuditor;

      try {
        const res = await api.post("/api/auditor/verify/", {
          auditor_id: selectedAuditor.auditor_id,
          signature,
        });
        verifiedAuditor = res.data?.data || selectedAuditor;
      } catch (err) {
        const status = err.response?.status;

        if (status !== 404) {
          throw err;
        }

        const auditors = await fetchAuditors();
        const freshAuditor = auditors.find(
          (auditor) => auditor.auditor_id === selectedAuditor.auditor_id
        );

        if (!freshAuditor) {
          showToast("Selected auditor no longer exists", "error");
          return;
        }

        if (!freshAuditor.public_key) {
          showToast(
            "Backend does not support /api/auditor/verify/ and auditor public key is unavailable",
            "error"
          );
          return;
        }

        const isValid = await verifySignatureHex(
          probeHash,
          signature,
          freshAuditor.public_key
        );

        if (!isValid) {
          showToast("Private key does not match selected auditor", "error");
          return;
        }

        verifiedAuditor = freshAuditor;
      }

      setSelectedAuditor(verifiedAuditor);

      setRole({
        type: "external",
        auditor: verifiedAuditor,
        privateKey: privateKeyInput,
      });

      showToast(`Logged in as ${verifiedAuditor.name}`, "success");
    } catch (err) {
      console.error(err);
      const { message } = handleApiError(err);
      showToast(message || "Invalid private key format or mismatched credentials", "error");
    }
  };

  // ===============================
  // ENTRY SCREEN
  // ===============================
  if (!role) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-12 relative">
        
        {/* Loading Bar when clicking Auditor Portal */}
        {loadingAuditors && (
          <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-100 overflow-hidden z-50">
            <div className="h-full bg-blue-600 animate-loader w-1/3 rounded-r"></div>
          </div>
        )}

        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-blue-650 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-md">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            Secure Encrypted Search System
          </h1>
          <p className="text-gray-500 max-w-md mx-auto text-sm">
            AES-256 Encryption • HMAC Trapdoors • SSE/PEKS Protocol
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
          {/* INTERNAL */}
          <div className="bg-white border rounded-2xl p-8 shadow-sm flex flex-col justify-between group hover:border-blue-500/50 transition">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Internal Analyst
              </h2>
              <p className="text-gray-500 text-sm mb-5">
                Full system access with decryption privileges
              </p>

              <ul className="text-sm space-y-3 mb-6 text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  Upload encrypted documents
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  View encrypted storage
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  Search with decryption (SSE)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  Access system metrics
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                setRole({ type: "internal" });
                showToast("Logged in as Internal Analyst", "success");
              }}
              className="w-full bg-black hover:bg-gray-900 text-white font-medium py-2.5 rounded-xl transition cursor-pointer"
            >
              Continue as Internal
            </button>
          </div>

          {/* EXTERNAL */}
          <div className="bg-white border rounded-2xl p-8 shadow-sm flex flex-col justify-between group hover:border-emerald-500/50 transition">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                External Auditor
              </h2>
              <p className="text-gray-500 text-sm mb-5">
                Limited access with search-only capabilities
              </p>

              <ul className="text-sm space-y-3 mb-6 text-gray-600">
                <li className="flex items-center gap-2 text-gray-400 line-through">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                  Upload encrypted documents
                </li>
                <li className="flex items-center gap-2 text-gray-400 line-through">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                  View encrypted storage
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  Search without decryption (PEKS)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  Access limited metrics
                </li>
              </ul>
            </div>

            <button
              onClick={async () => {
                await fetchAuditors();
                setRole({ type: "external_select" });
              }}
              disabled={loadingAuditors}
              className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingAuditors ? "Loading Directory..." : "Continue as External"}
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-10 text-center max-w-xl font-mono">
          Role-Based Access Control • SSE • PEKS
        </p>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    );
  }

  // ===============================
  // EXTERNAL AUDITOR SELECTION
  // ===============================
  if (role.type === "external_select") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-md shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Select Auditor Identity
          </h2>
          <p className="text-xs text-gray-500 mb-6">
            Choose your registered identity and provide the matching private key credentials.
          </p>

          {loadingAuditors ? (
            <div className="py-8">
              <Spinner text="Loading auditor registry..." />
            </div>
          ) : externalAuditors.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6 border border-dashed rounded-xl">
              No auditors available.
            </p>
          ) : (
            <div className="space-y-2 mb-6">
              {externalAuditors.map((auditor) => (
                <button
                  key={auditor.auditor_id}
                  onClick={() => setSelectedAuditor(auditor)}
                  className={`w-full border text-left px-4 py-3 rounded-xl transition text-sm flex justify-between items-center cursor-pointer ${
                    selectedAuditor?.auditor_id === auditor.auditor_id
                      ? "bg-gray-100 border-black text-black font-semibold"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>{auditor.name}</span>
                  <span className="text-[10px] bg-gray-150 border px-2 py-0.5 rounded text-gray-500 uppercase font-mono">
                    Ver {auditor.active_key_version}
                  </span>
                </button>
              ))}
            </div>
          )}

          {selectedAuditor && (
            <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
              <div className="space-y-1.5">
                <p className="text-xs text-gray-600 font-semibold font-mono tracking-wider">
                  Auditor Private Key
                </p>
                <textarea
                  value={privateKeyInput}
                  onChange={(e) => setPrivateKeyInput(e.target.value)}
                  className="w-full border border-gray-200 bg-white rounded-xl p-3 text-xs font-mono h-28 focus:border-black focus:outline-none text-gray-800 custom-scrollbar"
                  placeholder="-----BEGIN PRIVATE KEY-----&#10;..."
                />
              </div>

              <button
                onClick={handleExternalContinue}
                className="w-full bg-black hover:bg-gray-900 text-white font-medium py-3 rounded-xl transition cursor-pointer"
              >
                Continue
              </button>
            </div>
          )}

          <button
            onClick={() => {
              setSelectedAuditor(null);
              setPrivateKeyInput("");
              setRole(null);
            }}
            className="mt-6 w-full text-center text-xs text-gray-500 hover:text-gray-800 transition cursor-pointer"
          >
            ← Back
          </button>
        </div>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    );
  }

  // ===============================
  // DASHBOARD
  // ===============================
  return (
    <>
      <Dashboard
        role={role.type}
        auditor={role.auditor}
        privateKey={role.privateKey}
        logout={logout}
        showToast={showToast}
      />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
