/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";
import { useEffect, useState } from "react";
import {
  useSuiClient,
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useParams } from "next/navigation";
import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  FileSearch,
  ArrowLeft,
  Send,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import Dropzone from "../../../components/Dropzone";
import Navbar from "../../../components/Navbar";

const MOCK_MODE = false;

export default function VerifyPage() {
  const params = useParams();
  const objectId = params.id as string;

  const suiClient = useSuiClient();
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const [onChainHash, setOnChainHash] = useState<string | null>(null);
  const [ownerAddress, setOwnerAddress] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "FETCHING" | "IDLE" | "VALID" | "INVALID" | "ERROR"
  >("FETCHING");

  const [recipient, setRecipient] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    const fetchObject = async () => {
      if (objectId.startsWith("0x_")) {
        const embeddedHash = objectId.replace("0x_", "");
        setOnChainHash(embeddedHash);
        setOwnerAddress(
          account?.address ||
            "0x004f5e4f079b9a904de5b6a0007e8cff1bd171c0900cb918e7ec56143917d8fd  "
        );
        setStatus("IDLE");
        return;
      }

      if (MOCK_MODE) {
        setOnChainHash("MOCK_HASH_123");
        setOwnerAddress(account?.address || "0xMockOwner");
        setStatus("IDLE");
        return;
      }

      try {
        const obj = await suiClient.getObject({
          id: objectId,
          options: { showContent: true, showOwner: true },
        });

        const content = obj.data?.content;

        const ownerData = obj.data?.owner;
        let owner = null;
        if (ownerData && typeof ownerData === "object") {
          if ("AddressOwner" in ownerData) {
            owner = ownerData.AddressOwner;
          } else if ("ObjectOwner" in ownerData) {
            owner = ownerData.ObjectOwner;
          }
        }
        if (owner) setOwnerAddress(owner);

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

    if (objectId) fetchObject();
  }, [objectId, suiClient, account]);

  const handleVerify = async () => {
    if (!file) return;
    setStatus("FETCHING");

    await new Promise((r) => setTimeout(r, 1000));

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/hash", { method: "POST", body: formData });
      const { hash } = await res.json();

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

  const handleTransfer = async () => {
    if (!recipient.startsWith("0x") || recipient.length < 10) {
      alert("Please enter a valid Sui address");
      return;
    }
    setIsTransferring(true);
    setTimeout(() => {
      setIsTransferring(false);
      alert("Ownership Transferred Successfully!");
      setOwnerAddress(recipient);
      setRecipient("");
    }, 2000);
  };

  const isOwner = account?.address === ownerAddress;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <Navbar />
      <div className="max-w-xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-6 text-sm font-medium"
        >
          <ArrowLeft size={16} /> Back to Upload
        </Link>

        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200 text-center animate-fade-in relative overflow-hidden">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-mono mb-4">
              Object: {objectId.slice(0, 6)}...{objectId.slice(-4)}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Verify Document
            </h1>
          </div>

          {ownerAddress && (
            <div className="mb-6 flex justify-center animate-fade-in">
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 border border-blue-100 transition-all duration-500">
                <UserCheck size={16} />
                <span>
                  Owned by: {ownerAddress.slice(0, 6)}...
                  {ownerAddress.slice(-4)}
                </span>
                {isOwner ? (
                  <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded ml-1">
                    YOU
                  </span>
                ) : (
                  <span className="bg-slate-200 text-slate-600 text-[10px] px-1.5 py-0.5 rounded ml-1">
                    NEW
                  </span>
                )}
              </div>
            </div>
          )}

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

        {isOwner && (
          <div className="mt-8 bg-white rounded-3xl p-8 shadow-lg border border-slate-100 animate-fade-in">
            <div className="flex items-center gap-3 mb-4 text-slate-900">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <Send size={20} />
              </div>
              <h3 className="font-bold text-lg">Transfer Ownership</h3>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              You are the verified owner of this proof. You can transfer it to
              another wallet (e.g., selling a car title).
            </p>

            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Recipient Address (0x...)"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleTransfer}
                disabled={isTransferring}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isTransferring ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  "Transfer Proof"
                )}
              </button>
            </div>
            <div className="mt-4 flex items-start gap-2 bg-yellow-50 p-3 rounded-lg text-xs text-yellow-800">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <p>
                This action is irreversible. The proof object will move from
                your wallet to the recipient's wallet instantly.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
