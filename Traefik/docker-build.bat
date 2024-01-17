@echo off
:: Update your container registry name here
SET CONTINAER_REG="velux.jfrog.io/docker-dev/ccoe/vds"

:: Update your package name here
SET PACKAGE_NAME="traefik"

:: Update build version here
SET BUILD_VERSION=v2.5

:: Pull image from docker.io
docker "pull" "%PACKAGE_NAME%:%BUILD_VERSION%"

:: Tag and push images to container registry
docker "tag" "%PACKAGE_NAME%:%BUILD_VERSION%" "%CONTINAER_REG%/%PACKAGE_NAME%:%BUILD_VERSION%"
docker "push" "%CONTINAER_REG%/%PACKAGE_NAME%:%BUILD_VERSION%"
