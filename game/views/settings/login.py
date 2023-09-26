from django.contrib.auth import authenticate, login
from django.http import JsonResponse



def signin(request):
    data = request.GET
    if not data:
        return JsonResponse({
            "result": "fail",
            "error_message": "用户名和密码不能为空"
        })


    username = data.get('username')
    password = data.get('password')
    user = authenticate(username=username, password=password)

    if not user:
        return JsonResponse({
            "result": "fail",
            "error_message": "用户名或密码错误"
        })

    login(request, user)
    return JsonResponse({
        "result": "success"
    })
