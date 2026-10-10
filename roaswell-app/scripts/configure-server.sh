#!/usr/bin/env bash
# Run on the server: sets the variables of the Roaswell app and starts it.
# The values are typed in here and written to the variable file of this
# directory with mode 600. They are never printed.
set -euo pipefail

cd "$(dirname "$0")/.."
target="./.env"

ask() {
  local prompt="$1" secret="${2:-no}" value
  if [ "$secret" = "yes" ]; then
    read -r -s -p "$prompt: " value
    echo >&2
  else
    read -r -p "$prompt: " value
  fi
  if [[ "$value" == *"'"* || "$value" == *$'\n'* ]]; then
    echo "The value must not contain a single quote." >&2
    exit 1
  fi
  printf '%s' "$value"
}

if [ -f "$target" ]; then
  read -r -p "$target exists. Overwrite? [y/N] " answer
  [ "$answer" = "y" ] || { echo "Nothing changed."; exit 0; }
fi

twenty_api_key="$(ask 'Twenty API key' yes)"
team_emails="$(ask 'Team email addresses, comma separated')"
smtp_host="$(ask 'SMTP host')"
smtp_port="$(ask 'SMTP port [587]')"
smtp_user="$(ask 'SMTP user')"
smtp_password="$(ask 'SMTP password' yes)"
mail_from="$(ask 'Sender address, for example Roaswell <no-reply@roaswell.com>')"

[ -n "$twenty_api_key" ] && [ -n "$team_emails" ] || { echo "API key and team addresses are required." >&2; exit 1; }

umask 077
{
  echo "TWENTY_API_KEY='$twenty_api_key'"
  echo "SESSION_SECRET='$(openssl rand -hex 32)'"
  echo "TEAM_EMAILS='$team_emails'"
  echo "SMTP_HOST='$smtp_host'"
  echo "SMTP_PORT='${smtp_port:-587}'"
  echo "SMTP_USER='$smtp_user'"
  echo "SMTP_PASSWORD='$smtp_password'"
  echo "MAIL_FROM='${mail_from:-Roaswell <no-reply@roaswell.com>}'"
} > "$target"

docker compose up -d --build
sleep 8
docker compose ps
echo "Health: $(curl -fsS http://127.0.0.1:3000/api/health 2>/dev/null || docker compose exec -T app wget -qO- http://127.0.0.1:3000/api/health)"
