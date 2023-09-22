from django.urls import path
from game.views import index, other

urlpatterns = [
    path("", index, name="index"),
    path("other/", other, name="other"),
]
