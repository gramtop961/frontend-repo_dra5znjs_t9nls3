import React from 'react';
import { GraduationCap, Settings } from 'lucide-react';

export default function Header() {
  return (
    <header className="w-full border-b bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-600 text-white">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Sistem Pengukuran CPL</h1>
            <p className="text-sm text-gray-500 -mt-0.5">Otomatisasi pengukuran capaian pembelajaran lulusan</p>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md border hover:bg-gray-50 transition">
          <Settings className="h-4 w-4" />
          Pengaturan
        </button>
      </div>
    </header>
  );
}
