import { useState } from "react";
import TaskItem from "./TaskItem";

export default function TaskList({ tasks, onAddTask, onToggleTask, onDeleteTask }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("general");

  return (
    <div className="bg-white rounded-3xl shadow-soft p-5">
      <h2 className="text-lg font-bold text-pink-500">Daily Quests</h2>
      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 border border-pink-100 rounded-xl p-2"
          placeholder="Add a task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button
          className="rounded-xl bg-pink-400 text-white px-4"
          onClick={() => {
            if (!title.trim()) return;
            onAddTask(title, priority, category);
            setTitle("");
          }}
        >
          Add
        </button>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="border border-pink-100 rounded-xl p-2 text-sm">
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="border border-pink-100 rounded-xl p-2 text-sm">
          <option value="general">General</option>
          <option value="work">Work</option>
          <option value="study">Study</option>
          <option value="health">Health</option>
          <option value="home">Home</option>
        </select>
      </div>
      <div className="mt-4 space-y-2 max-h-96 overflow-auto">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} onToggle={onToggleTask} onDelete={onDeleteTask} />
        ))}
      </div>
    </div>
  );
}
