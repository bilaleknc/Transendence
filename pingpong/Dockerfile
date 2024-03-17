# Base image olarak Python 3.9 slim sürümünü kullan
FROM python:3.9-slim
WORKDIR /app


# PostgreSQL client'ı kur
RUN apt-get update && apt-get install -y postgresql-client
RUN apt-get install -y postgresql postgresql-contrib
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt
RUN /etc/init.d/postgresql start &&\
    psql --command "CREATE USER docker WITH SUPERUSER PASSWORD 'docker';" &&\
    createdb -O docker docker
RUN python3 manage.py makemigrations > log/makemigrations.log
RUN python3 manage.py migrate > log/migrate.log


COPY . .


# Veritabanı migrasyonlarını yap
RUN python3 manage.py makemigrations

# Uygulama için gerekli portu aç
EXPOSE 8081

# Django uygulamasını başlatma komutu
CMD ["python3", "manage.py", "runserver", "0.0.0.0:8081"]