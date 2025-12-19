import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle } from 'lucide-react';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

export default function Dropzone({ onFileSelect, selectedFile }: DropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.[0]) onFileSelect(e.dataTransfer.files[0]);
  };

  return (
    <div 
      onClick={() => inputRef.current?.click()}
      onDragOver={handleDrag} 
      onDragLeave={handleDrag} 
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 group
        ${isDragOver 
            ? 'border-sui-500 bg-sui-50 scale-[1.02]' 
            : 'border-slate-200 hover:border-sui-400 hover:bg-slate-50'
        }
        ${selectedFile ? 'bg-sui-50/50 border-sui-200' : ''}
      `}
    >
      <input 
        type="file" 
        ref={inputRef} 
        onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])} 
        className="hidden" 
      />
      
      <div className="flex flex-col items-center gap-4 text-slate-500">
        {selectedFile ? (
          <>
            <div className="bg-green-100 p-4 rounded-full text-green-600 shadow-sm animate-bounce">
                <CheckCircle size={32} />
            </div>
            <div>
                <p className="text-slate-900 font-bold text-lg">{selectedFile.name}</p>
                <p className="text-sm text-slate-400 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
          </>
        ) : (
          <>
            <div className={`
                p-4 rounded-full transition-colors duration-300
                ${isDragOver ? 'bg-sui-100 text-sui-600' : 'bg-slate-100 text-slate-400 group-hover:bg-sui-100 group-hover:text-sui-600'}
            `}>
                <UploadCloud size={32} />
            </div>
            <div>
                <p className="font-bold text-slate-700 text-lg mb-1">Click or drag file to upload</p>
                <p className="text-sm text-slate-400">Supports PDF, JPG, PNG, TXT</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}