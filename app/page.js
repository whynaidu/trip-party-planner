'use client';
import { useState } from 'react';
import { DRINKS, SNACKS } from '../lib/options';

const CONFETTI = ['🎉', '🎊', '🍕', '🍻', '🥤', '🍿', '✨', '🪩', '🍟', '🥳'];

function Popper() {
  return (
    <span className="popper" aria-hidden>
      {['🎉', '✨', '🎊', '🥳', '✨', '🎉'].map((e, i) => (
        <span key={i} style={{ '--i': i }}>{e}</span>
      ))}
    </span>
  );
}

const SNACK_QUIP = (n) =>
  n === 0 ? 'Zero picked. The diet starts today, huh?' :
  n === 1 ? 'Just one? Bold display of self-control.' :
  n <= 3 ? `${n} picked. Respectable.` :
  n <= 5 ? `${n} picked. Okay, foodie, we see you.` :
  `${n}?! Save some for the rest of the bus.`;

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
        {CONFETTI.concat(CONFETTI).map((c, i) => (
          <span
            key={i}
            className="confetti"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2.5 + Math.random() * 2}s`,
              fontSize: `${18 + Math.random() * 20}px`,
            }}
          >
            {c}
          </span>
        ))}
        <div className="emoji">🎉🥳🎊</div>
        <h1>You&apos;re in, {name.trim()}!</h1>
        <p>Your questionable taste has been recorded. Forever.</p>
        <p style={{ marginTop: 8 }}>See you on the trip. Bring the vibes, we&apos;ve got the rest.</p>
      </div>
    );

  return (
    <main className="wrap">
      <div className="hero">
        <div className="emoji bounce">🏖️🎉🍻</div>
        <h1>Trip Party Planner</h1>
        <p>30 seconds of your life. You&apos;ve wasted more on reels.</p>
      </div>

      <div className="card">
        <h2>👋 Who are you, exactly?</h2>
        <input
          type="text"
          placeholder="Your actual name, not your gamer tag"
          maxLength={60}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {name.trim().length > 0 && name.trim().length < 3 && (
          <p className="quip">That&apos;s it? Even OTPs are longer.</p>
        )}
      </div>

      <div className="card">
        <h2>🍽️ Pick your fighter</h2>
        <div className="choices">
          <button className={`choice ${diet === 'veg' ? 'on' : ''}`} onClick={() => setDiet('veg')}>
            <span className="big">🥗</span>Veg
            {diet === 'veg' && <Popper />}
          </button>
          <button className={`choice ${diet === 'nonveg' ? 'on' : ''}`} onClick={() => setDiet('nonveg')}>
            <span className="big">🍗</span>Non-Veg
            {diet === 'nonveg' && <Popper />}
          </button>
        </div>
        {diet === 'veg' && <p className="quip">Paneer it is. Again. Shocking.</p>}
        {diet === 'nonveg' && <p className="quip">The chicken lobby grows stronger. 💪</p>}
      </div>

      <div className="card">
        <h2>🥂 Drinks — pick a side, this is war</h2>
        <div className="choices">
          <button
            className={`choice ${booze === 'alcoholic' ? 'on' : ''}`}
            onClick={() => { setBooze('alcoholic'); setDrink(null); }}
          >
            <span className="big">🍻</span>Alcoholic
            {booze === 'alcoholic' && <Popper />}
          </button>
          <button
            className={`choice ${booze === 'nonalcoholic' ? 'on' : ''}`}
            onClick={() => { setBooze('nonalcoholic'); setDrink(null); }}
          >
            <span className="big">🥤</span>Non-Alcoholic
            {booze === 'nonalcoholic' && <Popper />}
          </button>
        </div>
        {booze === 'alcoholic' && (
          <p className="quip">Say less. That department is already… fully stocked. 😏</p>
        )}
        {booze === 'nonalcoholic' && (
          <p className="quip">Designated memory-keeper spotted. Your liver says thanks.</p>
        )}
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
                placeholder="Go on, be fancy…"
                maxLength={40}
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
              />
              {custom.trim().toLowerCase() === 'water' && (
                <p className="quip">Water. At a party. Groundbreaking. 💧</p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="card">
        <h2>🍿 Dry snacks — nobody&apos;s judging. (We are.)</h2>
        <div className="chips">
          {SNACKS.map((s) => (
            <button key={s} className={`chip ${snacks.includes(s) ? 'on' : ''}`} onClick={() => toggleSnack(s)}>
              {s}
            </button>
          ))}
        </div>
        <p className="quip">{SNACK_QUIP(snacks.length)}</p>
      </div>

      <button className="submit" disabled={!ready || state === 'busy'} onClick={submit}>
        {state === 'busy' ? 'Bribing the server… 🚀' : ready ? 'Lock it in 🎉' : 'Finish the form, champ 👆'}
      </button>
      {state === 'error' && <p className="error">Great. It broke. Hit it again — technology loves persistence.</p>}
    </main>
  );
}
