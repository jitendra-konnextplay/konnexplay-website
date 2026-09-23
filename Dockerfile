# Serve the site ourselves, with Caddy.
#
# Why not Railway's own static hosting. It serves every file that exists
# straight from Railway's edge, so requests never reach our server. The
# password on /admin was therefore never asked for: only paths with no file
# behind them fell through to Caddy, which is why a made-up /admin/xyz asked
# for a password while /admin/index.html did not. Running Caddy in a container
# puts every request through the rules in Caddyfile, password included.
FROM caddy:2-alpine

COPY Caddyfile /etc/caddy/Caddyfile
COPY . /srv
