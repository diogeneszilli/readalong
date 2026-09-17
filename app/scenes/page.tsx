import SceneArt from "@/components/SceneArt";
import { SCENES } from "@/lib/scenes";
import { WORLDS } from "@/lib/schema";

/** Dev gallery: every scene for every world, for visual review. */
export default function ScenesGallery() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 p-8">
      <h1 className="text-2xl font-extrabold">Scene gallery</h1>
      {WORLDS.map((w) => (
        <section key={w.id}>
          <h2 className="mb-3 text-xl font-extrabold">
            {w.emoji} {w.name}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SCENES[w.id].map((s) => (
              <figure key={s.id} className="overflow-hidden rounded-2xl bg-white shadow">
                <SceneArt world={w.id} scene={s.id} className="aspect-[5/2]" />
                <figcaption className="px-3 py-2 text-sm font-bold text-slate-600">
                  {s.label} <span className="font-mono text-xs text-slate-400">{s.id}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
