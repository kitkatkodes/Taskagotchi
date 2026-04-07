from django.contrib import admin

from .models import ChatMessage, Pet, Stats, Task

admin.site.register(Pet)
admin.site.register(Stats)
admin.site.register(Task)
admin.site.register(ChatMessage)
