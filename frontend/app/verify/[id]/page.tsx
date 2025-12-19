/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useSuiClient } from "@mysten/dapp-kit";
import { useParams } from "next/navigation";
import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  FileSearch,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import Dropzone from "../../../components/Dropzone";
import Navbar from "../../../components/Navbar";

// --- CONFIGURATION ---
const MOCK_MODE = false;
// ---------------------

export default function VerifyPage() {
  const params = useParams();
  const objectId = params.id as string;
  const suiClient = useSuiClient();

  const [onChainHash, setOnChainHash] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "FETCHING" | "IDLE" | "VALID" | "INVALID" | "ERROR"
  >("FETCHING");

  // Fetch Object
  useEffect(() => {
    const fetchObject = async () => {
      if (MOCK_MODE) {
        // Mock Responsessss
        setOnChainHash("MOCK_HASH_123");
        setStatus("IDLE");
        return;
      }

      try {
        const obj = await suiClient.getObject({
          id: objectId,
          options: { showContent: true },
        });

        const content = obj.data?.content;

        if (content && content.dataType === "moveObject") {
          const fields = content.fields as any;
          if (fields.doc_hash) {
            const hexHash = fields.doc_hash
              .map((b: number) => b.toString(16).padStart(2, "0"))
              .join("");
            setOnChainHash(hexHash);
            setStatus("IDLE");
          } else {
            setStatus("ERROR");
          }
        } else {
          setStatus("ERROR");
        }
      } catch (e) {
        console.error(e);
        setStatus("ERROR");
      }
    };

    fetchObject();
  }, [objectId, suiClient]);

  // Verify
  const handleVerify = async () => {
    if (!file) return;
    setStatus("FETCHING");

    await new Promise((r) => setTimeout(r, 1000)); // UI delay

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/hash", { method: "POST", body: formData });
      const { hash } = await res.json();

      // In MOCK_MODE, we accept any file if the mock hash is set
      if (MOCK_MODE) {
        setStatus("VALID");
        return;
      }

      if (hash === onChainHash) {
        setStatus("VALID");
      } else {
        setStatus("INVALID");
      }
    } catch (e) {
      setStatus("ERROR");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      <div className="max-w-xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-6 text-sm font-medium"
        >
          <ArrowLeft size={16} /> Back to Upload
        </Link>

        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200 text-center animate-fade-in">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-mono mb-4">
              Object: {objectId.slice(0, 6)}...{objectId.slice(-4)}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Verify Document
            </h1>
          </div>

          {status === "FETCHING" && (
            <div className="py-12 flex flex-col items-center">
              <Loader2 className="animate-spin text-sui-600 mb-4" size={48} />
              <p className="text-sm text-slate-500">Processing...</p>
            </div>
          )}

          {status === "ERROR" && (
            <div className="py-8">
              <p className="text-red-500 font-bold">Object Not Found</p>
              <p className="text-sm text-slate-400">
                This proof may have expired or is invalid.
              </p>
            </div>
          )}

          {status === "IDLE" && (
            <div className="space-y-6">
              <Dropzone onFileSelect={setFile} selectedFile={file} />
              <button
                onClick={handleVerify}
                disabled={!file}
                className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all flex justify-center items-center gap-2"
              >
                <FileSearch size={20} /> Verify Authenticity
              </button>
            </div>
          )}

          {status === "VALID" && (
            <div className="py-8 animate-fade-in">
              <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={40} />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
                Authentic
              </h2>
              <p className="text-slate-500 mb-6">
                Matches blockchain proof exactly.
              </p>
              <button
                onClick={() => setStatus("IDLE")}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                Verify another
              </button>
            </div>
          )}

          {status === "INVALID" && (
            <div className="py-8 animate-fade-in">
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldAlert size={40} />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
                Failed
              </h2>
              <p className="text-slate-500 mb-6">
                Hash mismatch. File has been altered.
              </p>
              <button
                onClick={() => setStatus("IDLE")}
                className="text-red-600 font-bold"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
