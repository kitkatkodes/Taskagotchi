from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Pet, Stats


@receiver(post_save, sender=User)
def create_game_profile(sender, instance, created, **kwargs):
    if created:
        Pet.objects.create(user=instance)
        Stats.objects.create(user=instance)
