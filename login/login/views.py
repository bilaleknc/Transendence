import requests
from django.http import JsonResponse
from django.conf import settings

def index(request):
    return JsonResponse({'message': 'Hello, world!'})

def login_via_42(request):
    print("l!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!ogin_via_42 code")
    print(code)
    
    code = request.GET.get('code')
    print('codeeeeeeeeeeeeeeeeeee', code)
    if not code:
        return JsonResponse({'error': 'Code parametresi eksik'}, status=400)

    # Access token almak için OAuth bilgilerinizi kullanın
    token_url = "https://api.intra.42.fr/oauth/token"
    redirect_uri = "https://127.0.0.1:8082/42api/"
    client_id = "u-s4t2ud-0e9b5b9ed0f2110a0b29d40e22bf8249ca7f4c31681ac4a2c1582d7a5b0c790a"
    client_secret = "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" # send to settings.py
    payload = {
        'grant_type': 'authorization_code',
        'client_id': client_id,
        'client_secret': client_secret,
        'code': code,
        'redirect_uri': redirect_uri
    }

    response = requests.post(token_url, data=payload)
    if response.status_code == 200:
        token_data = response.json()
        access_token = token_data.get('access_token')
        
        # İsteğe bağlı: Access token ile kullanıcı bilgilerini al
        # user_info_url = "https://api.intra.42.fr/v2/me"
        # headers = {'Authorization': f'Bearer {access_token}'}
        # user_response = requests.get(user_info_url, headers=headers)
        # user_data = user_response.json()

        return JsonResponse({'message': 'Başarılı giriş', 'access_token': access_token})
    else:
        return JsonResponse({'error': 'Token alınamadı'}, status=response.status_code)
