export default function StatsBar({ stats, mood, decayInfo, onLogout }) {
  const perPriority = decayInfo?.per_priority || {};
  return (
    <div className="bg-white rounded-3xl shadow-soft p-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex gap-3 text-sm flex-wrap">
        <span className="bg-sky px-3 py-1 rounded-full">XP: {stats?.xp ?? 0}</span>
        <span className="bg-mint px-3 py-1 rounded-full">Streak: {stats?.streak ?? 0}</span>
        <span className="bg-peach px-3 py-1 rounded-full capitalize">Mood: {mood || "happy"}</span>
        <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full">Live decay every 15s</span>
        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full">Loss now: -{decayInfo?.health_loss ?? 0} HP / -{decayInfo?.energy_loss ?? 0} EN</span>
        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
          Rate: -{decayInfo?.rates_per_hour?.health ?? 0}/hr HP, -{decayInfo?.rates_per_hour?.energy ?? 0}/hr EN
        </span>
        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
          High: {perPriority?.high?.count ?? 0} tasks
        </span>
        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
          Medium: {perPriority?.medium?.count ?? 0} tasks
        </span>
        <span className="bg-lime-100 text-lime-700 px-3 py-1 rounded-full">
          Low: {perPriority?.low?.count ?? 0} tasks
        </span>
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
