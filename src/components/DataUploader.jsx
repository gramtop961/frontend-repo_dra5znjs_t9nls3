import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

function parseCSV(text) {
  // Simple CSV parser supporting quoted fields and commas
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim().length);
  if (lines.length === 0) return { headers: [], rows: [] };
  const parseLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result.map((s) => s.trim());
  };
  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine).filter(r => r.length && r.some(x => x !== ''));
  return { headers, rows };
}

export default function DataUploader({ onDataLoaded }) {
  const cplRef = useRef(null);
  const cpmkRef = useRef(null);
  const mkRef = useRef(null);
  const nilaiRef = useRef(null);

  const handleFile = async (file, key) => {
    const text = await file.text();
    const parsed = parseCSV(text);
    onDataLoaded(key, parsed);
  };

  const Item = ({ label, accept, inputRef, onChange }) => (
    <label className="flex items-center justify-between gap-3 w-full border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-md bg-indigo-50 text-indigo-700">
          <Upload className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium">{label}</p>
          <p className="text-xs text-gray-500">Format CSV, gunakan header kolom yang konsisten</p>
        </div>
      </div>
      <input
        type="file"
        accept={accept}
        ref={inputRef}
        className="hidden"
        onChange={onChange}
      />
      <span className="text-sm text-indigo-700">Pilih berkas</span>
    </label>
  );

  return (
    <section className="bg-white rounded-xl border p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">Unggah Data</h2>
          <p className="text-sm text-gray-500">Unggah berkas CSV untuk CPL, CPMK, Mata Kuliah, dan Nilai mahasiswa.</p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Item
          label="Data CPL (contoh header: cpl_code, description)"
          accept=".csv"
          inputRef={cplRef}
          onChange={(e) => e.target.files[0] && handleFile(e.target.files[0], 'cpl')}
        />
        <Item
          label="Data CPMK (contoh header: cpmk_code, description)"
          accept=".csv"
          inputRef={cpmkRef}
          onChange={(e) => e.target.files[0] && handleFile(e.target.files[0], 'cpmk')}
        />
        <Item
          label="Data Mata Kuliah (contoh header: mk_code, name, sks)"
          accept=".csv"
          inputRef={mkRef}
          onChange={(e) => e.target.files[0] && handleFile(e.target.files[0], 'mk')}
        />
        <Item
          label="Data Nilai (header wajib: nim, student_name, mk_code, score)"
          accept=".csv"
          inputRef={nilaiRef}
          onChange={(e) => e.target.files[0] && handleFile(e.target.files[0], 'nilai')}
        />
      </div>
      <div className="rounded-md bg-indigo-50 text-indigo-800 p-3 text-sm">
        Tip: Gunakan kode unik untuk CPL, CPMK, dan MK. Nilai berkisar 0 - 100.
      </div>
    </section>
  );
}
