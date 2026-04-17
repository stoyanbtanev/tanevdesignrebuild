// Generates 20 hero images via Leonardo API (Kino XL, cinematic).
// Downloads to public/hero-9.jpg .. hero-28.jpg.
// Usage: bun scripts/gen-leonardo.mjs

import fs from 'node:fs';
import path from 'node:path';

const API_KEY = '9f3bed64-d4ba-42e6-b8e9-a10756cda51a';
const MODEL_KINO = 'aa77f04e-3eec-4034-9c07-d0f619684628'; // Kino XL
const PHOENIX = 'de7d3faf-762f-48e0-b3b7-9d0ac3a3fcf3';
const OUT_DIR = path.resolve(process.cwd(), 'public');
const START_INDEX = 9;

const GLOBAL = 'cinematic 35mm film grain, desaturated, moody, deep shadows, single warm ember red #E8241A accent light, editorial, negative space, no text, no logos, no watermark, no face visible, no eyes, no fingers close-up, no corporate suit, no stock photo feel';

const PROMPTS = [
  'silhouette of a runner from behind sprinting on wet black asphalt, motion blur on legs, single ember streetlight bloom, rain in the air',
  'leather football ball caked in wet mud resting on torn stadium grass, single low ember floodlight raking across, macro depth of field',
  'raw concrete wall covered in layered graffiti tags, one crimson red hand-painted symbol dominant, peeling posters at the edges, alley dusk',
  'bare human back turned away, rain-slicked skin and muscle texture, subtle ember rim light from behind, no face, no arms visible',
  'football cleat studs pressing into wet churned mud pitch, extreme macro, droplets, one red lace thread',
  'graffitied underground tunnel, spray paint trails, a single bare bulb glowing ember red in the far distance, long perspective',
  'torn layered wheatpaste street posters on brick, half ripped, red scrawl marker tag on top, weathered city texture',
  'boxer torso wrapped with white hand tape, sweat beads, ember red corner light, no face, no fingers visible',
  'outdoor basketball court rusted chain net hanging from a hoop, single ember streetlamp behind, cracked asphalt court, night mist',
  'silhouette of a dancer mid-backbend on a bare stage, ember red spotlight wash, smoke haze, no face visible',
  'battered skateboard deck scraped and stickered lying on rough concrete, red grip tape fragment, golden hour shadow',
  'chalked handprint slap on a granite climbing wall, dusty white chalk bloom, ember warm accent from a low sun, no fingers in frame',
  'empty football stadium seats at dusk with a single floodlight cutting through mist, ember red glow, wide negative space',
  'close-up of a rusted metal rolling shutter covered in stacked spray paint tags, one fresh crimson throw-up on top',
  'underwater shot of a lone swimmer from behind kicking, trail of bubbles, ember red surface light refracted, no face',
  'lone cyclist silhouette crossing a concrete overpass at dusk against a bruised sky, rim-lit by ember sunset, tiny in frame',
  'a crushed spray paint can on cracked pavement with a red drip trail, street grit, shallow focus, cinematic',
  'a freestyle footballer mid-air bicycle kick silhouette against an ember orange smoke flare, backlight, no face visible',
  'breakdancer freeze pose shadow cast on a heavily graffitied concrete wall, single hard ember light from the side, no face',
  'bicycle wheel spinning on glossy wet city street, motion blur spokes, ember red tail light reflection on asphalt',
];

async function api(pathname, opts = {}) {
  const res = await fetch(`https://cloud.leonardo.ai/api/rest/v1${pathname}`, {
    ...opts,
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${API_KEY}`,
      ...(opts.headers || {}),
    },
  });
  const txt = await res.text();
  let json; try { json = JSON.parse(txt); } catch { json = { raw: txt }; }
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${txt}`);
  return json;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function startGen(prompt) {
  const body = {
    prompt: `${prompt}. ${GLOBAL}`,
    modelId: MODEL_KINO,
    num_images: 1,
    width: 1024,
    height: 1280,
    guidance_scale: 7,
    public: false,
    alchemy: false,
    negative_prompt: 'face, eyes, fingers, close-up of hands, suit, tie, corporate, stock photo, watermark, text, logo, anime, 3D render, clipart, oversaturated, HDR',
  };
  const r = await api('/generations', { method: 'POST', body: JSON.stringify(body) });
  return r?.sdGenerationJob?.generationId;
}

async function pollGen(id, tries = 60) {
  for (let i = 0; i < tries; i++) {
    await sleep(3000);
    const r = await api(`/generations/${id}`);
    const gen = r?.generations_by_pk;
    if (!gen) continue;
    if (gen.status === 'COMPLETE' && gen.generated_images?.length) return gen.generated_images;
    if (gen.status === 'FAILED') throw new Error('generation failed');
  }
  throw new Error('timeout');
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
}

async function main() {
  const results = [];
  // fire all in parallel (Leonardo enqueues)
  const jobs = await Promise.all(PROMPTS.map(async (p, i) => {
    try {
      const id = await startGen(p);
      console.log(`[${i+1}/${PROMPTS.length}] queued`, id);
      return { i, id, p };
    } catch (e) {
      console.error(`[${i+1}] start failed`, e.message);
      return null;
    }
  }));

  for (const j of jobs) {
    if (!j) continue;
    try {
      const imgs = await pollGen(j.id);
      const url = imgs[0].url;
      const dest = path.join(OUT_DIR, `hero-${START_INDEX + j.i}.jpg`);
      await download(url, dest);
      console.log('saved', dest);
      results.push(dest);
    } catch (e) {
      console.error(`[${j.i+1}] poll/download failed`, e.message);
    }
  }
  console.log(`done. ${results.length}/${PROMPTS.length} images saved.`);
}

main().catch(e => { console.error(e); process.exit(1); });
