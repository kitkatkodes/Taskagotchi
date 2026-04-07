export default function AIMessageBox({ message, suggestions }) {
  return (
    <div className="bg-white rounded-3xl shadow-soft p-5">
      <h2 className="text-lg font-bold text-pink-500">Companion Notes</h2>
      <p className="mt-3 text-gray-700">{message}</p>
      <h3 className="mt-4 font-semibold text-gray-600">Smart Suggestions</h3>
      <ul className="mt-2 space-y-2 text-sm text-gray-700">
        {(suggestions || []).map((item) => (
          <li key={item} className="bg-pink-50 rounded-xl p-2">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
