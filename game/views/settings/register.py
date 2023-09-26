from django.contrib.auth import login
from django.http import JsonResponse
from django.contrib.auth.models import User
from game.models.player.player import Player


def register(request):
    data = request.GET
    if not data:
        return JsonResponse({
            'result': 'fail',
            'error_message': '用户名和密码不能为空'
        })

    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    password_confirm = data.get('password_confirm', '').strip()
    if not username or not password:
        return JsonResponse({
            'result': 'fail',
            'error_message': '用户名和密码不能为空'
        })
    if password != password_confirm:
        return JsonResponse({
            'result': 'fail',
            'error_message': '两次密码不一致'
        })
    if User.objects.filter(username=username).exists():
        return JsonResponse({
            'result': 'fail',
            'error_message': '用户名已存在'
        })
    user = User(username=username)
    user.set_password(password)
    user.save()
    Player.objects.create(user=user, photo="https://cbu01.alicdn.com/img/ibank/2017/753/029/3810920357_1566958852.jpg")
    login(request, user)
    return JsonResponse({
        'result': 'success'
    })
