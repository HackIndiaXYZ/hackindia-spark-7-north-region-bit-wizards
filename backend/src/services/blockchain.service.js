const { ethers } = require("ethers");

const CONTRACT_ADDRESS = "0x366C5AE2d6D9bbbFDc1e1379AE157C589556066b";

const ABI = [
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
          { internalType: "bytes32",  name: "evidenceHash", type: "bytes32" },
          { internalType: "string",   name: "ipfsCID",      type: "string"  },
          { internalType: "uint8",    name: "evidenceType", type: "uint8"   },
          { internalType: "uint256",  name: "timestamp",    type: "uint256" },
          { internalType: "address",  name: "submitter",    type: "address" },
        ],
        internalType: "struct EvidenceRegistry.EvidenceRecord",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "_hash",         type: "bytes32" },
      { internalType: "string",  name: "_ipfsCID",      type: "string"  },
      { internalType: "uint8",   name: "_evidenceType", type: "uint8"   },
    ],
    name: "submitEvidence",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet   = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

/**
 * Submits a hashed evidence record to the on-chain registry.
 * @param {string} hash - bytes32 hex string (e.g. "0x" + sha256).
 * @param {string} cid  - IPFS CID string.
 * @param {number} type - Evidence type uint8 (default 0).
 * @returns {Promise<string>} Transaction hash.
 */
const storeOnBlockchain = async (hash, cid, type = 0) => {
  const tx = await contract.submitEvidence(hash, cid, type);
  await tx.wait();
  return tx.hash;
};

module.exports = { storeOnBlockchain };

