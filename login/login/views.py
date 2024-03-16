import requests
from django.http import JsonResponse
from django.conf import settings


def index(request):
    return JsonResponse({'message': 'Hello, world!'})

def login_via_42(request):
    code = request.GET.get('code', '')
    print("code :::  ",code)
    if code:
        try:
            print("code :::  ",code)
            data = {
				'grant_type': 'authorization_code',
				'client_id': settings.UID_42,
				'client_secret': settings.SECRET_42,
				'code': code,
				'redirect_uri': settings.REDIRECT_URI_42
			}
            response = requests.post('https://api.intra.42.fr/oauth/token', data=data)
            data = response.json()
            print(data)
            if data and data.get('message') == 'Success':
                return JsonResponse({
                    'accessToken': data.get('access'),
                    'refreshToken': data.get('refresh'), # database'e ekle dönderme
                })
            return JsonResponse({'error': 'No token found'}, status=400)
        except requests.exceptions.RequestException as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'No code provided'}, status=400)