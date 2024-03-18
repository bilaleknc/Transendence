# Base image olarak Python 3.9 slim sürümünü kullan
FROM python:3.9-slim

# Ortam değişkenlerini ayarla
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Çalışma dizinini oluştur
WORKDIR /app

# Bağımlılıkları kur
COPY certs/certificate.crt /etc/ssl/certs/certificate.crt
COPY certs/certificate.key /etc/ssl/private/certificate.key
COPY requirements.txt .

RUN apt-get update && apt-get install -y postgresql-client
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install requests psycopg2-binary djangorestframework

COPY . .

# Veritabanı migrasyonlarını yap
# RUN python3 manage.py makemigrations

# Uygulama için gerekli portu aç
EXPOSE 8080

# Django uygulamasını başlatma komutu
CMD python3 manage.py runserver 0.0.0.0:8080