FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf
#COPY certs     /etc/nginx/certs

COPY . /usr/share/nginx/html/
COPY static /usr/share/nginx/html/static
EXPOSE 8082
CMD ["nginx", "-g", "daemon off;"]