import { put } from '@vercel/blob';
import { DRINKS, SNACKS } from '../../../lib/options';

export async function POST(req) {
  const d = await req.json().catch(() => null);
  const name = typeof d?.name === 'string' ? d.name.trim().slice(0, 60) : '';
  const okBooze = d?.booze === 'alcoholic' || d?.booze === 'nonalcoholic';
  const valid =
    name &&
    ['veg', 'nonveg'].includes(d?.diet) &&
    okBooze &&
    typeof d?.drink === 'string' &&
    d.drink.trim().length > 0 &&
    d.drink.length <= 40 &&
    (DRINKS[d.booze]?.includes(d.drink) || d.booze === 'nonalcoholic') &&
    Array.isArray(d?.snacks) &&
    d.snacks.length > 0 &&
    d.snacks.every((s) => SNACKS.includes(s));

  if (!valid) return Response.json({ error: 'invalid submission' }, { status: 400 });

  const rec = { name, diet: d.diet, booze: d.booze, drink: d.drink, snacks: d.snacks, at: Date.now() };
  await put(`responses/${rec.at}-${crypto.randomUUID()}.json`, JSON.stringify(rec), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  });
  return Response.json({ ok: true });
}
