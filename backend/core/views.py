import json
import os
import random
import urllib.request

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ChatMessage, Pet, Stats, Task
from .serializers import ChatMessageSerializer, PetSerializer, StatsSerializer, TaskSerializer


def get_user(user_id):
    return User.objects.filter(id=user_id).first()


def clamp(value):
    return max(0, min(100, value))


PRIORITY_MULTIPLIER = {
    "high": 1.8,
    "medium": 1.0,
    "low": 0.55,
}

PRIORITY_GRACE_HOURS = {
    "high": 6,
    "medium": 18,
    "low": 36,
}


def apply_time_decay(user):
    pet = user.pet
    now = timezone.now()
    last_decay_at = pet.last_decay_at or now
    if now <= last_decay_at:
        return {
            "health_loss": 0,
            "energy_loss": 0,
            "open_tasks": 0,
            "per_priority": {
                "high": {"count": 0, "health_loss": 0, "energy_loss": 0},
                "medium": {"count": 0, "health_loss": 0, "energy_loss": 0},
                "low": {"count": 0, "health_loss": 0, "energy_loss": 0},
            },
            "rates_per_hour": {"health": 0.0, "energy": 0.0},
        }

    open_tasks = Task.objects.filter(user=user, completed=False)
    health_loss = 0.0
    energy_loss = 0.0
    per_priority = {
        "high": {"count": 0, "health_loss": 0.0, "energy_loss": 0.0},
        "medium": {"count": 0, "health_loss": 0.0, "energy_loss": 0.0},
        "low": {"count": 0, "health_loss": 0.0, "energy_loss": 0.0},
    }
    for task in open_tasks:
        priority = task.priority if task.priority in per_priority else "medium"
        grace_hours = PRIORITY_GRACE_HOURS.get(priority, 18)
        decay_start = task.created_at + timezone.timedelta(hours=grace_hours)
        start = max(last_decay_at, decay_start)
        hours_ignored = (now - start).total_seconds() / 3600
        if hours_ignored <= 0:
            continue
        multiplier = PRIORITY_MULTIPLIER.get(priority, 1.0)
        task_health_loss = hours_ignored * 0.45 * multiplier
        task_energy_loss = hours_ignored * 0.7 * multiplier
        health_loss += task_health_loss
        energy_loss += task_energy_loss
        per_priority[priority]["count"] += 1
        per_priority[priority]["health_loss"] += task_health_loss
        per_priority[priority]["energy_loss"] += task_energy_loss

    health_drop = int(health_loss)
    energy_drop = int(energy_loss)
    if open_tasks.exists() and health_loss > 0 and health_drop == 0:
        health_drop = 1
    if open_tasks.exists() and energy_loss > 0 and energy_drop == 0:
        energy_drop = 1

    pet.health = clamp(pet.health - health_drop)
    pet.energy = clamp(pet.energy - energy_drop)
    if pet.energy < 30:
        pet.mood = "tired"
    if pet.health < 35:
        pet.mood = "sad"
    if not open_tasks.exists():
        pet.mood = "happy"
    pet.last_decay_at = now
    pet.save()
    overdue_counts = {
        "high": 0,
        "medium": 0,
        "low": 0,
    }
    for task in open_tasks:
        priority = task.priority if task.priority in overdue_counts else "medium"
        grace_hours = PRIORITY_GRACE_HOURS.get(priority, 18)
        if now >= task.created_at + timezone.timedelta(hours=grace_hours):
            overdue_counts[priority] += 1

    rates_per_hour = {
        "health": round(sum(0.45 * PRIORITY_MULTIPLIER.get(k, 1.0) * overdue_counts[k] for k in overdue_counts), 2),
        "energy": round(sum(0.7 * PRIORITY_MULTIPLIER.get(k, 1.0) * overdue_counts[k] for k in overdue_counts), 2),
    }
    rounded_per_priority = {
        key: {
            "count": value["count"],
            "health_loss": int(value["health_loss"]),
            "energy_loss": int(value["energy_loss"]),
        }
        for key, value in per_priority.items()
    }
    return {
        "health_loss": health_drop,
        "energy_loss": energy_drop,
        "open_tasks": open_tasks.count(),
        "per_priority": rounded_per_priority,
        "overdue_counts": overdue_counts,
        "rates_per_hour": rates_per_hour,
    }


def ai_message_for(stats, pet):
    if stats.streak >= 5:
        return f"Your {pet.pet_type} is proud of your streak. Keep shining!"
    if pet.mood == "sad":
        return "Your buddy misses you. One tiny task can cheer it up!"
    return random.choice(
        [
            "Small steps build big wins. Your pet believes in you!",
            "You did great. Ready for one more mission?",
            "Your focus feeds your pet's happiness today.",
        ]
    )


def ai_suggestions():
    return [
        "Drink water and stretch for 5 minutes",
        "Tidy your desk for 10 minutes",
        "Write tomorrow's top 3 priorities",
    ]


def calculate_badges(stats):
    badges = []
    if stats.completed_tasks >= 1:
        badges.append("Starter Spark")
    if stats.completed_tasks >= 5:
        badges.append("Momentum Maker")
    if stats.streak >= 7:
        badges.append("7-Day Guardian")
    if stats.xp >= 150:
        badges.append("Focus Hero")
    return badges


def pet_persona_prompt(user, pet, stats):
    return (
        f"You are a cute Tamagotchi-like pet named {pet.pet_type}. "
        f"Current mood={pet.mood}, health={pet.health}, energy={pet.energy}, "
        f"user streak={stats.streak}, user xp={stats.xp}. "
        "Reply in 1-3 short lines, warm and playful, with one actionable productivity tip."
    )


def is_affirmative(text):
    text = text.lower().strip()
    return text in {"yes", "y", "yeah", "yup", "sure", "ok", "okay", "let's go", "lets go", "do it"}


def is_negative(text):
    text = text.lower().strip()
    return text in {"no", "nah", "not now", "later", "skip"}


def next_missions(user):
    open_tasks = list(Task.objects.filter(user=user, completed=False).order_by("-created_at")[:3])
    if open_tasks:
        return [f"Complete: {t.title}" for t in open_tasks]
    return [
        "Do a 10-minute focus sprint on one tiny task",
        "Clean your desk for 5 minutes",
        "Write your top 3 priorities for tomorrow",
    ]


def local_pet_reply(user, message, pet, stats, last_done_title=None):
    lower = message.lower()
    missions = next_missions(user)
    top_mission = missions[stats.completed_tasks % len(missions)]
    recent_chat = list(ChatMessage.objects.filter(user=user).order_by("-created_at")[:6])
    last_pet_text = next((m.content.lower() for m in recent_chat if m.role == "pet"), "")

    if is_affirmative(message):
        return (
            f"Yay! Mission accepted.\n"
            f"Step 1: {top_mission}\n"
            "Step 2: Work for 10 minutes, then come back and say 'done'."
        )
    if is_negative(message):
        return "No worries. Let's go super tiny: 2 minutes only. Start now, I will still cheer for you."
    if "done" in lower and "step" in last_pet_text:
        return "Amazing follow-through! I am proud of you. Want me to queue your next mission?"
    if stats.completed_tasks >= 1 and any(k in lower for k in ["done", "completed", "finish", "finished", "did it"]):
        title = f" “{last_done_title}”" if last_done_title else ""
        return f"Yay!! You completed{title}! Let's pick the next tiny win to keep our streak alive."
    if stats.completed_tasks >= 1 and "what" in lower and "next" in lower:
        return f"Next quest idea: {top_mission}. Tiny + consistent = evolution time."
    if "tired" in lower or "burnout" in lower:
        return "Let's do a tiny 5-minute task together, then rest. I believe in you."
    if "study" in lower or "work" in lower:
        return "Mission mode activated. Start with the smallest next step, then tell me how it went!"
    if stats.completed_tasks >= 1 and stats.streak >= 1:
        return f"Look at you go! {stats.completed_tasks} completed so far. Want a quick 10-minute follow-up task?"
    if stats.streak >= 5:
        return "You're on a hot streak! Keep the chain alive with one quick win right now."
    if pet.mood == "sad":
        return "I miss your progress spark. One completed task will cheer us both up."
    return random.choice(
        [
            "I am cheering for you! Try a 10-minute focus sprint now.",
            "You and me vs procrastination. Pick one tiny task and crush it.",
            "Let's level up together. Finish one task, then come back for a celebration.",
        ]
    )


def ai_pet_chat_reply(user, message):
    pet = user.pet
    stats = user.stats
    last_done = (
        Task.objects.filter(user=user, completed=True).order_by("-created_at").values_list("title", flat=True).first()
    )
    history = list(ChatMessage.objects.filter(user=user).order_by("-created_at")[:10])
    history = list(reversed(history))
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        return local_pet_reply(user, message, pet, stats, last_done_title=last_done)

    base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    messages = [
        {
            "role": "system",
            "content": pet_persona_prompt(user, pet, stats)
            + (f" The user's most recently completed task was: {last_done}." if last_done else "")
            + " Keep continuity with prior chat context. Do not repeat the same sentence if user says yes/no."
            + " If user agrees, give a specific 2-step mission."
            + " If user says done, celebrate and give exactly one next mission.",
        }
    ]
    for m in history:
        messages.append({"role": "assistant" if m.role == "pet" else "user", "content": m.content})
    messages.append({"role": "user", "content": message})

    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.8,
    }
    req = urllib.request.Request(
        f"{base_url}/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=12) as res:
            data = json.loads(res.read().decode("utf-8"))
            return data["choices"][0]["message"]["content"].strip()
    except Exception:
        return local_pet_reply(user, message, pet, stats, last_done_title=last_done)


def push_pet_update(user_id):
    user = get_user(user_id)
    if not user:
        return
    payload = {
        "pet": PetSerializer(user.pet).data,
        "stats": StatsSerializer(user.stats).data,
        "ai_message": ai_message_for(user.stats, user.pet),
    }
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"pet_{user_id}", {"type": "pet_update", "payload": payload}
    )


class AuthView(APIView):
    def post(self, request):
        action = request.data.get("action")
        username = request.data.get("email", "").strip().lower()
        password = request.data.get("password", "")
        if not username or not password:
            return Response({"error": "Email and password required."}, status=400)

        if action == "register":
            if User.objects.filter(username=username).exists():
                return Response({"error": "User already exists."}, status=400)
            user = User.objects.create_user(username=username, password=password, email=username)
            return Response({"user_id": user.id, "email": user.username})

        user = User.objects.filter(username=username).first()
        if not user or not user.check_password(password):
            return Response({"error": "Invalid credentials."}, status=401)
        return Response({"user_id": user.id, "email": user.username})


class TaskListView(APIView):
    def get(self, request):
        user = get_user(request.query_params.get("user_id"))
        if not user:
            return Response({"error": "Invalid user."}, status=400)
        tasks = Task.objects.filter(user=user).order_by("-created_at")
        return Response(TaskSerializer(tasks, many=True).data)

    def post(self, request):
        user = get_user(request.data.get("user_id"))
        title = request.data.get("title", "").strip()
        priority = request.data.get("priority", "medium")
        category = request.data.get("category", "general")
        if not user or not title:
            return Response({"error": "Invalid payload."}, status=400)
        task = Task.objects.create(user=user, title=title, priority=priority, category=category)
        push_pet_update(user.id)
        return Response(TaskSerializer(task).data, status=status.HTTP_201_CREATED)


class TaskDetailView(APIView):
    def patch(self, request, task_id):
        user = get_user(request.data.get("user_id"))
        if not user:
            return Response({"error": "Invalid user."}, status=400)
        task = Task.objects.filter(id=task_id, user=user).first()
        if not task:
            return Response({"error": "Task not found."}, status=404)

        completed = request.data.get("completed")
        if completed is None:
            return Response({"error": "completed is required."}, status=400)

        if not task.completed and completed is True:
            stats = user.stats
            pet = user.pet
            stats.xp += 10
            stats.streak += 1
            stats.completed_tasks += 1
            pet.health = clamp(pet.health + 6)
            pet.energy = clamp(pet.energy + 5)
            pet.mood = "happy"
            if stats.completed_tasks >= 10:
                pet.evolution_stage = 3
            elif stats.completed_tasks >= 5:
                pet.evolution_stage = 2
            stats.save()
            pet.save()
            push_pet_update(user.id)

        task.completed = bool(completed)
        task.save()
        push_pet_update(user.id)
        return Response(TaskSerializer(task).data)

    def delete(self, request, task_id):
        user = get_user(request.query_params.get("user_id"))
        if not user:
            return Response({"error": "Invalid user."}, status=400)
        task = Task.objects.filter(id=task_id, user=user).first()
        if not task:
            return Response({"error": "Task not found."}, status=404)
        task.delete()
        push_pet_update(user.id)
        return Response(status=204)


class PetView(APIView):
    def get(self, request):
        user = get_user(request.query_params.get("user_id"))
        if not user:
            return Response({"error": "Invalid user."}, status=400)
        decay = apply_time_decay(user)
        pet = user.pet
        return Response({
            "pet": PetSerializer(pet).data,
            "ai_message": ai_message_for(user.stats, pet),
            "ai_suggestions": ai_suggestions(),
            "badges": calculate_badges(user.stats),
            "decay": decay,
        })

    def patch(self, request):
        user = get_user(request.data.get("user_id"))
        pet_type = request.data.get("pet_type")
        if not user or not pet_type:
            return Response({"error": "Invalid payload."}, status=400)
        user.pet.pet_type = pet_type
        user.pet.save()
        push_pet_update(user.id)
        return Response(PetSerializer(user.pet).data)


class StatsView(APIView):
    def get(self, request):
        user = get_user(request.query_params.get("user_id"))
        if not user:
            return Response({"error": "Invalid user."}, status=400)
        data = StatsSerializer(user.stats).data
        data["badges"] = calculate_badges(user.stats)
        return Response(data)


class PetActionView(APIView):
    def post(self, request):
        user = get_user(request.data.get("user_id"))
        action = request.data.get("action", "")
        if not user or action not in {"feed", "play", "rest"}:
            return Response({"error": "Invalid payload."}, status=400)

        pet = user.pet
        stats = user.stats
        if action == "feed":
            pet.health = clamp(pet.health + 10)
            pet.energy = clamp(pet.energy + 3)
            stats.xp += 3
        elif action == "play":
            pet.mood = "happy"
            pet.energy = clamp(pet.energy - 6)
            stats.xp += 5
        elif action == "rest":
            pet.energy = clamp(pet.energy + 12)
            pet.mood = "tired" if pet.energy < 30 else "happy"
            stats.xp += 2
        pet.save()
        stats.save()
        push_pet_update(user.id)
        return Response(
            {
                "pet": PetSerializer(pet).data,
                "stats": StatsSerializer(stats).data,
                "message": f"{pet.pet_type.capitalize()} enjoyed {action} time!",
            }
        )


class ChatView(APIView):
    def get(self, request):
        user = get_user(request.query_params.get("user_id"))
        if not user:
            return Response({"error": "Invalid user."}, status=400)
        history = ChatMessage.objects.filter(user=user).order_by("-created_at")[:20]
        history = list(reversed(history))
        return Response(ChatMessageSerializer(history, many=True).data)

    def post(self, request):
        user = get_user(request.data.get("user_id"))
        message = request.data.get("message", "").strip()
        if not user or not message:
            return Response({"error": "Invalid payload."}, status=400)

        ChatMessage.objects.create(user=user, role="user", content=message)
        reply = ai_pet_chat_reply(user, message)
        pet_msg = ChatMessage.objects.create(user=user, role="pet", content=reply)
        return Response(ChatMessageSerializer(pet_msg).data, status=201)
