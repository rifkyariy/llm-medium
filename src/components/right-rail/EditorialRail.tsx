import { staffPicks, type StaffPick } from '@/data/staff-picks';

export function EditorialRail({ picks = staffPicks }: { picks?: StaffPick[] }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Staff Picks</h2>
        <ul className="mt-4 space-y-4">
          {picks.map((pick) => (
            <li key={pick.title} className="text-sm">
              {pick.tag && <div className="text-xs text-zinc-500">{pick.tag}</div>}
              <div className="mt-1 font-semibold text-zinc-900">{pick.title}</div>
              <div className="text-xs text-zinc-500">{pick.author}</div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-zinc-900">Writing on Medium</h2>
        <ul className="mt-4 space-y-3 text-sm text-zinc-600">
          <li>Join our Medium Writing 101 Webinar</li>
          <li>Read Medium tips &amp; tricks</li>
          <li>Get practical Medium writing advice</li>
        </ul>
        <button className="mt-4 w-full rounded-full bg-black py-2 text-sm font-semibold text-white">
          Start writing
        </button>
      </div>
    </div>
  );
}
