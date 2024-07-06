# 42 api authentication

from requests_oauthlib import OAuth2Session

# 42 API'nin temel URL'si
base_url = 'https://api.intra.42.fr'

# Uygulama kimlik bilgileri
client_id = 'u-s4t2ud-8a568d1e373646e7c049724f8c1e0104003bbeace881ab7594d5efa5c584b251'
client_secret = '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'
redirect_uri = 'https://45.157.16.17:8082'

# İstek yapılacak URL'ler
authorization_base_url = f'{base_url}/oauth/authorize'
token_url = f'{base_url}/oauth/token'

# OAuth2 oturumunu oluştur
oauth = OAuth2Session(client_id, redirect_uri=redirect_uri)

# Kullanıcıyı doğrulama URL'sine yönlendir
authorization_url, state = oauth.authorization_url(authorization_base_url)

print('Lütfen şu URL\'ye gidin ve yetkilendirme işlemini gerçekleştirin:')
print(authorization_url)

# Kullanıcıdan dönen doğrulama kodunu al
authorization_response = input('Doğrulama kodunu girin: ')

# Doğrulama kodu ile erişim belirteci al
token = oauth.fetch_token(token_url, authorization_response=authorization_response,
                          client_secret=client_secret)

# Artık token ile API'ye istek yapabilirsiniz
response = oauth.get(f'{base_url}/v2/me')

if response.status_code == 200:
    print('Kullanıcı bilgileri:')
    data = response.json()
    print(data)
else:
    print('Kullanıcı bilgileri alınamadı.')
