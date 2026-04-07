export default function StatsBar({ stats, mood, onLogout }) {
  return (
    <div className="bg-white rounded-3xl shadow-soft p-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex gap-3 text-sm flex-wrap">
        <span className="bg-sky px-3 py-1 rounded-full">XP: {stats?.xp ?? 0}</span>
        <span className="bg-mint px-3 py-1 rounded-full">Streak: {stats?.streak ?? 0}</span>
        <span className="bg-peach px-3 py-1 rounded-full capitalize">Mood: {mood || "happy"}</span>
        {(stats?.badges || []).map((badge) => (
          <span key={badge} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
            {badge}
          </span>
        ))}
      </div>
      <button className="rounded-xl bg-gray-100 px-3 py-1 text-gray-700" onClick={onLogout}>
        Logout
      </button>
    </div>
  );
}
