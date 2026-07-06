import { useState } from "react";
import api from "../services/api";
import { normalizeKeyword, sha256Hex, signHashHex } from "../utils/crypto";
import Terminal from "./Terminal";

export default function SearchPage({ role, auditor, privateKey, showToast }) {
  const [query, setQuery] = useState("");
  const [field, setField] = useState("pan");
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState(null);
  const [logs, setLogs] = useState(["Awaiting search query..."]);
  const [loading, setLoading] = useState(false);

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  const handleSearch = async () => {
    if (!query.trim()) {
      showToast("Please enter a search keyword", "warning");
      return;
    }

    try {
      setLoading(true);
      setResults([]);
      setMeta(null);
      setLogs(["Preparing verification query..."]);

      // =========================
      // INTERNAL SEARCH
      // =========================
      if (role === "internal") {
        await delay(300);
        setLogs((prev) => [...prev, `Hashing query value for field: ${field.toUpperCase()}`]);
        
        await delay(300);
        setLogs((prev) => [...prev, "Generating HMAC search trapdoor..."]);

        const payload = { [field]: query };

        await delay(200);
        setLogs((prev) => [...prev, "Requesting server-side SSE index search..."]);

        const res = await api.post("/api/search/internal/", payload);

        setResults(res.data.data?.results || []);
        setMeta(res.data.meta);
        setLogs((prev) => [
          ...prev,
          "Index matched. Server fetched encrypted records.",
          "Decrypting document ciphertexts using AES key...",
          "SSE Search Complete ✔",
        ]);
        showToast(`Internal search matched ${res.data.meta.total_matches} records`, "success");
      }

      // =========================
      // EXTERNAL SEARCH
      // =========================
      if (role === "external") {
        if (!privateKey) {
          setLogs((prev) => [...prev, "Error: No auditor private key found in current session"]);
          showToast("Auditor credentials missing", "error");
          setLoading(false);
          return;
        }

        if (!auditor) {
          setLogs((prev) => [...prev, "Error: No auditor identity selected"]);
          showToast("Identity identity missing", "error");
          setLoading(false);
          return;
        }

        await delay(300);
        setLogs((prev) => [...prev, "Normalizing query input (trim & lowercase)..."]);

        const normalized = normalizeKeyword(query);

        await delay(300);
        setLogs((prev) => [...prev, `Hashing keyword: sha256("${normalized}")`]);

        const keywordHash = await sha256Hex(normalized);
        setLogs((prev) => [...prev, `Computed hash: ${keywordHash}`]);

        await delay(400);
        setLogs((prev) => [...prev, "Signing keyword hash using browser RSA-PSS private key..."]);

        const signature = await signHashHex(keywordHash, privateKey);
        setLogs((prev) => [...prev, "RSA signature generated successfully."]);

        const payload = {
          auditor_id: auditor.auditor_id,
          key_version: auditor.active_key_version,
          keyword_hash: keywordHash,
          signature: signature,
        };

        await delay(300);
        setLogs((prev) => [...prev, "Posting verifiable signature to /api/search/external/"]);

        const res = await api.post("/api/search/external/", payload);

        setResults(res.data.data?.results || []);
        setMeta(res.data.meta);
        setLogs((prev) => [
          ...prev,
          "Auditor search signature validated by server ✔",
          "Encrypted result payloads retrieved.",
          `Result-set sized padded to ${res.data.meta.returned_count} to prevent metadata leakage.`,
          "Verifiable search complete ✔",
        ]);
        if (res.data.meta.total_matches > 0) {
          showToast("Auditor Verification SUCCESS: Record Exists", "success");
        } else {
          showToast("Auditor Verification COMPLETE: No matching record", "info");
        }
      }
    } catch (err) {
      console.error(err);
      const code = err.code || "SEARCH_FAILED";
      const message = err.message || "Something went wrong";
      showToast(`${code}: ${message}`, "error");
      setLogs((prev) => [...prev, `Search failed: ${code} - ${message}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 relative animate-[fadeIn_0.3s_ease-out]">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
          Encrypted Search
        </h1>
        <p className="text-gray-500 text-sm mt-1 font-light">
          {role === "internal"
            ? "SSE Console: Search securely using index trapdoors and return decrypted records."
            : "PEKS Auditor Console: Verify matching records without decrypting raw data payloads."}
        </p>
      </div>

      {/* ================= SEARCH CARD ================= */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm relative">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Internal Dropdown */}
          {role === "internal" && (
            <select
              value={field}
              onChange={(e) => setField(e.target.value)}
              className="border border-gray-300 bg-white px-4 py-2.5 rounded-xl text-sm focus:border-blue-500 focus:outline-none text-gray-800 cursor-pointer"
            >
              <option value="pan">PAN</option>
              <option value="customer_id">Customer ID</option>
              <option value="aadhaar">Aadhaar</option>
              <option value="name">Name</option>
              <option value="compliance_flag">Compliance Flag</option>
            </select>
          )}

          {/* Search Input */}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              role === "internal"
                ? `Enter field query (e.g. CUST1001 or Ravi)...`
                : "Enter auditor keyword query (e.g. CUST1001, clear, high_risk)..."
            }
            className="w-full sm:flex-1 border border-gray-300 bg-white rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none text-gray-800"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="font-medium px-6 py-2.5 rounded-xl text-sm transition duration-200 cursor-pointer border bg-black hover:bg-gray-900 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Search
          </button>
        </div>
      </div>

      {/* ================= RESULTS / LAYOUT GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT COLUMN: RESULTS */}
        <div className="space-y-6">
          {/* ================= INTERNAL RESULTS ================= */}
          {role === "internal" && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold mb-4 text-base sm:text-lg text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Decrypted Records
              </h2>

              {results.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-350 rounded-xl">
                  <p className="text-gray-400 text-sm">No decrypted query results found.</p>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[30rem] overflow-y-auto pr-1 custom-scrollbar">
                  {results.map((r, i) => (
                    <div
                      key={i}
                      className="bg-slate-900 border border-slate-950 rounded-xl p-4 font-mono text-xs sm:text-sm text-green-400 leading-relaxed shadow-inner"
                    >
                      <pre className="whitespace-pre-wrap">{JSON.stringify(r, null, 2)}</pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= EXTERNAL AUDIT RESULT SKEET ================= */}
          {role === "external" && meta && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm animate-[fadeIn_0.3s_ease-out]">
              <h2 className="font-bold mb-6 text-base sm:text-lg text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Audit Verification Certificate
              </h2>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Info label="Keyword Queried" value={query} />
                  <Info
                    label="Verification Audit Outcome"
                    value={meta.total_matches > 0 ? "SUCCESS (Record Verified ✔)" : "NOT FOUND (No match)"}
                    highlight={meta.total_matches > 0 ? "text-emerald-600" : "text-rose-600"}
                  />
                  <Info label="Actual Matches Found" value={meta.total_matches} />
                  <Info label="API Cryptographic Padding" value="50 results (fixed-size buffer)" />
                  <Info label="Verification Time" value={`${meta.execution_time_ms} ms`} />
                  <Info label="RSA signature verification" value={`${meta.signature_verification_ms} ms`} />
                  <Info label="Logs recorded" value={`Log Audit ID #${meta.audit_log_id}`} />
                  <Info
                    label="Data Visibility"
                    value="Ciphertext block padding (Encrypted)"
                    highlight="text-blue-700 font-semibold"
                  />
                </div>
              </div>

              {/* Raw Ciphertext Padded Block Visualization */}
              <div className="space-y-2.5">
                <p className="text-xs font-bold text-gray-500 uppercase font-mono tracking-wider">
                  Raw Size-Padded Server Packets (First 2 shown)
                </p>
                <div className="bg-slate-900 border border-slate-950 rounded-xl p-3 font-mono text-2xs space-y-2 text-gray-400 custom-scrollbar max-h-40 overflow-y-auto">
                  {results.slice(0, 2).map((res, i) => (
                    <div key={i} className="border-b border-slate-800 pb-2 last:border-0 last:pb-0">
                      <p className="text-green-400 font-semibold">Packet #{i + 1} {res.padded && "(Dummy padding)"}</p>
                      <p className="text-[10px] break-all"><span className="text-gray-500">Nonce:</span> {res.nonce}</p>
                      <p className="text-[10px] break-all"><span className="text-gray-500">Ciphertext:</span> {res.ciphertext}</p>
                    </div>
                  ))}
                  {results.length > 2 && (
                    <p className="text-center text-[10px] text-gray-500 pt-1 italic">
                      ... {results.length - 2} more packets padded in response block ...
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Verification Pending Helper Card */}
          {role === "external" && !meta && (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
              <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-xl mx-auto mb-4 flex items-center justify-center text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Awaiting Signature Query</h3>
              <p className="text-gray-500 text-xs max-w-xs mx-auto leading-relaxed">
                Enter a query term to verify record existence. The query will be signed using your RSA key before submitting.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: RUNTIME LOGS */}
        <Terminal title={role === "internal" ? "sse_search.py" : "peks_verifier.sh"} logs={logs} />
      </div>
    </div>
  );
}

/* ================= HELPER COMPONENT ================= */

function Info({ label, value, highlight }) {
  return (
    <div className="space-y-0.5">
      <p className="text-gray-400 text-xs uppercase font-mono tracking-wider font-semibold">{label}</p>
      <p className={`font-semibold break-words text-sm text-gray-800 ${highlight || ""}`}>
        {value}
      </p>
    </div>
  );
}
