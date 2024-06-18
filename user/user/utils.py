import requests
import os
import pyotp
from datetime import datetime, timedelta
from django.contrib.auth.models import User
from django.core.mail import send_mail
from user.models import VerificationCode

def getUserbyPlatform(token, platform):
    if platform == '42':
        base_url = 'https://api.intra.42.fr'
        headers = {
            'Authorization': f'Bearer {token}'
        }

        try:
            response = requests.get(f'{base_url}/v2/me', headers=headers)
            if response.status_code == 200:
                print('Kullanıcı bilgileri alındı.')
                data = response.json()
            else:
                print('Kullanıcı bilgileri alınamadı.')

        except Exception as e:
            print('Hata:', e)

    elif platform == 'google':
        base_url = 'https://www.googleapis.com/oauth2/v1/userinfo'
        headers = {
            'Authorization': f'Bearer {token}'
        }

        try:
            response = requests.get(f'{base_url}', headers=headers)
            if response.status_code == 200:
                print('Kullanıcı bilgileri alındı.')
                data = response.json()
            else:
                print('Kullanıcı bilgileri alınamadı.')

        except Exception as e:
            print('Hata:', e)

    return data



def generate_otp():
    totp = pyotp.TOTP(pyotp.random_base32(), interval=60)
    otp = totp.now()
    expired_date = datetime.now() + timedelta(minutes=1)

    return {'otp': otp, 'otp_expired_date': expired_date}


def send_email(user):
    otp_code = generate_otp()
    receiver = user.email
    subject = 'Transcendence Email Verification'
    message = f'''
    Hello {user.username},

    You can use the following one-time code to verify your Transcendence account:

    Verification Code: {otp_code['otp']}

    This code will help you securely verify your account.

    Regards,
    Transcendence Team
    '''
    from_email = os.getenv("EMAIL_HOST_USER")
    recipient_list = [receiver]
    send_mail(subject, message, from_email, recipient_list)

    VerificationCode.objects.create(code=otp_code['otp'], expired_date=otp_code['otp'], user=user.profile)




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
