'use client';
import { useEffect, useState } from 'react';

function count(items, key) {
  const m = new Map();
  for (const i of items) {
    const vals = Array.isArray(i[key]) ? i[key] : [i[key]];
    for (const v of vals) m.set(v, (m.get(v) || 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

function Bars({ title, data, total }) {
  const max = Math.max(1, ...data.map(([, n]) => n));
  return (
    <section className="chart">
      <h2>{title}</h2>
      {data.length === 0 && <p className="empty">No data yet</p>}
      {data.map(([label, n]) => (
        <div className="row" key={label} title={`${label}: ${n} of ${total}`}>
          <span className="lbl">{label}</span>
          <div className="track"><div className="bar" style={{ width: `${(n / max) * 100}%` }} /></div>
          <span className="val">{n}</span>
        </div>
      ))}
    </section>
  );
}

function downloadCsv(rows) {
  const esc = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`;
  const lines = [
    ['Name', 'Location', 'Food', 'Drinks side', 'Drinks', 'Snacks', 'Submitted'].map(esc).join(','),
    ...rows.map((r) =>
      [r.name, r.location, r.diet, r.booze, (r.drinks || []).join('; '), r.snacks.join('; '), new Date(r.at).toLocaleString()]
        .map(esc)
        .join(',')
    ),
  ];
  const url = URL.createObjectURL(new Blob(['﻿' + lines.join('\n')], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'trip-responses.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function Dashboard() {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    const load = () => fetch('/api/responses').then((r) => r.json()).then(setRows).catch(() => {});
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  if (!rows) return <div className="dash"><p className="empty">Loading… 🎈</p></div>;

  const label = { veg: 'Veg 🥗', nonveg: 'Non-Veg 🍗', alcoholic: 'Alcoholic 🍻', nonalcoholic: 'Non-Alcoholic 🥤' };
  const pretty = (pairs) => pairs.map(([k, n]) => [label[k] || k, n]);

  return (
    <main className="dash">
      <div className="hero">
        <div className="emoji">📊🎉</div>
        <h1>Trip Dashboard</h1>
        <p>Live responses · refreshes every 15s</p>
        {rows.length > 0 && (
          <button className="export" onClick={() => downloadCsv(rows)}>
            Export CSV ⬇️
          </button>
        )}
      </div>

      <div className="tiles">
        <div className="tile"><div className="num">{rows.length}</div><div className="lbl">Total responses</div></div>
        <div className="tile"><div className="num">{rows.filter((r) => r.diet === 'veg').length}</div><div className="lbl">Veg 🥗</div></div>
        <div className="tile"><div className="num">{rows.filter((r) => r.booze === 'alcoholic').length}</div><div className="lbl">Alcoholic 🍻</div></div>
      </div>

      <Bars title="Food preference" data={pretty(count(rows, 'diet'))} total={rows.length} />
      <Bars title="Drinks side" data={pretty(count(rows, 'booze'))} total={rows.length} />
      <Bars
        title="Refreshers (non-alcoholic)"
        data={count(rows.filter((r) => r.drinks?.length), 'drinks')}
        total={rows.filter((r) => r.drinks?.length).length}
      />
      <Bars title="Dry snacks popularity" data={count(rows, 'snacks')} total={rows.length} />

      <section className="chart">
        <h2>Everyone ({rows.length})</h2>
        {rows.map((r, i) => (
          <div className="row" key={i} style={{ gridTemplateColumns: '110px 1fr' }}>
            <span className="lbl">{r.name}</span>
            <span className="val" style={{ color: '#c3c2b7' }}>
              📍{r.location || '—'} ·{r.diet === 'veg' ? '🥗' : '🍗'} · {r.drinks?.length ? r.drinks.join(', ') : '🍻 sorted'} · {r.snacks.length} snack{r.snacks.length > 1 ? 's' : ''}
            </span>
          </div>
        ))}
      </section>
    </main>
  );
}
