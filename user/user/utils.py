import requests

def getUser(token):
    base_url = 'https://api.intra.42.fr'
    headers = {
        'Authorization': f'Bearer {token}'
    }

    try:
        response = requests.get(f'{base_url}/v2/me', headers=headers)
        
        if response.status_code == 200:
            print('Kullanıcı bilgileri:')
            data = response.json()
            print(data)
        else:
            print('Kullanıcı bilgileri alınamadı.')
    
    except Exception as e:
        print('Hata:', e)

# def createUser():
#     #database ekleme işlemi yapılacak
#     #kullanıcı bilgileri alınacak
#     user = getUser

# def updateUser():


# def controlUser(data):
#     if data and data.get('access_token'):
#         #database de var mı kontrol et
#         #varsa kullanıcı zaten kayıtlı mesajı ver
#         #yoksa kayıt et
#     else:
#         #hata mesajı ver
