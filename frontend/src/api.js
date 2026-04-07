const API = "http://localhost:8000";

async function call(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Request failed");
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

export const auth = (payload) =>
  call("/auth/", { method: "POST", body: JSON.stringify(payload) });

export const fetchTasks = (userId) => call(`/tasks/?user_id=${userId}`);
export const addTask = (userId, title, priority = "medium", category = "general") =>
  call("/tasks/", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, title, priority, category }),
  });
export const updateTask = (taskId, userId, completed) =>
  call(`/tasks/${taskId}/`, {
    method: "PATCH",
    body: JSON.stringify({ user_id: userId, completed }),
  });
export const deleteTask = (taskId, userId) =>
  call(`/tasks/${taskId}/?user_id=${userId}`, { method: "DELETE" });

export const fetchPet = (userId) => call(`/pet/?user_id=${userId}`);
export const setPetType = (userId, petType) =>
  call("/pet/", {
    method: "PATCH",
    body: JSON.stringify({ user_id: userId, pet_type: petType }),
  });
export const fetchStats = (userId) => call(`/stats/?user_id=${userId}`);
export const petAction = (userId, action) =>
  call("/pet/action/", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, action }),
  });
export const fetchChat = (userId) => call(`/chat/?user_id=${userId}`);
export const sendChat = (userId, message) =>
  call("/chat/", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, message }),
  });
