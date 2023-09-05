#!/bin/sh
docker network create --driver bridge --subnet 10.0.0.0/24 --gateway 10.0.0.1 ctfnet
