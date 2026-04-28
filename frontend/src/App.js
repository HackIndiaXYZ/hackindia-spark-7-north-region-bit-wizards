import { useState, useCallback, useEffect, useRef} from "react";
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
  ERROR: "error"
};

const sampleEvidence = [
  {
    id: 1,
    title: "Illegal Dumping Near River",
    category: "Environment",
    date: "12 Feb 2026",
    hash: "9f2c1a4e8d7b0c6a5e9f1d2b3c4a8e7d6f9a1b2c3d4e5f6a7b8c9d0e1f2",
    uploader: "Anon Journalist",
  },
  {
    id: 2,
    title: "Public Office Bribery Proof",
    category: "Corruption",
    date: "10 Feb 2026",
    hash: "a3d9f1e2c4b5a67890dfe123456789abcdeffedcba0987654321fedcba9876",
    uploader: "Verified Source",
  },
  {
    id: 3,
    title: "Unsafe Construction Site",
    category: "Public Safety",
    date: "08 Feb 2026",
    hash: "c1b2a3d4e5f6978877665544332211ffeeddccbbaa99887766554433221100",
    uploader: "Field Reporter",
  },
];

const categoryColors = {
  Environment: { bg: "#d1fae5", text: "#065f46" },
  Corruption: { bg: "#fee2e2", text: "#7f1d1d" },
  "Public Safety": { bg: "#dbeafe", text: "#1e3a8a" },
  Crime: { bg: "#fce7f3", text: "#831843" },
  Other: { bg: "#f3f4f6", text: "#374151" },
};

function Header({ page, setPage }) {
  const [menuOpen, setMenuOpen] = useState(false);
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
            <button
              key={l.id}
              onClick={() => setPage(l.id)}
              style={{
                background: page === l.id ? "rgba(37,99,235,0.18)" : "transparent",
                color: page === l.id ? "#93c5fd" : "#94a3b8",
                border: "none",
                padding: "6px 14px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 13.5,
                fontWeight: page === l.id ? 600 : 400,
                transition: "all 0.15s",
              }}
            >
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

function HomePage({ setPage, evidence }) {
  const features = [
    { icon: "🔐", title: "Cryptographic Hashing", desc: "Every file gets a unique SHA-256 fingerprint generated client-side before upload." },
    { icon: "⛓", title: "Immutable Ledger", desc: "Hashes are recorded in a tamper-proof chain — no entry can be altered retroactively." },
    { icon: "✅", title: "Instant Verification", desc: "Re-upload any file to instantly compare its hash against the stored record." },
    { icon: "🌐", title: "Public Transparency", desc: "All evidence entries are publicly viewable, while original files stay private." },
  ];

  return (
    <div>
      {/* Hero */}
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

      {/* Stats */}
      <div style={{ background: "#f8fafc", borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, textAlign: "center" }}>
          {[
  [evidence.length, "Records Stored"],
  ["100%", "Tamper-Proof"],
  ["SHA-256", "Hash Algorithm"]
]
.map(([val, label]) => (
            <div key={label}>
              <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.navy, letterSpacing: "-0.02em" }}>{val}</div>
              <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px" }}>
        <h2 style={{ textAlign: "center", fontSize: 26, fontWeight: 700, color: COLORS.navy, marginBottom: 8, letterSpacing: "-0.02em" }}>
          How It Works
        </h2>
        <p style={{ textAlign: "center", color: COLORS.muted, marginBottom: 40, fontSize: 15 }}>
          A simple four-step system that makes evidence fraud detectable.
        </p>
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

function UploadPage({ onUpload }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null); // null | "hashing" | "done"
  const [hashResult, setHashResult] = useState("");
  const [uploadedEvidence,setUploadedEvidence]=useState(null);

const [isUploading, setIsUploading] = useState(false);


const uploadingRef = useRef(false);

const contractAddress = "0x366C5AE2d6D9bbbFDc1e1379AE157C589556066b";

const abi = [
  {
    "inputs": [
      { "internalType": "bytes32", "name": "_hash", "type": "bytes32" }
    ],
    "name": "verifyEvidence",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "_hash", "type": "bytes32" }
    ],
    "name": "getEvidence",
    "outputs": [
      {
        "components": [
          { "internalType": "bytes32", "name": "evidenceHash", "type": "bytes32" },
          { "internalType": "string", "name": "ipfsCID", "type": "string" },
          { "internalType": "uint8", "name": "evidenceType", "type": "uint8" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "address", "name": "submitter", "type": "address" }
        ],
        "internalType": "struct EvidenceRegistry.EvidenceRecord",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "_hash", "type": "bytes32" },
      { "internalType": "string", "name": "_ipfsCID", "type": "string" },
      { "internalType": "uint8", "name": "_evidenceType", "type": "uint8" }
    ],
    "name": "submitEvidence",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const handleSubmit = useCallback(async (e) => {

  e.preventDefault();

 if (uploadingRef.current) return;

if (!file || !title || !category) return;

uploadingRef.current = true;
setStatus(STATUS.HASHING);

  try {
     if (!file || !title || !category) return;
    setStatus(STATUS.HASHING);

    // 1. HASH FILE
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);

    const hash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    // const hashBytes32 = "0x" + hash;
    const hashBytes32 = "0x" + hash.padEnd(64, "0");

    // 2. SWITCH NETWORK
    if (!window.ethereum) throw new Error("MetaMask not found");

    // await window.ethereum.request({
    //   method: "wallet_switchEthereumChain",
    //   params: [{ chainId: "0xaa36a7" }]
    // });
    try {
  await window.ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: "0xaa36a7" }]
  });
} catch (switchError) {
  console.log("Network switch failed", switchError);
}

    setStatus(STATUS.UPLOADING);

    // 3. UPLOAD TO BACKEND (GET CID)
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
    const backendData = data?.data;

if (!backendData?.ipfsCid) {
  throw new Error("missing CID from backend");
}

const cid = backendData.ipfsCid;

    setUploadedEvidence(data.data);


    // 4. CONNECT WALLET + CONTRACT
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      contractAddress,
      abi,
      signer
    );

    setStatus(STATUS.DONE);

    // 5. SUBMIT ON CHAIN

    const tx = await contract.submitEvidence(
      hashBytes32,
      cid,
      0
    );

    await tx.wait();

    // 6. DONE
    setStatus(STATUS.DONE);
    if (onUpload) onUpload();
    setHashResult(hash);

    console.log("SUCCESS");
    //uploadingRef.current=false;

  } catch (err) {
    // uploadingRef.current=false;
    // console.error(err);
    setStatus(STATUS.ERROR);
    alert("Upload failed");
  }
  finally{
    uploadingRef.current=false;
  }
}, [file, title, category, description]);

  const inputStyle = {
    width: "100%", padding: "10px 14px", border: `1px solid ${COLORS.border}`,
    borderRadius: 8, fontSize: 14, color: COLORS.navy, background: COLORS.white,
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  };

  return (
    <div style={{ maxWidth: 620, margin: "48px auto", padding: "0 24px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: COLORS.navy, margin: "0 0 6px", letterSpacing: "-0.02em" }}>Upload Evidence</h1>
        <p style={{ color: COLORS.muted, margin: 0, fontSize: 14 }}>Your file is hashed locally — only the fingerprint is stored.</p>
      </div>

      <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 32 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.navy, marginBottom: 6 }}>Evidence Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Short description" required style={inputStyle} />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.navy, marginBottom: 6 }}>Category *</label>
            <select value={category} onChange={e => setCategory(e.target.value)} required style={{ ...inputStyle, appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}>
              <option value="">Select a category</option>
              {["Corruption", "Environment", "Crime", "Public Safety", "Other"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.navy, marginBottom: 6 }}>Description <span style={{ color: COLORS.muted, fontWeight: 400 }}>(optional)</span></label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Brief context about the evidence" style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.navy, marginBottom: 6 }}>Evidence File *</label>
            <div style={{ border: `2px dashed ${file ? COLORS.blue : COLORS.border}`, borderRadius: 10, padding: "20px", textAlign: "center", cursor: "pointer", background: file ? "#eff6ff" : COLORS.subtle, transition: "all 0.2s" }}
              onClick={() => document.getElementById("file-input").click()}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>📎</div>
              <div style={{ fontSize: 14, color: file ? COLORS.blue : COLORS.muted, fontWeight: file ? 600 : 400 }}>
                {file ? file.name : "Click to select a file"}
              </div>
              {file && <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>{(file.size / 1024).toFixed(1)} KB</div>}
            </div>
            <input id="file-input" type="file" required style={{ display: "none" }} onChange={e => setFile(e.target.files[0])} />
          </div>

          <button type="submit" disabled={status === STATUS.HASHING ||status === STATUS.UPLOADING ||status === STATUS.BLOCKCHAIN } style={{
            width: "100%", padding: "12px", background: status === STATUS.HASHING ? "#93c5fd" : COLORS.blue,
            color: "white", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700,
            cursor: status === STATUS.HASHING ? "not-allowed" : "pointer", transition: "background 0.2s",
          }}>
            {status === STATUS.HASHING ? "Generating hash…" : "Submit Evidence"}
          </button>
        </form>

        {status === STATUS.DONE && (
          <div style={{ marginTop: 24, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ color: "#16a34a", fontSize: 18 }}>✅</span>
              <span style={{ fontWeight: 700, color: "#166534", fontSize: 15 }}>Evidence Submitted Successfully</span>
            </div>
            <div style={{ fontSize: 12, color: "#166534", marginBottom: 6, fontWeight: 600 }}>SHA-256 HASH</div>
            <div style={{ fontFamily: "monospace", fontSize: 12, background: "#dcfce7", padding: "10px 12px", borderRadius: 8, wordBreak: "break-all", color: "#14532d" }}>
              {hashResult}
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 13, color: "#166534" }}>
              This hash is now recorded in the immutable ledger and will appear on the Timeline.
            </p>
          </div>
        )}
        {status === STATUS.ERROR && (
  <div style={{
    marginTop: 24,
    background: "#fef2f2",
    border: "1px solid #fecaca",
    padding: 16,
    borderRadius: 10,
    color: "#991b1b"
  }}>
    Upload failed. Try again.
  </div>
)}
      </div>
    </div>
  );
}

function VerifyPage() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [hash, setHash] = useState("");
  const [blockData, setBlockData] = useState(null);

  const contractAddress = "0x366C5AE2d6D9bbbFDc1e1379AE157C589556066b";

 const abi = [
  {
    "inputs": [
      { "internalType": "bytes32", "name": "_hash", "type": "bytes32" }
    ],
    "name": "verifyEvidence",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "_hash", "type": "bytes32" }
    ],
    "name": "getEvidence",
    "outputs": [
      {
        "components": [
          { "internalType": "bytes32", "name": "evidenceHash", "type": "bytes32" },
          { "internalType": "string", "name": "ipfsCID", "type": "string" },
          { "internalType": "uint8", "name": "evidenceType", "type": "uint8" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "address", "name": "submitter", "type": "address" }
        ],
        "internalType": "struct EvidenceRegistry.EvidenceRecord",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "_hash", "type": "bytes32" },
      { "internalType": "string", "name": "_ipfsCID", "type": "string" },
      { "internalType": "uint8", "name": "_evidenceType", "type": "uint8" }
    ],
    "name": "submitEvidence",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const handleVerify = useCallback(async (e) => {
  e.preventDefault();

  if (!file) return;

  try {
    setStatus(STATUS.UPLOADING);

    const buf = await file.arrayBuffer();
    const hashBuf = await crypto.subtle.digest("SHA-256", buf);

    const h = Array.from(new Uint8Array(hashBuf))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    const hashBytes32 = "0x" + h;

    // CHECK METAMASK
    if (!window.ethereum) {
      alert("Install MetaMask");
      return;
    }

    // PROVIDER (FIXED)
    const provider = new ethers.BrowserProvider(window.ethereum);

    const contract = new ethers.Contract(
      contractAddress,
      abi,
      provider
    );

    // 1. VERIFY
    const exists = await contract.verifyEvidence(hashBytes32);

    if (!exists) {
      setStatus(STATUS.ERROR);
      return;
    }

    // 2. GET DATA
    const data = await contract.getEvidence(hashBytes32);

    setBlockData(data);
    setStatus(STATUS.BLOCKCHAIN);

  } catch (err) {
    console.error(err);
    setStatus(STATUS.ERROR);
  }
}, [file]);

//---

  const inputStyle = { width: "100%", padding: "10px 14px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14, color: COLORS.navy, background: COLORS.white, outline: "none", boxSizing: "border-box" };

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
              style={{ border: `2px dashed ${file ? "#16a34a" : COLORS.border}`, borderRadius: 10, padding: 20, textAlign: "center", cursor: "pointer", background: file ? "#f0fdf4" : COLORS.subtle, transition: "all 0.2s" }}
              onClick={() => document.getElementById("verify-file").click()}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>🔍</div>
              <div style={{ fontSize: 14, color: file ? "#16a34a" : COLORS.muted, fontWeight: file ? 600 : 400 }}>
                {file ? file.name : "Click to select file for verification"}
              </div>
            </div>
            <input id="verify-file" type="file" required style={{ display: "none" }} onChange={e => { setFile(e.target.files[0]); setStatus(null); }} />
          </div>

          <button type="submit" disabled={status === STATUS.UPLOADING} style={{
            width: "100%", padding: 12, background: status === "verifying" ? "#4ade80" : COLORS.green,
            color: "white", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700,
            cursor: status === STATUS.UPLOADING ? "not-allowed" : "pointer",
          }}>
            {status === STATUS.UPLOADING ? "Verifying…" : "Verify Authenticity"}
          </button>
        </form>

        {status === STATUS.DONE && blockData && (
  <div style={{ marginTop: 24, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: 20 }}>
    
    <div style={{ fontWeight: 700, color: "#166534", fontSize: 16, marginBottom: 8 }}>
      ✅ Verified on Blockchain
    </div>

    <p style={{ fontSize: 14, color: "#166534" }}>
      This evidence exists on the blockchain.
    </p>

    <div style={{ marginTop: 10, fontSize: 13 }}>
      <strong>IPFS CID:</strong> {blockData.ipfsCID}
    </div>

    <div style={{ fontSize: 13 }}>
      <strong>Submitter:</strong> {blockData.submitter}
    </div>

    <div style={{ fontSize: 13 }}>
      <strong>Timestamp:</strong> {new Date(Number(blockData.timestamp) * 1000).toLocaleString()}
    </div>

  </div>
)}


        {status === STATUS.ERROR && (
          <div style={{ marginTop: 24, background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, padding: 20 }}>
            <div style={{ fontWeight: 700, color: "#991b1b", fontSize: 16, marginBottom: 8 }}>❌ Verification Failed</div>
            <p style={{ margin: "0 0 12px", fontSize: 14, color: "#7f1d1d" }}>No matching record found. This file may have been modified or was never submitted.</p>
            <div style={{ fontSize: 11, color: "#991b1b", fontWeight: 600, marginBottom: 4 }}>COMPUTED HASH</div>
            <div style={{ fontFamily: "monospace", fontSize: 11, background: "#fee2e2", padding: "8px 12px", borderRadius: 6, wordBreak: "break-all", color: "#7f1d1d" }}>{hash}</div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 20, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "14px 18px", fontSize: 13, color: "#1e40af", lineHeight: 1.5 }}>
        <strong>How verification works:</strong> The file is hashed using SHA-256 in your browser. The resulting fingerprint is compared against all registered hashes. If they match, the file is authentic.
      </div>
    </div>
  );
}

function TimelinePage({ evidence }) {
  const all = [...evidence].reverse();

  return (
    <div style={{ maxWidth: 800, margin: "48px auto", padding: "0 24px" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: COLORS.navy, margin: "0 0 6px", letterSpacing: "-0.02em" }}>Evidence Timeline</h1>
        <p style={{ color: COLORS.muted, margin: 0, fontSize: 14 }}>Chronological, immutable record of all submitted evidence.</p>
      </div>

      <div style={{ position: "relative" }}>
        {/* vertical line */}
        <div style={{ position: "absolute", left: 19, top: 0, bottom: 0, width: 2, background: COLORS.border }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {all.map((item, i) => (
            <div key={item.id || i} style={{ display: "flex", gap: 20, position: "relative" }}>
              {/* dot */}
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: COLORS.blue, border: `3px solid ${COLORS.white}`, boxShadow: `0 0 0 2px ${COLORS.blue}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>

              {/* card */}
              <div style={{ flex: 1, background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "18px 22px", marginTop: 2 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                  <div>
                    <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: COLORS.navy }}>{item.title}</h3>
                    <div style={{ fontSize: 12, color: COLORS.muted }}>{item.timestamp ? new Date(item.timestamp).toLocaleString() : "No date"}
</div>
                  </div>
                  <Badge label={"Other"} />
                </div>
                <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600, letterSpacing: "0.04em", marginBottom: 4 }}>SHA-256 HASH</div>
                <div style={{ fontFamily: "monospace", fontSize: 11.5, background: COLORS.subtle, padding: "8px 12px", borderRadius: 6, wordBreak: "break-all", color: COLORS.mono }}>
                  {item.sha256}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 28, textAlign: "center", fontSize: 13, color: COLORS.muted }}>
        Showing {all.length} evidence record{all.length !== 1 ? "s" : ""} · All entries are permanent
      </div>
    </div>
  );
}

//Change:
export default function App() {
  const [page, setPage] = useState("home");
  const [evidence, setEvidence] = useState([]);

  // ✅ Fetch data from backend when app loads
  useEffect(() => {
    fetch("http://localhost:5000/api/evidence/")
      .then(res => res.json())
      .then(data => {
        console.log("Fetched:", data);
        setEvidence(data.data || []);
      })
      .catch(err => console.error(err));
  }, []);

//Change:
const handleUpload = () => {
  fetch("http://localhost:5000/api/evidence/")
    .then(res => res.json())
    .then(data => setEvidence(data.data || []))
    .catch(err => console.error(err));
};
//---

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <Header page={page} setPage={setPage} />

      <main>
        {page === "home" && <HomePage setPage={setPage} evidence={evidence} />}

        {page === "upload" && (
  <UploadPage 
    onUpload={() => { 
      handleUpload();   // no "e"
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
//---
