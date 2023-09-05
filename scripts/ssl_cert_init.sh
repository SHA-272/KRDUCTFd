#!/bin/sh
certbot certonly --agree-tos -d krductf.ru -d *.krductf.ru --preferred-challenges dns --manual --server https://acme-v02.api.letsencrypt.org/directory --manual-public-ip-logging-ok
