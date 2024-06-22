# Base image olarak Nginx kullanılıyor
FROM nginx:latest

# Gerekli paketleri kur

RUN rm /etc/nginx/conf.d/default.conf

RUN apt-get update && apt-get install -y openssl
# Nginx yapılandırma dosyalarını kopyala
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY . /usr/share/nginx/html/
COPY static /usr/share/nginx/html/static

# SSL sertifikası ve anahtar dosyaları için gerekli dizinleri oluştur
RUN mkdir -p /etc/ssl/private
RUN mkdir -p /etc/ssl/certs

# SSL sertifikası ve anahtar dosyasını oluştur
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/nginx-selfsigned.key -out /etc/ssl/certs/nginx-selfsigned.crt -subj "/CN=localhost"

# Portları aç
EXPOSE 80
EXPOSE 443
EXPOSE 8082

# Nginx'i başlat
CMD ["nginx", "-g", "daemon off;"]
