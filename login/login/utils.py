from urllib import request
from django.conf import settings

def getUser(token):
	try:
		response = request.get('https://api.intra.42.fr/v2/me', headers={'Authorization': 'Bearer ' + token})
		return response.json()
	except:
		return "No user found"


# 42 api authentication

from requests_oauthlib import OAuth2Session

# # 42 API'nin temel URL'si
base_url = 'https://api.intra.42.fr'

# # İstek yapılacak URL'ler
authorization_base_url = f'{base_url}/oauth/authorize'
token_url = f'{base_url}/oauth/token'

# # OAuth2 oturumunu oluştur
oauth = OAuth2Session(settings.UID_42, redirect_uri=settings.REDIRECT_URI_42)

# # Kullanıcıyı doğrulama URL'sine yönlendir
authorization_url, state = oauth.authorization_url(authorization_base_url)

# print('Lütfen şu URL\'ye gidin ve yetkilendirme işlemini gerçekleştirin:')
print(authorization_url)

# # Kullanıcıdan dönen doğrulama kodunu al
authorization_response = input('Doğrulama kodunu girin: ')

# # Doğrulama kodu ile erişim belirteci al
token = oauth.fetch_token(token_url, authorization_response=authorization_response,
                           client_secret=settings.SECRET_42)

# # Artık token ile API'ye istek yapabilirsiniz
response = oauth.get(f'{base_url}/v2/me')

if response.status_code == 200:
    print('Kullanıcı bilgileri:')
    data = response.json()
    print(data)
else:
    print('Kullanıcı bilgileri alınamadı.')
