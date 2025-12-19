"use client";
import { useState } from "react";
import {
  useSignAndExecuteTransaction,
  useCurrentAccount,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import {
  ArrowRight,
  Lock,
  Loader2,
  Copy,
  Check,
  FileText,
  ShieldCheck,
  Clock,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Dropzone from "../components/Dropzone";

// --- CONFIGURATION ---
const MOCK_MODE = false; // Set to true to skip Wallet interaction
const REAL_PACKAGE_ID =
  "0xde8566572a488eb1cb87145ef1333e99981b711192d92cf9e84e85626bbcee47";
// ---------------------

export default function Home() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [objectId, setObjectId] = useState("");
  const [copied, setCopied] = useState(false);

  // 1. Hash Document
  const handleHash = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/hash", { method: "POST", body: formData });
      const data = await res.json();
      setHash(data.hash);
      setStep(2);
    } catch (e) {
      alert("Hashing failed.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Create Proof on Sui
  const createProof = () => {
    if (!account && !MOCK_MODE)
      return alert("Please connect your wallet first.");
    setLoading(true);

    if (MOCK_MODE) {
      // --- MOCK PATH ---
      setTimeout(() => {
        setObjectId("0xMOCK_ID_" + Date.now().toString(16));
        setStep(3);
        setLoading(false);
      }, 1500);
    } else {
      // --- REAL PATH ---
      try {
        const tx = new Transaction();
        tx.moveCall({
          target: `${REAL_PACKAGE_ID}::suiproof::create_proof`,
          arguments: [
            tx.pure.vector("u8", Array.from(Buffer.from(hash, "hex"))),
            tx.pure.u64(86400), // 24 hours (seconds)
          ],
        });

        signAndExecute(
          { transaction: tx },
          {
            onSuccess: (result) => {
              setObjectId(result.digest);
              setStep(3);
              setLoading(false);
            },
            onError: (err) => {
              console.error(err);
              alert("Transaction Failed. See console.");
              setLoading(false);
            },
          }
        );
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    }
  };

  const verifyLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/verify/${objectId}`
      : "";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(verifyLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-sui-100">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* HERO */}
        <div className="text-center mb-16 space-y-4 animate-fade-in">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
            Verifiable documents, <br />
            <span className="text-sui-600">stored nowhere.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            {MOCK_MODE && (
              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded font-bold mr-2">
                MOCK MODE
              </span>
            )}
            Create a self-destructing proof of existence on the Sui Blockchain.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* APP CARD */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-sui-900/10 border border-slate-100 relative overflow-hidden">
            {loading && (
              <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center backdrop-blur-sm">
                <Loader2 className="animate-spin text-sui-600" size={40} />
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg">1. Upload Document</h3>
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">
                    Private
                  </span>
                </div>
                <Dropzone onFileSelect={setFile} selectedFile={file} />
                <button
                  onClick={handleHash}
                  disabled={!file}
                  className="w-full py-4 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  Generate Hash <ArrowRight size={18} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg text-sm font-medium">
                  <Lock size={16} /> File hashed locally. Original discarded.
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    SHA-256 Hash
                  </label>
                  <div className="mt-1 p-4 bg-slate-50 rounded-xl font-mono text-xs text-slate-600 break-all border border-slate-200">
                    {hash}
                  </div>
                </div>
                <button
                  onClick={createProof}
                  className="w-full py-4 rounded-xl bg-sui-600 text-white font-bold hover:bg-sui-500 transition-all shadow-lg shadow-sui-200"
                >
                  Sign & Mint Proof on Sui
                </button>
                <button
                  onClick={() => setStep(1)}
                  className="w-full py-2 text-sm text-slate-400 hover:text-slate-600"
                >
                  Back
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="text-center space-y-6 animate-fade-in py-6">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={32} strokeWidth={3} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Proof Created!
                </h3>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left">
                  <p className="text-xs text-slate-400 mb-2 uppercase font-bold">
                    Verification Link
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm text-sui-600 truncate">
                      {verifyLink}
                    </code>
                    <button
                      onClick={copyToClipboard}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setStep(1);
                    setFile(null);
                  }}
                  className="text-sui-600 font-medium hover:underline"
                >
                  Create another proof
                </button>
              </div>
            )}
          </div>

          {/* FEATURES */}
          <div className="hidden md:block pt-4 space-y-8 pl-4">
            {[
              {
                icon: FileText,
                title: "Local Hashing",
                desc: "Your document never leaves your browser until it is hashed.",
              },
              {
                icon: ShieldCheck,
                title: "On-Chain Ownership",
                desc: "The proof is a Sui Object owned by you, not a contract log.",
              },
              {
                icon: Clock,
                title: "Auto-Expiry",
                desc: "Proofs expire automatically, enforcing the right to be forgotten.",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-sui-50 flex items-center justify-center text-sui-600 shadow-sm shrink-0">
                  <item.icon size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{item.title}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed mt-1">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
