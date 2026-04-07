from rest_framework import serializers

from .models import ChatMessage, Pet, Stats, Task


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ["id", "title", "completed", "priority", "category", "created_at"]


class PetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pet
        fields = ["pet_type", "mood", "health", "energy", "evolution_stage"]


class StatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stats
        fields = ["xp", "streak", "completed_tasks"]


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ["id", "role", "content", "created_at"]
