###############################
# Webserver container (nginx) #
###############################
FROM nginx:alpine as web

COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY /web /usr/share/nginx/html

EXPOSE 8080
EXPOSE 8888