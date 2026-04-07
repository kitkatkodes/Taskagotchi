from django.urls import re_path

from .consumers import PetConsumer

websocket_urlpatterns = [
    re_path(r"ws/pet/(?P<user_id>\d+)/$", PetConsumer.as_asgi()),
]
