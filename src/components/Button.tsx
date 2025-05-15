"use client";

export default function Button({ children }: { children: React.ReactNode }) {
  return (
    <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
      {children}
    </button>
  );
}
