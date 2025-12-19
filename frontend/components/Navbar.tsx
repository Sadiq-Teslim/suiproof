import { ConnectButton } from "@mysten/dapp-kit";
import { FileBadge } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full border-b border-slate-100 bg-white/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <div className="bg-sui-600 p-2 rounded-lg text-white shadow-lg shadow-blue-500/30">
            <FileBadge size={22} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            SuiProof
          </span>
        </Link>

        <div className="font-medium">
          <ConnectButton />
        </div>
      </div>
    </nav>
  );
}
