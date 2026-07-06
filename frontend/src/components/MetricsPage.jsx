import { useEffect, useState } from "react";
import api from "../services/api";
import { rotateAuditorKey } from "../services/auditorService";
import CreateAuditorCard from "./CreateAuditorCard";
import { Spinner, SkeletonStats } from "./Loader";

export default function MetricsPage({ role, showToast }) {
  const resolvedRole = role?.toLowerCase() || "internal";
  const isInternal = resolvedRole === "internal";

  const [internalData, setInternalData] = useState(null);
  const [externalData, setExternalData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Key rotation display state
  const [rotatedKeyInfo, setRotatedKeyInfo] = useState(null);
  const [rotatingId, setRotatingId] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isInternal) {
        const res = await api.get("/api/metrics/internal/");
        setInternalData(res.data?.data || {});
      } else {
        const res = await api.get("/api/metrics/external/");
        setExternalData(res.data?.data || {});
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load metrics");
      showToast("Failed to fetch system metrics", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [resolvedRole]);

  const handleDeleteAuditor = async (auditorId) => {
    if (!window.confirm("Are you sure you want to delete this auditor? This action cannot be undone.")) {
      return;
    }
    try {
      await api.delete(`/api/auditor/${auditorId}/delete/`);
      showToast("Auditor deleted successfully", "success");
      fetchMetrics();
    } catch (err) {
      console.error("Delete failed:", err);
      showToast("Failed to delete auditor", "error");
    }
  };

  const handleRotateKey = async (auditorId) => {
    try {
      setRotatingId(auditorId);
      const res = await rotateAuditorKey(auditorId);
      const payload = res.data || {};
      
      setRotatedKeyInfo({
        privateKey: payload.new_private_key,
        publicKey: payload.new_public_key,
        version: payload.new_key_version
      });

      showToast("Key rotated successfully. Save the new private key!", "success");
      fetchMetrics();
    } catch (err) {
      console.error("Rotation failed:", err);
      showToast("Failed to rotate key", "error");
    } finally {
      setRotatingId(null);
    }
  };

  const handleCopyRotated = async () => {
    if (rotatedKeyInfo?.privateKey) {
      await navigator.clipboard.writeText(rotatedKeyInfo.privateKey);
      setCopied(true);
      showToast("Private key copied to clipboard", "success");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">System Metrics</h1>
        <div className="py-8">
          <SkeletonStats />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center shadow-sm">
          <p className="text-red-650 font-medium mb-4">{error}</p>
          <button
            onClick={fetchMetrics}
            className="bg-black hover:bg-gray-900 text-white font-medium px-5 py-2 rounded-xl text-sm transition"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const safe = (val, fallback = 0) => (val !== undefined && val !== null ? val : fallback);
  const safeDate = (date) => (date ? new Date(date).toLocaleString() : "No indexes found");

  /* =========================
     EXTERNAL VIEW
  ========================= */
  if (!isInternal) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-[fadeIn_0.3s_ease-out]">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            System Metrics
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-light">
            External Auditor Metrics (Restricted access)
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-sm shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-xs font-mono uppercase tracking-wider">
              Total Encrypted Documents
            </p>
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
          </div>
        <p className="text-3xl sm:text-4xl font-bold text-slate-900 break-words font-mono">
          {safe(externalData?.total_documents)}
        </p>
        </div>
      </div>
    );
  }

  /* =========================
     INTERNAL VIEW
  ========================= */
  const systemMetrics = internalData?.system_metrics || {};
  const auditors = internalData?.auditors || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-[fadeIn_0.3s_ease-out] space-y-6">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
          Analytics & Metrics
        </h1>
        <p className="text-slate-500 text-sm mt-1 font-light">
          Real-time performance metrics, key directories, and secure searchable indexes.
        </p>
      </div>

      {/* CREATE AUDITOR */}
      <CreateAuditorCard onCreated={fetchMetrics} showToast={showToast} />

      {/* TOP STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Vaulted Documents"
          value={safe(systemMetrics.total_documents)}
          icon={<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>}
        />
        <StatCard
          label="Symmetric SSE Tokens"
          value={safe(systemMetrics.total_tokens)}
          icon={<svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>}
        />
        <StatCard
          label="Avg External Lookup"
          value={`${safe(systemMetrics.avg_external_search_ms)} ms`}
          icon={<svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        />
        <StatCard
          label="Queries (Last 24 Hours)"
          value={safe(systemMetrics.external_searches_last_24h)}
          icon={<svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AUDITOR OVERVIEW */}
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm text-slate-700">
          <h3 className="font-bold mb-5 text-base sm:text-lg text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Auditor Authority Key Directory
          </h3>

          {auditors.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl">
              <p className="text-slate-500 text-sm">No auditors registered in the directory.</p>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
              {auditors.map((auditor) => (
                <div
                  key={auditor.auditor_id}
                  className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-xl p-4 hover:bg-gray-100 transition duration-150"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {auditor.name}
                    </p>
                    <div className="flex gap-2 items-center mt-1">
                      <span className="text-2xs font-mono text-slate-500">ID: {auditor.auditor_id}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="text-2xs font-mono text-emerald-600 font-semibold">Key Version: {safe(auditor.active_key_version, 1)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRotateKey(auditor.auditor_id)}
                      disabled={rotatingId === auditor.auditor_id}
                      className="text-xs bg-white hover:bg-gray-50 text-blue-600 border border-gray-300 px-3 py-1.5 rounded-lg transition cursor-pointer disabled:opacity-50 font-medium shadow-sm"
                    >
                      {rotatingId === auditor.auditor_id ? "Rotating..." : "Rotate Key"}
                    </button>
                    
                    <button
                      onClick={() => handleDeleteAuditor(auditor.auditor_id)}
                      className="text-xs text-red-650 hover:bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg transition cursor-pointer font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECURITY & INDEX HEALTH */}
        <div className="space-y-6">
          {/* SECURITY OVERVIEW */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold mb-5 text-base sm:text-lg text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Security Diagnostics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
              <MetricBox
                label="Failed Audit Signatures (24h)"
                value={safe(systemMetrics.failed_external_searches_last_24h)}
                danger={safe(systemMetrics.failed_external_searches_last_24h) > 0}
              />
              <MetricBox
                label="PEKS External Index Tokens"
                value={safe(systemMetrics.external_tokens)}
              />
            </div>
          </div>

          {/* INDEX HEALTH */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold mb-4 text-base sm:text-lg text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Index Health Sync
            </h3>

            <div className="space-y-3 font-sans">
              <Row
                label="Last Index Update"
                value={safeDate(systemMetrics.last_index_update)}
              />
              <Row
                label="Total Search Tokens"
                value={safe(systemMetrics.total_tokens)}
              />
              <Row
                label="Active Master Seed Version"
                value="HKDF-SHA256 (Base Seed v1)"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ROTATED KEY MODAL */}
      {rotatedKeyInfo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-xl shadow-2xl animate-[slideIn_0.2s_ease-out]">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              🔑 Rotated Keypair Ready (Version {rotatedKeyInfo.version})
            </h2>
            <p className="text-xs text-red-600 font-mono mb-4 font-semibold">
              WARNING: Save this private key now. It cannot be displayed again!
            </p>

            <textarea
              readOnly
              value={rotatedKeyInfo.privateKey}
              className="w-full h-44 border border-gray-200 bg-gray-50 p-3 rounded-xl font-mono text-2xs text-slate-800 mb-4 select-all custom-scrollbar focus:outline-none"
            />

            <div className="flex flex-col sm:flex-row sm:justify-end gap-2.5">
              <button
                onClick={handleCopyRotated}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-xl transition cursor-pointer shadow-sm"
              >
                {copied ? "Copied ✔" : "Copy Private Key"}
              </button>

              <button
                onClick={() => {
                  setRotatedKeyInfo(null);
                  setCopied(false);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
              >
                Completed & Saved Securely
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= COMPONENT LABELS ================= */

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-300 transition duration-200 flex items-center justify-between shadow-sm">
      <div>
        <p className="text-slate-500 text-xs uppercase font-mono tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-800 font-mono break-words">
          {value}
        </p>
      </div>
      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
}

function MetricBox({ label, value, danger }) {
  return (
    <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl flex-1">
      <p
        className={`text-2xl font-bold break-words font-mono ${
          danger ? "text-red-600" : "text-blue-600"
        }`}
      >
        {value}
      </p>
      <p className="text-slate-500 text-xs mt-1.5 uppercase font-mono tracking-wider font-semibold">
        {label}
      </p>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0 last:pb-0 gap-3 text-xs sm:text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-mono text-slate-800 break-all">{value}</span>
    </div>
  );
}
