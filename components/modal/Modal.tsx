"use client";

export default function Modal({ visible, onClose, children }: any) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-[400px] shadow-xl">
        {children}

        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 rounded-lg bg-slate-800 text-main hover:bg-slate-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
