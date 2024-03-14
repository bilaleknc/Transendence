FROM postgres:latest

COPY postgresql.conf /var/lib/tmp

EXPOSE 8083

CMD ["postgres", "-c", "shared_buffers=256MB", "-c", "max_connections=200"]