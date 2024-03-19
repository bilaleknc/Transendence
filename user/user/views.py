import requests
from django.http import JsonResponse
from django.conf import settings
from user.utils import getUser

def index(request):
    return JsonResponse({'message': 'Hello, world!'})

def login_via_42(request):
    print()
    code = request.GET.get('code', '')
    print(code)
    if code:
        try:
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
            if data and data.get('access_token'):
                user = getUser(data.get('access_token'))
                print(user)
                return JsonResponse({
                    'accessToken': data.get('access_token'),
                    'refreshToken': data.get('refresh_token'), 
                })
            return JsonResponse({'error': 'No token found'}, status=400)
        except requests.exceptions.RequestException as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'No code provided'}, status=400)