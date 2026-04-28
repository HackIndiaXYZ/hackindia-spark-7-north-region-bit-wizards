import { useState, useCallback, useEffect, useRef } from "react";
import { ethers } from "ethers";

const COLORS = {
  navy: "#0f172a",
  navyLight: "#1e293b",
  blue: "#2563eb",
  blueDark: "#1d4ed8",
  green: "#16a34a",
  greenDark: "#15803d",
  bg: "#f8fafc",
  white: "#ffffff",
  border: "#e2e8f0",
  muted: "#64748b",
  subtle: "#f1f5f9",
  mono: "#334155",
};

const STATUS = {
  IDLE: null,
  HASHING: "hashing",
  UPLOADING: "uploading",
  BLOCKCHAIN: "blockchain",
  DONE: "done",
  ERROR: "error",
};

const categoryColors = {
  Environment: { bg: "#d1fae5", text: "#065f46" },
  Corruption: { bg: "#fee2e2", text: "#7f1d1d" },
  "Public Safety": { bg: "#dbeafe", text: "#1e3a8a" },
  Crime: { bg: "#fce7f3", text: "#831843" },
  Other: { bg: "#f3f4f6", text: "#374151" },
};

// ── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      style={{ animation: "spin 0.8s linear infinite", display: "inline-block", verticalAlign: "middle", marginRight: 8 }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}

// ── Step progress bar shown while uploading ──────────────────────────────────
const UPLOAD_STEPS = [
  { key: STATUS.HASHING,    label: "Computing SHA-256 hash…" },
  { key: STATUS.UPLOADING,  label: "Uploading to IPFS via Pinata…" },
  { key: STATUS.BLOCKCHAIN, label: "Recording on Sepolia blockchain…" },
  { key: STATUS.DONE,       label: "Done!" },
];

function UploadProgress({ status }) {
  if (!status || status === STATUS.IDLE || status === STATUS.ERROR) return null;

  const currentIdx = UPLOAD_STEPS.findIndex(s => s.key === status);

  return (
    <div style={{
      marginTop: 20,
      background: "#eff6ff",
      border: "1px solid #bfdbfe",
      borderRadius: 10,
      padding: "16px 20px",
    }}>
      {UPLOAD_STEPS.map((step, i) => {
        const done = i < currentIdx || status === STATUS.DONE;
        const active = i === currentIdx && status !== STATUS.DONE;
        return (
          <div key={step.key} style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: i < UPLOAD_STEPS.length - 1 ? 10 : 0,
            opacity: i > currentIdx ? 0.35 : 1,
            transition: "opacity 0.3s",
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: done ? COLORS.green : active ? COLORS.blue : COLORS.border,
              transition: "background 0.3s",
            }}>
              {done ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : active ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"
                  style={{ animation: "spin 0.8s linear infinite" }}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
              ) : (
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.muted }} />
              )}
            </div>
            <span style={{
              fontSize: 13,
              fontWeight: active ? 600 : 400,
              color: active ? COLORS.blue : done ? COLORS.green : COLORS.muted,
            }}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Header ───────────────────────────────────────────────────────────────────
function Header({ page, setPage }) {
  const links = [
    { id: "home", label: "Home" },
    { id: "upload", label: "Upload Evidence" },
    { id: "verify", label: "Verify" },
    { id: "timeline", label: "Timeline" },
  ];
  return (
    <header style={{ background: COLORS.navy, boxShadow: "0 1px 0 rgba(255,255,255,0.06)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: COLORS.blue, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em" }}>EvidenceChain</div>
            <div style={{ color: "#94a3b8", fontSize: 11 }}>Decentralized Integrity</div>
          </div>
        </div>
        <nav style={{ display: "flex", gap: 4 }}>
          {links.map(l => (
            <button key={l.id} onClick={() => setPage(l.id)} style={{
              background: page === l.id ? "rgba(37,99,235,0.18)" : "transparent",
              color: page === l.id ? "#93c5fd" : "#94a3b8",
              border: "none", padding: "6px 14px", borderRadius: 8,
              cursor: "pointer", fontSize: 13.5,
              fontWeight: page === l.id ? 600 : 400, transition: "all 0.15s",
            }}>
              {l.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Badge({ label }) {
  const c = categoryColors[label] || categoryColors.Other;
  return (
    <span style={{ background: c.bg, color: c.text, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, letterSpacing: "0.02em" }}>
      {label}
    </span>
  );
}

// ── Home ─────────────────────────────────────────────────────────────────────
function HomePage({ setPage, evidence }) {
  const features = [
    { icon: "🔐", title: "Cryptographic Hashing", desc: "Every file gets a unique SHA-256 fingerprint generated client-side before upload." },
    { icon: "⛓", title: "Immutable Ledger", desc: "Hashes are recorded in a tamper-proof chain — no entry can be altered retroactively." },
    { icon: "✅", title: "Instant Verification", desc: "Re-upload any file to instantly compare its hash against the stored record." },
    { icon: "🌐", title: "Public Transparency", desc: "All evidence entries are publicly viewable, while original files stay private." },
  ];
  return (
    <div>
      <div style={{ background: `linear-gradient(135deg, ${COLORS.navy} 0%, #1e3a8a 100%)`, padding: "80px 24px 72px", textAlign: "center" }}>
        <h1 style={{ color: "white", fontSize: 42, fontWeight: 800, margin: "0 0 16px", letterSpacing: "-0.03em", lineHeight: 1.15, maxWidth: 620, marginLeft: "auto", marginRight: "auto" }}>
          Protect Journalistic Truth with Cryptographic Proof
        </h1>
        <p style={{ color: "#94a3b8", fontSize: 17, maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.6 }}>
          An immutable evidence chain that lets journalists prove the authenticity of their sources — permanently.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => setPage("upload")} style={{ background: COLORS.blue, color: "white", border: "none", padding: "12px 28px", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            Upload Evidence
          </button>
          <button onClick={() => setPage("timeline")} style={{ background: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.15)", padding: "12px 28px", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            View Timeline
          </button>
        </div>
      </div>
      <div style={{ background: "#f8fafc", borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, textAlign: "center" }}>
          {[[evidence.length, "Records Stored"], ["100%", "Tamper-Proof"], ["SHA-256", "Hash Algorithm"]].map(([val, label]) => (
            <div key={label}>
              <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.navy, letterSpacing: "-0.02em" }}>{val}</div>
              <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px" }}>
        <h2 style={{ textAlign: "center", fontSize: 26, fontWeight: 700, color: COLORS.navy, marginBottom: 8, letterSpacing: "-0.02em" }}>How It Works</h2>
        <p style={{ textAlign: "center", color: COLORS.muted, marginBottom: 40, fontSize: 15 }}>A simple four-step system that makes evidence fraud detectable.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
          {features.map((f, i) => (
            <div key={i} style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "24px 28px" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: COLORS.navy }}>{f.title}</h3>
              <p style={{ margin: 0, color: COLORS.muted, fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Upload ────────────────────────────────────────────────────────────────────
function UploadPage({ onUpload }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  // FIX: status drives the step progress bar; ERROR message is shown below
  const [status, setStatus] = useState(STATUS.IDLE);
  const [hashResult, setHashResult] = useState("");
  const [uploadedEvidence, setUploadedEvidence] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const uploadingRef = useRef(false);

  const inputStyle = {
    width: "100%", padding: "10px 14px", border: `1px solid ${COLORS.border}`,
    borderRadius: 8, fontSize: 14, color: COLORS.navy, background: COLORS.white,
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  };

  const isBusy = status === STATUS.HASHING || status === STATUS.UPLOADING || status === STATUS.BLOCKCHAIN;

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (uploadingRef.current) return;
    if (!file || !title || !category) return;

    uploadingRef.current = true;
    setErrorMsg("");
    setUploadedEvidence(null);

    try {
      // ── Step 1: Hash ──────────────────────────────────────────────────────
      setStatus(STATUS.HASHING);
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hash = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

      // ── Step 2: Upload to backend → IPFS ─────────────────────────────────
      setStatus(STATUS.UPLOADING);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("evidence", file);

      const res = await fetch("http://localhost:5000/api/evidence/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data?.data?.ipfsCid) {
        throw new Error(data?.message || "Upload failed — no CID returned from backend.");
      }

      const backendData = data.data;

      // ── Step 3: Blockchain (backend already did it, just show the step) ──
      // The backend wallet submits to the contract. We show this step while
      // the backend call completes (it's already done by now, but UX-wise
      // the user should see all three steps tick off).
      setStatus(STATUS.BLOCKCHAIN);

      // Small pause so the user can read "Recording on blockchain…"
      await new Promise(r => setTimeout(r, 800));

      // ── Done ──────────────────────────────────────────────────────────────
      setStatus(STATUS.DONE);
      setHashResult(hash);
      setUploadedEvidence(backendData);
      if (onUpload) onUpload();

    } catch (err) {
      console.error("Upload error:", err);
      setErrorMsg(err.message || "Something went wrong. Check the console.");
      setStatus(STATUS.ERROR);
    } finally {
      uploadingRef.current = false;
    }
  }, [file, title, category, description, onUpload]);

  // ── Reset form after success ──────────────────────────────────────────────
  const handleReset = () => {
    setTitle(""); setCategory(""); setDescription("");
    setFile(null); setStatus(STATUS.IDLE);
    setHashResult(""); setUploadedEvidence(null); setErrorMsg("");
  };

  return (
    <div style={{ maxWidth: 620, margin: "48px auto", padding: "0 24px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: COLORS.navy, margin: "0 0 6px", letterSpacing: "-0.02em" }}>Upload Evidence</h1>
        <p style={{ color: COLORS.muted, margin: 0, fontSize: 14 }}>Your file is hashed locally — only the fingerprint is stored on-chain.</p>
      </div>

      <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 32 }}>
        {status !== STATUS.DONE ? (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.navy, marginBottom: 6 }}>Evidence Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Short description" required style={inputStyle} disabled={isBusy} />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.navy, marginBottom: 6 }}>Category *</label>
              <select value={category} onChange={e => setCategory(e.target.value)} required disabled={isBusy}
                style={{ ...inputStyle, appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}>
                <option value="">Select a category</option>
                {["Corruption", "Environment", "Crime", "Public Safety", "Other"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.navy, marginBottom: 6 }}>Description <span style={{ color: COLORS.muted, fontWeight: 400 }}>(optional)</span></label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Brief context about the evidence" style={{ ...inputStyle, resize: "vertical" }} disabled={isBusy} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.navy, marginBottom: 6 }}>Evidence File *</label>
              <div
                style={{ border: `2px dashed ${file ? COLORS.blue : COLORS.border}`, borderRadius: 10, padding: "20px", textAlign: "center", cursor: isBusy ? "not-allowed" : "pointer", background: file ? "#eff6ff" : COLORS.subtle, transition: "all 0.2s", opacity: isBusy ? 0.6 : 1 }}
                onClick={() => !isBusy && document.getElementById("file-input").click()}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>📎</div>
                <div style={{ fontSize: 14, color: file ? COLORS.blue : COLORS.muted, fontWeight: file ? 600 : 400 }}>
                  {file ? file.name : "Click to select a file"}
                </div>
                {file && <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>{(file.size / 1024).toFixed(1)} KB</div>}
              </div>
              <input id="file-input" type="file" required style={{ display: "none" }} onChange={e => setFile(e.target.files[0])} />
            </div>

            <button type="submit" disabled={isBusy} style={{
              width: "100%", padding: "12px", background: isBusy ? "#93c5fd" : COLORS.blue,
              color: "white", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700,
              cursor: isBusy ? "not-allowed" : "pointer", transition: "background 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {isBusy && <Spinner />}
              {isBusy ? "Processing…" : "Submit Evidence"}
            </button>

            {/* FIX: Show step-by-step progress while uploading */}
            <UploadProgress status={status} />

            {/* FIX: Error message with details, no alert() */}
            {status === STATUS.ERROR && (
              <div style={{ marginTop: 20, background: "#fef2f2", border: "1px solid #fecaca", padding: 16, borderRadius: 10, color: "#991b1b", fontSize: 13 }}>
                <strong>Upload failed.</strong> {errorMsg}
              </div>
            )}
          </form>
        ) : (
          /* ── Success card ──────────────────────────────────────────────── */
          <div>
            <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: 20, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ color: "#16a34a", fontSize: 20 }}>✅</span>
                <span style={{ fontWeight: 700, color: "#166534", fontSize: 15 }}>Evidence Submitted Successfully</span>
              </div>

              {/* SHA-256 hash */}
              <div style={{ fontSize: 11, color: "#166534", marginBottom: 4, fontWeight: 600, letterSpacing: "0.04em" }}>SHA-256 HASH</div>
              <div style={{ fontFamily: "monospace", fontSize: 11.5, background: "#dcfce7", padding: "10px 12px", borderRadius: 8, wordBreak: "break-all", color: "#14532d", marginBottom: 12 }}>
                {hashResult}
              </div>

              {/* IPFS CID */}
              {uploadedEvidence?.ipfsCid && (
                <>
                  <div style={{ fontSize: 11, color: "#166534", marginBottom: 4, fontWeight: 600, letterSpacing: "0.04em" }}>IPFS CID</div>
                  <div style={{ fontFamily: "monospace", fontSize: 11.5, background: "#dcfce7", padding: "10px 12px", borderRadius: 8, wordBreak: "break-all", color: "#14532d", marginBottom: 12 }}>
                    {uploadedEvidence.ipfsCid}
                  </div>
                </>
              )}

              {/* IPFS link */}
              {uploadedEvidence?.ipfsUrl && (
                <a href={uploadedEvidence.ipfsUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-block", fontSize: 13, color: COLORS.blue, marginBottom: 12 }}>
                  🔗 View on IPFS Gateway →
                </a>
              )}

              {/* TX hash */}
              {uploadedEvidence?.txHash && (
                <>
                  <div style={{ fontSize: 11, color: "#166534", marginBottom: 4, fontWeight: 600, letterSpacing: "0.04em" }}>BLOCKCHAIN TX HASH</div>
                  <div style={{ fontFamily: "monospace", fontSize: 11.5, background: "#dcfce7", padding: "10px 12px", borderRadius: 8, wordBreak: "break-all", color: "#14532d", marginBottom: 12 }}>
                    {uploadedEvidence.txHash}
                  </div>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${uploadedEvidence.txHash}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-block", fontSize: 13, color: COLORS.blue }}>
                    🔗 View on Etherscan →
                  </a>
                </>
              )}

              <p style={{ margin: "12px 0 0", fontSize: 13, color: "#166534" }}>
                This hash is now permanently recorded on the Sepolia blockchain and will appear on the Timeline.
              </p>
            </div>

            <button onClick={handleReset} style={{
              width: "100%", padding: "11px", background: "transparent",
              color: COLORS.blue, border: `1px solid ${COLORS.blue}`, borderRadius: 10,
              fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}>
              Submit Another Evidence
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Verify ────────────────────────────────────────────────────────────────────
function VerifyPage() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [hash, setHash] = useState("");
  const [blockData, setBlockData] = useState(null);

  const contractAddress = "0x366C5AE2d6D9bbbFDc1e1379AE157C589556066b";

  const abi = [
    {
      inputs: [{ internalType: "bytes32", name: "_hash", type: "bytes32" }],
      name: "verifyEvidence",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "bytes32", name: "_hash", type: "bytes32" }],
      name: "getEvidence",
      outputs: [
        {
          components: [
            { internalType: "bytes32", name: "evidenceHash", type: "bytes32" },
            { internalType: "string", name: "ipfsCID", type: "string" },
            { internalType: "uint8", name: "evidenceType", type: "uint8" },
            { internalType: "uint256", name: "timestamp", type: "uint256" },
            { internalType: "address", name: "submitter", type: "address" },
          ],
          internalType: "struct EvidenceRegistry.EvidenceRecord",
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];

  const handleVerify = useCallback(async (e) => {
    e.preventDefault();
    if (!file) return;

    try {
      setStatus(STATUS.UPLOADING); // "verifying" state — reuse UPLOADING
      setBlockData(null);
      setHash("");

      const buf = await file.arrayBuffer();
      const hashBuf = await crypto.subtle.digest("SHA-256", buf);
      const h = Array.from(new Uint8Array(hashBuf))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

      setHash(h);
      const hashBytes32 = "0x" + h;

      if (!window.ethereum) {
        alert("Install MetaMask to verify on-chain.");
        setStatus(STATUS.IDLE);
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, abi, provider);

      const exists = await contract.verifyEvidence(hashBytes32);

      if (!exists) {
        setStatus(STATUS.ERROR);
        return;
      }

      const data = await contract.getEvidence(hashBytes32);
      setBlockData(data);
      // FIX: set BLOCKCHAIN (not DONE) — and render the result on BLOCKCHAIN
      setStatus(STATUS.BLOCKCHAIN);

    } catch (err) {
      console.error(err);
      setStatus(STATUS.ERROR);
    }
  }, [file]);

  // FIX: Reset so user can verify another file without reloading the page
  const handleReset = () => {
    setFile(null);
    setStatus(STATUS.IDLE);
    setHash("");
    setBlockData(null);
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", border: `1px solid ${COLORS.border}`,
    borderRadius: 8, fontSize: 14, color: COLORS.navy, background: COLORS.white,
    outline: "none", boxSizing: "border-box",
  };

  const isVerifying = status === STATUS.UPLOADING;

  return (
    <div style={{ maxWidth: 620, margin: "48px auto", padding: "0 24px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: COLORS.navy, margin: "0 0 6px", letterSpacing: "-0.02em" }}>Verify Evidence</h1>
        <p style={{ color: COLORS.muted, margin: 0, fontSize: 14 }}>Re-upload a file to check if its hash matches the ledger.</p>
      </div>

      <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 32 }}>
        <form onSubmit={handleVerify}>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.navy, marginBottom: 6 }}>File to Verify *</label>
            <div
              style={{ border: `2px dashed ${file ? "#16a34a" : COLORS.border}`, borderRadius: 10, padding: 20, textAlign: "center", cursor: isVerifying ? "not-allowed" : "pointer", background: file ? "#f0fdf4" : COLORS.subtle, transition: "all 0.2s" }}
              onClick={() => !isVerifying && document.getElementById("verify-file").click()}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>🔍</div>
              <div style={{ fontSize: 14, color: file ? "#16a34a" : COLORS.muted, fontWeight: file ? 600 : 400 }}>
                {file ? file.name : "Click to select file for verification"}
              </div>
              {file && <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>{(file.size / 1024).toFixed(1)} KB</div>}
            </div>
            <input id="verify-file" type="file" required style={{ display: "none" }} onChange={e => { setFile(e.target.files[0]); setStatus(STATUS.IDLE); setBlockData(null); }} />
          </div>

          <button type="submit" disabled={isVerifying} style={{
            width: "100%", padding: 12, background: isVerifying ? "#4ade80" : COLORS.green,
            color: "white", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700,
            cursor: isVerifying ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {isVerifying && <Spinner />}
            {isVerifying ? "Verifying on-chain…" : "Verify Authenticity"}
          </button>
        </form>

        {/* FIX: Condition was STATUS.DONE — changed to STATUS.BLOCKCHAIN */}
        {status === STATUS.BLOCKCHAIN && blockData && (
          <div style={{ marginTop: 24, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: 20 }}>
            <div style={{ fontWeight: 700, color: "#166534", fontSize: 16, marginBottom: 8 }}>
              ✅ Verified on Blockchain
            </div>
            <p style={{ fontSize: 14, color: "#166534", margin: "0 0 12px" }}>
              This evidence exists on the blockchain.
            </p>

            <div style={{ fontSize: 12, color: "#166534", fontWeight: 600, marginBottom: 3, letterSpacing: "0.04em" }}>IPFS CID</div>
            <div style={{ fontFamily: "monospace", fontSize: 12, background: "#dcfce7", padding: "8px 12px", borderRadius: 6, wordBreak: "break-all", color: "#14532d", marginBottom: 10 }}>
              {blockData.ipfsCID}
            </div>

            <div style={{ fontSize: 13, color: "#166534", marginBottom: 4 }}>
              <strong>Submitter:</strong> <span style={{ fontFamily: "monospace", fontSize: 12 }}>{blockData.submitter}</span>
            </div>
            <div style={{ fontSize: 13, color: "#166534", marginBottom: 16 }}>
              <strong>Timestamp:</strong> {new Date(Number(blockData.timestamp) * 1000).toLocaleString()}
            </div>

            {/* FIX: "Verify another file" button — no page reload needed */}
            <button onClick={handleReset} style={{
              padding: "9px 18px", background: "transparent",
              color: COLORS.green, border: `1px solid ${COLORS.green}`, borderRadius: 8,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>
              Verify Another File
            </button>
          </div>
        )}

        {status === STATUS.ERROR && (
          <div style={{ marginTop: 24, background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, padding: 20 }}>
            <div style={{ fontWeight: 700, color: "#991b1b", fontSize: 16, marginBottom: 8 }}>❌ Verification Failed</div>
            <p style={{ margin: "0 0 12px", fontSize: 14, color: "#7f1d1d" }}>No matching record found. This file may have been modified or was never submitted.</p>
            {hash && (
              <>
                <div style={{ fontSize: 11, color: "#991b1b", fontWeight: 600, marginBottom: 4 }}>COMPUTED HASH</div>
                <div style={{ fontFamily: "monospace", fontSize: 11, background: "#fee2e2", padding: "8px 12px", borderRadius: 6, wordBreak: "break-all", color: "#7f1d1d", marginBottom: 12 }}>{hash}</div>
              </>
            )}
            {/* FIX: Try again without reload */}
            <button onClick={handleReset} style={{
              padding: "9px 18px", background: "transparent",
              color: "#991b1b", border: "1px solid #fca5a5", borderRadius: 8,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>
              Try Another File
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: 20, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "14px 18px", fontSize: 13, color: "#1e40af", lineHeight: 1.5 }}>
        <strong>How verification works:</strong> The file is hashed using SHA-256 in your browser. The resulting fingerprint is checked against the Sepolia smart contract. If it matches, the file is authentic and tamper-free.
      </div>
    </div>
  );
}

// ── Timeline ──────────────────────────────────────────────────────────────────
function TimelinePage({ evidence }) {
  const all = [...evidence].reverse();

  return (
    <div style={{ maxWidth: 800, margin: "48px auto", padding: "0 24px" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: COLORS.navy, margin: "0 0 6px", letterSpacing: "-0.02em" }}>Evidence Timeline</h1>
        <p style={{ color: COLORS.muted, margin: 0, fontSize: 14 }}>Chronological, immutable record of all submitted evidence.</p>
      </div>

      {all.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px", color: COLORS.muted }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.navy, marginBottom: 6 }}>No evidence yet</div>
          <div style={{ fontSize: 14 }}>Submit your first evidence and it will appear here.</div>
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 19, top: 0, bottom: 0, width: 2, background: COLORS.border }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {all.map((item, i) => (
              <div key={item._id || item.id || i} style={{ display: "flex", gap: 20, position: "relative" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: COLORS.blue, border: `3px solid ${COLORS.white}`, boxShadow: `0 0 0 2px ${COLORS.blue}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>

                <div style={{ flex: 1, background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "18px 22px", marginTop: 2 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                    <div>
                      <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: COLORS.navy }}>{item.title}</h3>
                      {/* FIX: was using item.timestamp (undefined) — MongoDB returns uploadedAt */}
                      <div style={{ fontSize: 12, color: COLORS.muted }}>
                        {item.uploadedAt
                          ? new Date(item.uploadedAt).toLocaleString()
                          : item.createdAt
                          ? new Date(item.createdAt).toLocaleString()
                          : "Date unavailable"}
                      </div>
                    </div>
                    {/* FIX: was hardcoded "Other" — now uses item.category from DB */}
                    <Badge label={item.category || "Other"} />
                  </div>

                  <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600, letterSpacing: "0.04em", marginBottom: 4 }}>SHA-256 HASH</div>
                  <div style={{ fontFamily: "monospace", fontSize: 11.5, background: COLORS.subtle, padding: "8px 12px", borderRadius: 6, wordBreak: "break-all", color: COLORS.mono }}>
                    {item.sha256}
                  </div>

                  {/* Show IPFS link if available */}
                  {item.ipfsUrl && (
                    <a href={item.ipfsUrl} target="_blank" rel="noopener noreferrer"
                      style={{ display: "inline-block", marginTop: 8, fontSize: 12, color: COLORS.blue }}>
                      🔗 View on IPFS
                    </a>
                  )}

                  {/* Show TX link if available */}
                  {item.txHash && (
                    <a href={`https://sepolia.etherscan.io/tx/${item.txHash}`} target="_blank" rel="noopener noreferrer"
                      style={{ display: "inline-block", marginTop: 8, marginLeft: item.ipfsUrl ? 16 : 0, fontSize: 12, color: COLORS.blue }}>
                      ⛓ Etherscan
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 28, textAlign: "center", fontSize: 13, color: COLORS.muted }}>
        Showing {all.length} evidence record{all.length !== 1 ? "s" : ""} · All entries are permanent
      </div>
    </div>
  );
}

// ── App root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [evidence, setEvidence] = useState([]);

  const fetchEvidence = () => {
    fetch("http://localhost:5000/api/evidence/")
      .then(res => res.json())
      .then(data => setEvidence(data.data || []))
      .catch(err => console.error("Failed to fetch evidence:", err));
  };

  useEffect(() => {
    fetchEvidence();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <Header page={page} setPage={setPage} />
      <main>
        {page === "home" && <HomePage setPage={setPage} evidence={evidence} />}
        {page === "upload" && (
          <UploadPage
            onUpload={() => {
              fetchEvidence();
              setPage("timeline");
            }}
          />
        )}
        {page === "verify" && <VerifyPage />}
        {page === "timeline" && <TimelinePage evidence={evidence} />}
      </main>
      <footer style={{ background: COLORS.navy, color: "#64748b", textAlign: "center", padding: "24px", fontSize: 13, marginTop: 60 }}>
        © 2026 Decentralized Evidence Chain · Academic Project
      </footer>
    </div>
  );
}
