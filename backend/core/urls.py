from django.urls import path

from .views import (
    AuthView,
    ChatView,
    PetActionView,
    PetView,
    StatsView,
    TaskDetailView,
    TaskListView,
)

urlpatterns = [
    path("auth/", AuthView.as_view()),
    path("tasks/", TaskListView.as_view()),
    path("tasks/<int:task_id>/", TaskDetailView.as_view()),
    path("pet/", PetView.as_view()),
    path("pet/action/", PetActionView.as_view()),
    path("stats/", StatsView.as_view()),
    path("chat/", ChatView.as_view()),
]
