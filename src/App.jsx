import React, { useState } from 'react';
import Header from './components/Header';
import DataUploader from './components/DataUploader';
import MappingManager from './components/MappingManager';
import CPLResults from './components/CPLResults';

export default function App() {
  const [tables, setTables] = useState({ cpl: null, cpmk: null, mk: null, nilai: null });
  const [mapping, setMapping] = useState({ mkToCpmk: [], cpmkToCpl: [] });

  const handleDataLoaded = (key, table) => {
    setTables(prev => ({ ...prev, [key]: table }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white text-gray-900">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <DataUploader onDataLoaded={handleDataLoaded} />
          <MappingManager
            cpmkTable={tables.cpmk}
            cplTable={tables.cpl}
            mkTable={tables.mk}
            onMappingChange={setMapping}
          />
        </div>

        <CPLResults nilaiTable={tables.nilai} mapping={mapping} cplTable={tables.cpl} />

        <section className="text-sm text-gray-500 px-2">
          <h3 className="font-medium text-gray-700 mb-1">Cara pakai singkat</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Unggah 4 berkas CSV: CPL, CPMK, MK, dan Nilai mahasiswa.</li>
            <li>Atur pemetaan bobot MK → CPMK dan CPMK → CPL sesuai kurikulum.</li>
            <li>Lihat hasil rata-rata capaian untuk setiap CPL dan detail per mahasiswa.</li>
          </ol>
        </section>
      </main>
    </div>
  );
}
