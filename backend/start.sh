#!/usr/bin/env bash
set -o errexit

daphne -b 0.0.0.0 -p "${PORT:-8000}" tamogatchi_backend.asgi:application
