@echo off
:: Update your container registry name here
SET CONTINAER_REG="velux.jfrog.io/docker-dev"

:: Update your package name here
SET PACKAGE_NAME="nginx/nginx-prometheus-exporter"

:: Update build version here
SET BUILD_VERSION=0.9.0

:: Pull image from docker.io
docker "pull" "nginx/nginx-prometheus-exporter:%BUILD_VERSION%"

:: Tag and push images to container registry
docker "tag" "%PACKAGE_NAME%:%BUILD_VERSION%" "%CONTINAER_REG%/%PACKAGE_NAME%:%BUILD_VERSION%"
docker "push" "%CONTINAER_REG%/%PACKAGE_NAME%:%BUILD_VERSION%"
