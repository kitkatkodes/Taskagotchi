import { motion } from "framer-motion";

export default function TaskItem({ task, onToggle, onDelete }) {
  return (
    <motion.div whileHover={{ scale: 1.01 }} className="border border-pink-100 rounded-xl p-3 flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1">
        <input
          type="checkbox"
          checked={task.completed}
          className="h-4 w-4 accent-pink-500"
          onChange={() => onToggle(task)}
        />
        <div className="text-left">
          <span className={`${task.completed ? "line-through text-gray-400" : "text-gray-700"}`}>{task.title}</span>
          <div className="text-xs text-gray-400 capitalize">
            {task.priority || "medium"} | {task.category || "general"}
          </div>
        </div>
      </div>
      <button className="text-xs bg-red-100 text-red-500 rounded-lg px-2 py-1" onClick={() => onDelete(task.id)}>
        Delete
      </button>
    </motion.div>
  );
}
