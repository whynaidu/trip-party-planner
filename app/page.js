'use client';
import { useState } from 'react';
import { DRINKS, SNACKS } from '../lib/options';

export default function Form() {
  const [name, setName] = useState('');
  const [diet, setDiet] = useState(null);
  const [booze, setBooze] = useState(null);
  const [drink, setDrink] = useState(null);
  const [custom, setCustom] = useState('');
  const [snacks, setSnacks] = useState([]);
  const [state, setState] = useState('idle'); // idle | busy | done | error

  const toggleSnack = (s) =>
    setSnacks((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const finalDrink =
    booze === 'alcoholic' ? null : drink === 'other' ? custom.trim().slice(0, 40) : drink;
  const ready =
    name.trim() && diet && booze && (booze === 'alcoholic' || finalDrink) && snacks.length > 0;

  async function submit() {
    setState('busy');
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), diet, booze, drink: finalDrink, snacks }),
    }).catch(() => null);
    setState(res && res.ok ? 'done' : 'error');
  }

  if (state === 'done')
    return (
      <div className="done">
        <div className="emoji">🎉🥳🎊</div>
        <h1>You&apos;re on the list, {name.trim()}!</h1>
        <p>See you on the HDFC trip. Get ready to party!</p>
      </div>
    );

  return (
    <main className="wrap">
      <div className="hero">
        <div className="emoji">🏖️🎉🍻</div>
        <h1>HDFC Trip Party Planner</h1>
        <p>30 seconds. Tell us your vibe so we stock the good stuff.</p>
      </div>

      <div className="card">
        <h2>👋 Your name</h2>
        <input
          type="text"
          placeholder="e.g. Rahul"
          maxLength={60}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="card">
        <h2>🍽️ Food preference</h2>
        <div className="choices">
          <button className={`choice ${diet === 'veg' ? 'on' : ''}`} onClick={() => setDiet('veg')}>
            <span className="big">🥗</span>Veg
          </button>
          <button className={`choice ${diet === 'nonveg' ? 'on' : ''}`} onClick={() => setDiet('nonveg')}>
            <span className="big">🍗</span>Non-Veg
          </button>
        </div>
      </div>

      <div className="card">
        <h2>🥂 Drinks — what&apos;s your side?</h2>
        <div className="choices">
          <button
            className={`choice ${booze === 'alcoholic' ? 'on' : ''}`}
            onClick={() => { setBooze('alcoholic'); setDrink(null); }}
          >
            <span className="big">🍻</span>Alcoholic
          </button>
          <button
            className={`choice ${booze === 'nonalcoholic' ? 'on' : ''}`}
            onClick={() => { setBooze('nonalcoholic'); setDrink(null); }}
          >
            <span className="big">🥤</span>Non-Alcoholic
          </button>
        </div>
      </div>

      {booze === 'nonalcoholic' && (
        <div className="card">
          <h2>🧃 Pick your refresher</h2>
          <div className="chips">
            {DRINKS.map((d) => (
              <button key={d} className={`chip ${drink === d ? 'on' : ''}`} onClick={() => setDrink(d)}>
                {d}
              </button>
            ))}
            <button className={`chip ${drink === 'other' ? 'on' : ''}`} onClick={() => setDrink('other')}>
              Other ✍️
            </button>
          </div>
          {drink === 'other' && (
            <div style={{ marginTop: 12 }}>
              <input
                type="text"
                placeholder="Type your drink…"
                maxLength={40}
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      <div className="card">
        <h2>🍿 Dry snacks — pick all you love</h2>
        <div className="chips">
          {SNACKS.map((s) => (
            <button key={s} className={`chip ${snacks.includes(s) ? 'on' : ''}`} onClick={() => toggleSnack(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <button className="submit" disabled={!ready || state === 'busy'} onClick={submit}>
        {state === 'busy' ? 'Sending… 🚀' : 'Count me in! 🎉'}
      </button>
      {state === 'error' && <p className="error">Something broke — try again.</p>}
    </main>
  );
}
