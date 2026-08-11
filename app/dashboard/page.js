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

function Bars({ title, data, total }) {
  const max = Math.max(1, ...data.map(([, n]) => n));
  return (
    <section className="chart">
      <h2>{title}</h2>
      {data.length === 0 && <p className="empty">Nothing here yet 🦗</p>}
      {data.map(([label, n]) => (
        <div className="brow" key={label} title={`${label}: ${n} of ${total}`}>
          <div className="btop">
            <span className="blabel">{label}</span>
            <span className="bval">
              {n} <span className="bpct">· {Math.round((n / Math.max(1, total)) * 100)}%</span>
            </span>
          </div>
          <div className="track"><div className="bar" style={{ width: `${(n / max) * 100}%` }} /></div>
        </div>
      ))}
    </section>
  );
}

export default function Dashboard() {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    const load = () => fetch('/api/responses').then((r) => r.json()).then(setRows).catch(() => {});
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  if (!rows) return <div className="dash"><p className="empty">Counting heads… 🎈</p></div>;

  const label = { veg: 'Veg 🥗', nonveg: 'Non-Veg 🍗', alcoholic: 'Alcoholic 🍻', nonalcoholic: 'Non-Alcoholic 🥤' };
  const pretty = (pairs) => pairs.map(([k, n]) => [label[k] || k, n]);
  const n = (f) => rows.filter(f).length;
  const drinkers = n((r) => r.drinks?.length);

  return (
    <main className="dash">
      <div className="hero">
        <div className="emoji bounce">📊🎉</div>
        <h1>Trip Dashboard</h1>
        <p>Live numbers. Judging everyone in real time.</p>
        {rows.length > 0 && (
          <button className="export" onClick={() => downloadCsv(rows)}>
            Export CSV ⬇️ (for the spreadsheet person)
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="chart"><p className="empty">No responses yet. Go nag people with the form link. 📢</p></div>
      ) : (
        <>
          <div className="tiles">
            <div className="tile"><div className="num">{rows.length}</div><div className="lbl">🎉 Total in</div></div>
            <div className="tile"><div className="num">{n((r) => r.diet === 'veg')}</div><div className="lbl">🥗 Veg</div></div>
            <div className="tile"><div className="num">{n((r) => r.diet === 'nonveg')}</div><div className="lbl">🍗 Non-Veg</div></div>
            <div className="tile"><div className="num">{n((r) => r.booze === 'alcoholic')}</div><div className="lbl">🍻 Alcoholic</div></div>
          </div>

          <p className="sass">
            {(() => {
              const alc = n((r) => r.booze === 'alcoholic');
              const sober = rows.length - alc;
              if (alc > sober) return 'Alcoholics outnumber the sober. The bus ride will be musical. 🎶';
              if (sober > alc) return 'Sober squad wins. Someone has to hold the cameras. 📸';
              return 'Perfectly balanced, as all trips should be. 🫰';
            })()}
          </p>

          <div className="grid2">
            <Bars title="🍽️ The great veg vs non-veg divide" data={pretty(count(rows, 'diet'))} total={rows.length} />
            <Bars title="🥂 Team spirit(s)" data={pretty(count(rows, 'booze'))} total={rows.length} />
          </div>
          <Bars
            title="🧃 Refreshers — what the sober ones demand"
            data={count(rows.filter((r) => r.drinks?.length), 'drinks')}
            total={drinkers}
          />
          <Bars title="🍿 Snack leaderboard — democracy in action" data={count(rows, 'snacks')} total={rows.length} />

          <section className="chart">
            <h2>🧑‍🤝‍🧑 The squad ({rows.length}) — legends, all of them</h2>
            <div className="people">
              {rows.map((r, i) => (
                <div className="person" key={i}>
                  <div className="pname">
                    {r.name} <span className="ploc">📍 {r.location || '—'}</span>
                  </div>
                  <div className="pdetail">
                    {r.diet === 'veg' ? '🥗 Veg' : '🍗 Non-Veg'} · {r.booze === 'alcoholic' ? '🍻' : '🥤'}{' '}
                    {r.drinks?.length ? r.drinks.join(', ') : 'sorted'} · 🍿 {r.snacks.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
