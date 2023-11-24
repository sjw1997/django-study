from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from game.models.player.player import Player


class RegisterView(APIView):
    def post(self, request):
        data = request.data
        if not data:
            return Response({
                'result': 'fail',
                'error_message': '用户名和密码不能为空'
            })

        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        password_confirm = data.get('password_confirm', '').strip()
        if not username or not password:
            return Response({
                'result': 'fail',
                'error_message': '用户名和密码不能为空'
            })
        if password != password_confirm:
            return Response({
                'result': 'fail',
                'error_message': '两次密码不一致'
            })
        if User.objects.filter(username=username).exists():
            return Response({
                'result': 'fail',
                'error_message': '用户名已存在'
            })
        user = User(username=username)
        user.set_password(password)
        user.save()
        Player.objects.create(user=user, photo="https://cbu01.alicdn.com/img/ibank/2017/753/029/3810920357_1566958852.jpg")

        refresh = RefreshToken.for_user(user)

        return Response({
            'result': 'success',
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        })
