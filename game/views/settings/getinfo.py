from django.http import JsonResponse
from game.models.player.player import Player


def getinfo_acapp(request):
    player = Player.objects.all()[0]
    return JsonResponse({
        'result': 'success',
        'username': player.user.username,
        'photo': player.photo
    })


def getinfo_web(request):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({
            'result': '未登录'
        })

    players = Player.objects.all()
    for player in players:
        if player.user.username == user.username:
            return JsonResponse({
                'result': 'success',
                'username': player.user.username,
                'photo': player.photo
            })

    return JsonResponse({
        'result': 'fail',
        'error_message': '未找到该用户'
    })




def getinfo(request):
    if not request.GET:
        return JsonResponse({
            "result": "平台为空"
        })
    platform = request.GET.get('platform')
    if platform == "ACAPP":
        return getinfo_acapp(request)
    elif platform == "WEB":
        return getinfo_web(request)
    else:
        return JsonResponse({
            'result': '平台非法'
        })
