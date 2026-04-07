import { useState } from "react";
import { motion } from "framer-motion";
import { auth } from "./api";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  const submit = async (action) => {
    try {
      setError("");
      const data = await auth({ ...form, action });
      setUser(data);
    } catch (e) {
      setError(e.message);
    }
  };

  if (user) {
    return <Dashboard user={user} onLogout={() => setUser(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-candyPink to-sky flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-soft p-8"
      >
        <h1 className="text-3xl text-center font-bold text-pink-500">Tamogatchi Focus</h1>
        <p className="text-center text-gray-600 mt-2">Care for your pet by finishing tasks.</p>
        <div className="mt-6 space-y-3">
          <input
            className="w-full rounded-xl border border-pink-100 p-3"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="w-full rounded-xl border border-pink-100 p-3"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <button className="rounded-xl bg-pink-400 text-white p-3" onClick={() => submit("login")}>
              Login
            </button>
            <button className="rounded-xl bg-mint text-green-700 p-3" onClick={() => submit("register")}>
              Register
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
