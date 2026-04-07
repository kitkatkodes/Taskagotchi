from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone


PET_TYPES = [
    ("neko", "Neko"),
    ("piyo", "Piyo"),
    ("kuma", "Kuma"),
]

MOOD_CHOICES = [
    ("happy", "Happy"),
    ("sad", "Sad"),
    ("tired", "Tired"),
]


class Pet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="pet")
    pet_type = models.CharField(max_length=20, choices=PET_TYPES, default="neko")
    mood = models.CharField(max_length=20, choices=MOOD_CHOICES, default="happy")
    health = models.IntegerField(default=80)
    energy = models.IntegerField(default=80)
    evolution_stage = models.IntegerField(default=1)
    last_decay_on = models.DateField(default=timezone.now)
    last_decay_at = models.DateTimeField(default=timezone.now)


class Stats(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="stats")
    xp = models.IntegerField(default=0)
    streak = models.IntegerField(default=0)
    completed_tasks = models.IntegerField(default=0)


class Task(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=255)
    completed = models.BooleanField(default=False)
    priority = models.CharField(max_length=20, default="medium")
    category = models.CharField(max_length=50, default="general")
    created_at = models.DateTimeField(auto_now_add=True)


class ChatMessage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chat_messages")
    role = models.CharField(max_length=20)  # user | pet
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
