import { useEffect, useMemo, useState } from "react";
import {
  addTask,
  deleteTask,
  fetchChat,
  fetchPet,
  fetchStats,
  fetchTasks,
  petAction,
  sendChat,
  updateTask,
} from "../api";
import AIMessageBox from "./AIMessageBox";
import PetChatBox from "./PetChatBox";
import PetDisplay from "./PetDisplay";
import PetSelector from "./PetSelector";
import StatsBar from "./StatsBar";
import TaskList from "./TaskList";

export default function Dashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [pet, setPet] = useState(null);
  const [stats, setStats] = useState(null);
  const [aiMessage, setAiMessage] = useState("Welcome back! Let's make your pet proud.");
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [decayInfo, setDecayInfo] = useState(null);

  const userId = user.user_id;
  const wsUrl = useMemo(() => `ws://localhost:8000/ws/pet/${userId}/`, [userId]);

  useEffect(() => {
    const load = async () => {
      const [taskData, petData, statsData] = await Promise.all([
        fetchTasks(userId),
        fetchPet(userId),
        fetchStats(userId),
      ]);
      const chatData = await fetchChat(userId);
      setTasks(taskData);
      setPet(petData.pet);
      setStats(statsData);
      setAiMessage(petData.ai_message);
      setAiSuggestions(petData.ai_suggestions);
      setChatMessages(chatData);
      setDecayInfo(petData.decay || null);
    };
    load();
  }, [userId]);

  useEffect(() => {
    const socket = new WebSocket(wsUrl);
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPet(data.pet);
      setStats(data.stats);
      setAiMessage(data.ai_message);
    };
    return () => socket.close();
  }, [wsUrl]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const [petData, statsData] = await Promise.all([fetchPet(userId), fetchStats(userId)]);
      setPet(petData.pet);
      setStats(statsData);
      setAiMessage(petData.ai_message);
      setAiSuggestions(petData.ai_suggestions);
      setDecayInfo(petData.decay || null);
    }, 15000);
    return () => clearInterval(interval);
  }, [userId]);

  const onAddTask = async (title, priority, category) => {
    const newTask = await addTask(userId, title, priority, category);
    setTasks((prev) => [newTask, ...prev]);
  };

  const onToggleTask = async (task) => {
    const updated = await updateTask(task.id, userId, !task.completed);
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    // Fallback sync for cases where websocket events are delayed.
    const [petData, statsData] = await Promise.all([fetchPet(userId), fetchStats(userId)]);
    setPet(petData.pet);
    setStats(statsData);
    setAiMessage(petData.ai_message);
    setDecayInfo(petData.decay || null);
  };

  const onDeleteTask = async (taskId) => {
    await deleteTask(taskId, userId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const onPetAction = async (action) => {
    const data = await petAction(userId, action);
    setPet(data.pet);
    setStats(data.stats);
    setAiMessage(data.message);
  };

  const onChatSend = async (message) => {
    setChatMessages((prev) => [...prev, { id: Date.now(), role: "user", content: message }]);
    const petReply = await sendChat(userId, message);
    setChatMessages((prev) => [...prev, petReply]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-peach to-sky p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <StatsBar stats={stats} mood={pet?.mood} decayInfo={decayInfo} onLogout={onLogout} />
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <TaskList tasks={tasks} onAddTask={onAddTask} onToggleTask={onToggleTask} onDeleteTask={onDeleteTask} />
          <div className="space-y-4">
            <PetDisplay pet={pet} onAction={onPetAction} />
            <PetSelector userId={userId} selected={pet?.pet_type} onPetUpdated={setPet} />
            <PetChatBox messages={chatMessages} onSend={onChatSend} />
          </div>
          <AIMessageBox message={aiMessage} suggestions={aiSuggestions} />
        </div>
      </div>
    </div>
  );
}
