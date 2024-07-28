import requests
import os
import pyotp
from datetime import datetime, timedelta
from django.contrib.auth.models import User
from django.core.mail import send_mail as django_send_mail
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
    expired_date = datetime.now() + timedelta(minutes=3)
    print("OTP:!!!!! ", otp)
    return {'otp': otp, 'otp_expired_date': expired_date}

def send_custom_mail(subject, message, from_email, recipient_list):
    """
    This function sends an email using Django's send_mail function, ensuring all strings are utf-8 encoded.
    
    Parameters:
    - subject: The subject of the email
    - message: The body of the email
    - from_email: The sender's email address
    - recipient_list: A list of recipient email addresses
    """
    try:
        # Ensure the subject, message, and from_email are encoded in 'utf-8'
        subject_encoded = subject.encode('utf-8')
        message_encoded = message.encode('utf-8')
        from_email_encoded = from_email.encode('utf-8') if from_email else from_email

        django_send_mail(
            subject=subject_encoded.decode('utf-8'),  # Decode back to string for Django compatibility
            message=message_encoded.decode('utf-8'),
            from_email=from_email_encoded.decode('utf-8') if from_email_encoded else None,
            recipient_list=recipient_list,
            fail_silently=False,
        )
        print("Email sent successfully")
    except Exception as e:
        print(f"An error occurred: {e}")

def generate_email(user):
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
    send_custom_mail(subject, message, from_email, recipient_list)
    VerificationCode.objects.create(code=otp_code['otp'], expired_date=otp_code['otp_expired_date'], user=user.profile)

def twoFactor(user):
	if not user:
		return
	otp_code = generate_otp()
	receiver = user.email
	subject = 'Transcendence Email Verification'
	message = f'''
	Hello {user.username},

    You can use the one-time code below to log in to your Transcendence account:

    Verification Code: {otp_code['otp']}

    This code will help you log in to your account securely.

    Regards,
    Transcendence Team
    '''
	from_email = os.getenv("EMAIL")
	recipient_list = [receiver]
	print(receiver)
	print("sent emailden önce")
	print(receiver, subject, message, from_email, recipient_list)
	send_custom_mail(subject, message, from_email, recipient_list)
	print("sent emailden sonra")
	verificationCode = VerificationCode.objects.get(user=user.profile)
	verificationCode.code = otp_code['otp']
	verificationCode.expired_date = otp_code['otp_expired_date']
	verificationCode.save()
