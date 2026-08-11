import { list } from '@vercel/blob';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { blobs } = await list({ prefix: 'responses/' });
  // ponytail: one fetch per response; fine for party-sized data, batch to a single blob if it ever isn't
  const all = await Promise.all(
    blobs.map((b) => fetch(b.url, { cache: 'no-store' }).then((r) => r.json()).catch(() => null))
  );
  return Response.json(all.filter(Boolean).sort((a, b) => b.at - a.at));
}
