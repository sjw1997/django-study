from django.http import HttpResponse


def index(request):
    lines = [
        "<h1 style='text-align:center;'>刘诗诗</h1>",
        '<a href="other/">link</a>',
        "<img width=800 src='https://tse1-mm.cn.bing.net/th/id/OIP-C.n_LTCxfej8dRY_r_mcGK_AHaKG?pid=ImgDet&rs=1'>",
    ]
    return HttpResponse("\n".join(lines))


def other(request):
    lines = [
        '<h1 style="text-align:center;">美女</h1>',
        '<a href="/">link</a>'
        '<img src="https://ts1.cn.mm.bing.net/th/id/R-C.34bea72d6abdeb0dd5b1eb29197c93eb?rik=8b1BVSkPOriJtQ&riu=http%3a%2f%2fpic.bizhi360.com%2fbbpic%2f89%2f9689_3.jpg&ehk=j%2fd9vhFA%2fhkQPBtipNqGj2BgX6yeWHHkMVWSLfLdkz4%3d&risl=&pid=ImgRaw&r=0" />',
    ]
    return HttpResponse("\n".join(lines))