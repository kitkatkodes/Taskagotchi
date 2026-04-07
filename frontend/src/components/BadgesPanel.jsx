const BADGE_META = {
  "Starter Spark": { icon: "⭐", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  "Momentum Maker": { icon: "🌟", color: "bg-pink-50 text-pink-700 border-pink-200" },
  "7-Day Guardian": { icon: "✨", color: "bg-sky-50 text-sky-700 border-sky-200" },
  "Focus Hero": { icon: "💫", color: "bg-purple-50 text-purple-700 border-purple-200" },
};

export default function BadgesPanel({ badges }) {
  const won = badges || [];

  return (
    <div className="bg-white rounded-3xl shadow-soft p-5">
      <h2 className="text-lg font-bold text-pink-500">Badges Won</h2>
      {won.length === 0 ? (
        <p className="text-sm text-gray-500 mt-3">No badges yet. Complete tasks to earn your first star.</p>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-2">
          {won.map((badge) => {
            const meta = BADGE_META[badge] || { icon: "⭐", color: "bg-yellow-50 text-yellow-700 border-yellow-200" };
            return (
              <div key={badge} className={`rounded-xl border px-3 py-2 ${meta.color} flex items-center gap-2`}>
                <span className="text-lg" aria-hidden>
                  {meta.icon}
                </span>
                <span className="text-sm font-medium">{badge}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
