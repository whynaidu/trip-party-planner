import { put } from '@vercel/blob';
import { SNACKS } from '../../../lib/options';

export async function POST(req) {
  const d = await req.json().catch(() => null);
  const name = typeof d?.name === 'string' ? d.name.trim().slice(0, 60) : '';
  const location = typeof d?.location === 'string' ? d.location.trim().slice(0, 60) : '';
  const nonalc = d?.booze === 'nonalcoholic';
  const drinks = nonalc
    ? (Array.isArray(d?.drinks) ? d.drinks : [])
        .filter((x) => typeof x === 'string' && x.trim())
        .map((x) => x.trim().slice(0, 40))
        .slice(0, 12)
    : [];
  const valid =
    name &&
    location &&
    ['veg', 'nonveg'].includes(d?.diet) &&
    (d?.booze === 'alcoholic' || nonalc) &&
    (!nonalc || drinks.length > 0) &&
    Array.isArray(d?.snacks) &&
    d.snacks.length > 0 &&
    d.snacks.every((s) => SNACKS.includes(s));

  if (!valid) return Response.json({ error: 'invalid submission' }, { status: 400 });

  const rec = { name, location, diet: d.diet, booze: d.booze, drinks, snacks: d.snacks, at: Date.now() };
  await put(`responses/${rec.at}-${crypto.randomUUID()}.json`, JSON.stringify(rec), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  });
  return Response.json({ ok: true });
}
