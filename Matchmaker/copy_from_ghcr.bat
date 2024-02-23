@echo off
:: Update your container registry name here
SET CONTINAER_REG="velux.jfrog.io/docker-dev/ccoe/vds"

:: Update your package name here
SET PACKAGE_NAME="matchmaker"

:: Update build version here
SET BUILD_VERSION=4.27e

docker pull ghcr.io/oracle-quickstart/oke-unreal-pixel-streaming/matchmaker:latest

:: Tag and push images to container registry
docker "tag" "matchmaker:latest" "%CONTINAER_REG%/%PACKAGE_NAME%:%BUILD_VERSION%"
docker "push" "%CONTINAER_REG%/%PACKAGE_NAME%:%BUILD_VERSION%"
