# 42 api authentication

from requests_oauthlib import OAuth2Session

# 42 API'nin temel URL'si
base_url = 'https://api.intra.42.fr'

# Uygulama kimlik bilgileri
client_id = 'u-s4t2ud-0e9b5b9ed0f2110a0b29d40e22bf8249ca7f4c31681ac4a2c1582d7a5b0c790a'
client_secret = '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'
redirect_uri = 'https://127.0.0.1:8082'

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
