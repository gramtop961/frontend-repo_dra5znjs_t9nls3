import React, { useMemo } from 'react';
import { Calculator, BarChart3 } from 'lucide-react';

function computeResults({ nilaiTable, mapping, cplTable }) {
  if (!nilaiTable?.rows?.length || !mapping) return { perStudent: [], perCpl: [] };

  // indexes for nilai table
  const nHeaders = nilaiTable.headers.map(h => h.toLowerCase());
  const idxNim = nHeaders.indexOf('nim');
  const idxName = nHeaders.indexOf('student_name');
  const idxMk = nHeaders.indexOf('mk_code');
  const idxScore = nHeaders.indexOf('score');
  if ([idxNim, idxName, idxMk, idxScore].some(i => i < 0)) return { perStudent: [], perCpl: [] };

  // Build helper maps
  const mkToCpmk = mapping.mkToCpmk || []; // {mk, cpmk, weight}
  const cpmkToCpl = mapping.cpmkToCpl || []; // {cpmk, cpl, weight}

  // Normalize weights by key group
  const groupBy = (arr, key) => arr.reduce((acc, it) => { (acc[it[key]] ||= []).push(it); return acc; }, {});
  const normWeights = (arr, key) => {
    const g = groupBy(arr, key);
    const out = [];
    Object.values(g).forEach(list => {
      const sum = list.reduce((s, it) => s + (Number(it.weight) || 0), 0) || 1;
      list.forEach(it => out.push({ ...it, w: (Number(it.weight) || 0) / sum }));
    });
    return out;
  };

  const mkToCpmkN = normWeights(mkToCpmk, 'mk');
  const cpmkToCplN = normWeights(cpmkToCpl, 'cpmk');
  const cpmkToCplMap = groupBy(cpmkToCplN, 'cpmk');

  const studentCpl = {}; // {nim: { name, cplScores: { [cpl]: value } }}

  nilaiTable.rows.forEach(r => {
    const nim = r[idxNim];
    const name = r[idxName];
    const mk = r[idxMk];
    const score = Number(r[idxScore]) || 0;

    const mkCpmk = mkToCpmkN.filter(m => m.mk === mk);
    mkCpmk.forEach(m1 => {
      const chain = cpmkToCplMap[m1.cpmk] || [];
      chain.forEach(m2 => {
        const cpl = m2.cpl;
        const contrib = score * m1.w * m2.w; // score already 0..100
        if (!studentCpl[nim]) studentCpl[nim] = { name, cplScores: {} };
        studentCpl[nim].cplScores[cpl] = (studentCpl[nim].cplScores[cpl] || 0) + contrib;
      });
    });
  });

  const perStudent = Object.entries(studentCpl).map(([nim, data]) => ({
    nim,
    name: data.name,
    cplScores: data.cplScores,
  }));

  // Aggregate per CPL average
  const cplTotals = {};
  let studentCount = perStudent.length || 1;
  perStudent.forEach(s => {
    Object.entries(s.cplScores).forEach(([cpl, val]) => {
      cplTotals[cpl] = (cplTotals[cpl] || 0) + val;
    });
  });
  const perCpl = Object.entries(cplTotals).map(([cpl, total]) => ({ cpl, average: total / studentCount }));

  // Ensure stable order: use CPL table order if provided
  const cplOrder = cplTable?.rows?.map(r => r[0]) || perCpl.map(x => x.cpl);
  perCpl.sort((a, b) => cplOrder.indexOf(a.cpl) - cplOrder.indexOf(b.cpl));

  return { perStudent, perCpl };
}

export default function CPLResults({ nilaiTable, mapping, cplTable }) {
  const { perStudent, perCpl } = useMemo(() => computeResults({ nilaiTable, mapping, cplTable }), [nilaiTable, mapping, cplTable]);

  return (
    <section className="bg-white rounded-xl border p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Hasil Pengukuran</h2>
          <p className="text-sm text-gray-500">Menghitung capaian CPL berdasarkan pemetaan dan nilai.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calculator className="h-4 w-4" />
          Otomatis
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-indigo-600" />
            <h3 className="font-medium">Rata-rata per CPL</h3>
          </div>
          {perCpl.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada hasil. Pastikan data nilai dan pemetaan telah diisi.</p>) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-2 pr-4">CPL</th>
                    <th className="py-2 pr-4">Rata-rata</th>
                    <th className="py-2 pr-4">Kategori</th>
                  </tr>
                </thead>
                <tbody>
                  {perCpl.map((row) => {
                    const avg = row.average;
                    const cat = avg >= 85 ? 'Sangat Baik' : avg >= 70 ? 'Baik' : avg >= 55 ? 'Cukup' : 'Kurang';
                    const color = avg >= 85 ? 'bg-emerald-100 text-emerald-800' : avg >= 70 ? 'bg-blue-100 text-blue-800' : avg >= 55 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800';
                    return (
                      <tr key={row.cpl} className="border-t">
                        <td className="py-2 pr-4 font-medium">{row.cpl}</td>
                        <td className="py-2 pr-4">{avg.toFixed(2)}</td>
                        <td className="py-2 pr-4"><span className={`px-2 py-1 rounded ${color}`}>{cat}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Ringkasan</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>Total mahasiswa: <span className="font-medium">{perStudent.length}</span></li>
            <li>Jumlah CPL terukur: <span className="font-medium">{perCpl.length}</span></li>
            <li>Metode: Agregasi bobot MK→CPMK→CPL</li>
          </ul>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-3">Detail per Mahasiswa</h3>
        {perStudent.length === 0 ? (
          <p className="text-sm text-gray-500">Belum ada data.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2 pr-4">NIM</th>
                  <th className="py-2 pr-4">Nama</th>
                  {Array.from(new Set(perCpl.map(c => c.cpl))).map(cpl => (
                    <th key={cpl} className="py-2 pr-4">{cpl}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {perStudent.map(s => (
                  <tr key={s.nim} className="border-t">
                    <td className="py-2 pr-4 font-mono">{s.nim}</td>
                    <td className="py-2 pr-4">{s.name}</td>
                    {Array.from(new Set(perCpl.map(c => c.cpl))).map(cpl => (
                      <td key={cpl} className="py-2 pr-4">{(s.cplScores[cpl] || 0).toFixed(2)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
