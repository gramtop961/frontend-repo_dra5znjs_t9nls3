import React, { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';

function getUniqueValues(table, colIndex) {
  if (!table || !table.rows) return [];
  const set = new Set();
  table.rows.forEach(r => {
    if (r[colIndex] !== undefined && r[colIndex] !== '') set.add(r[colIndex]);
  });
  return Array.from(set);
}

export default function MappingManager({ cpmkTable, cplTable, mkTable, onMappingChange }) {
  const [mkToCpmk, setMkToCpmk] = useState([]); // { mk, cpmk, weight }
  const [cpmkToCpl, setCpmkToCpl] = useState([]); // { cpmk, cpl, weight }

  const mkCodes = useMemo(() => (mkTable?.headers?.length ? getUniqueValues(mkTable, 0) : []), [mkTable]);
  const cpmkCodes = useMemo(() => (cpmkTable?.headers?.length ? getUniqueValues(cpmkTable, 0) : []), [cpmkTable]);
  const cplCodes = useMemo(() => (cplTable?.headers?.length ? getUniqueValues(cplTable, 0) : []), [cplTable]);

  const notify = (nextA, nextB) => {
    const data = { mkToCpmk: nextA ?? mkToCpmk, cpmkToCpl: nextB ?? cpmkToCpl };
    onMappingChange(data);
  };

  const addMkToCpmk = () => {
    const next = [...mkToCpmk, { mk: mkCodes[0] || '', cpmk: cpmkCodes[0] || '', weight: 100 }];
    setMkToCpmk(next);
    notify(next, null);
  };

  const addCpmkToCpl = () => {
    const next = [...cpmkToCpl, { cpmk: cpmkCodes[0] || '', cpl: cplCodes[0] || '', weight: 100 }];
    setCpmkToCpl(next);
    notify(null, next);
  };

  const updateMkToCpmk = (idx, key, val) => {
    const next = mkToCpmk.map((it, i) => i === idx ? { ...it, [key]: val } : it);
    setMkToCpmk(next);
    notify(next, null);
  };

  const updateCpmkToCpl = (idx, key, val) => {
    const next = cpmkToCpl.map((it, i) => i === idx ? { ...it, [key]: val } : it);
    setCpmkToCpl(next);
    notify(null, next);
  };

  const removeRow = (type, idx) => {
    if (type === 'a') {
      const next = mkToCpmk.filter((_, i) => i !== idx);
      setMkToCpmk(next);
      notify(next, null);
    } else {
      const next = cpmkToCpl.filter((_, i) => i !== idx);
      setCpmkToCpl(next);
      notify(null, next);
    }
  };

  return (
    <section className="bg-white rounded-xl border p-5 space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Pemetaan</h2>
        <p className="text-sm text-gray-500">Atur hubungan bobot antara MK → CPMK dan CPMK → CPL. Bobot dalam persen.</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">MK → CPMK</h3>
          <button onClick={addMkToCpmk} className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border hover:bg-gray-50">
            <Plus className="h-4 w-4" /> Tambah
          </button>
        </div>
        <div className="space-y-2">
          {mkToCpmk.length === 0 && (
            <div className="text-sm text-gray-500 border rounded-md p-3">Belum ada pemetaan. Tambah baris untuk memulai.</div>
          )}
          {mkToCpmk.map((row, idx) => (
            <div key={idx} className="grid md:grid-cols-4 gap-2 items-center border rounded-md p-3">
              <select value={row.mk} onChange={(e) => updateMkToCpmk(idx, 'mk', e.target.value)} className="border rounded-md px-2 py-1.5">
                {mkCodes.map(code => <option key={code} value={code}>{code}</option>)}
              </select>
              <select value={row.cpmk} onChange={(e) => updateMkToCpmk(idx, 'cpmk', e.target.value)} className="border rounded-md px-2 py-1.5">
                {cpmkCodes.map(code => <option key={code} value={code}>{code}</option>)}
              </select>
              <div className="flex items-center gap-2">
                <input type="number" min={0} max={100} value={row.weight} onChange={(e) => updateMkToCpmk(idx, 'weight', Number(e.target.value))} className="border rounded-md px-2 py-1.5 w-24" />
                <span className="text-sm text-gray-500">%</span>
              </div>
              <button onClick={() => removeRow('a', idx)} className="justify-self-end text-gray-500 hover:text-red-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">CPMK → CPL</h3>
          <button onClick={addCpmkToCpl} className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border hover:bg-gray-50">
            <Plus className="h-4 w-4" /> Tambah
          </button>
        </div>
        <div className="space-y-2">
          {cpmkToCpl.length === 0 && (
            <div className="text-sm text-gray-500 border rounded-md p-3">Belum ada pemetaan. Tambah baris untuk memulai.</div>
          )}
          {cpmkToCpl.map((row, idx) => (
            <div key={idx} className="grid md:grid-cols-4 gap-2 items-center border rounded-md p-3">
              <select value={row.cpmk} onChange={(e) => updateCpmkToCpl(idx, 'cpmk', e.target.value)} className="border rounded-md px-2 py-1.5">
                {cpmkCodes.map(code => <option key={code} value={code}>{code}</option>)}
              </select>
              <select value={row.cpl} onChange={(e) => updateCpmkToCpl(idx, 'cpl', e.target.value)} className="border rounded-md px-2 py-1.5">
                {cplCodes.map(code => <option key={code} value={code}>{code}</option>)}
              </select>
              <div className="flex items-center gap-2">
                <input type="number" min={0} max={100} value={row.weight} onChange={(e) => updateCpmkToCpl(idx, 'weight', Number(e.target.value))} className="border rounded-md px-2 py-1.5 w-24" />
                <span className="text-sm text-gray-500">%</span>
              </div>
              <button onClick={() => removeRow('b', idx)} className="justify-self-end text-gray-500 hover:text-red-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
