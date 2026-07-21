# Bergeerd Deployment — `bergeerd.ir`

Deployment of the React (Vite + TS + shadcn) static site, replicating the
existing `comode` (comodeconcept.ir) architecture on server `5.57.39.207`.

**Status: ✅ LIVE** — `https://bergeerd.ir` and `https://www.bergeerd.ir` are
serving over HTTPS with a valid Let's Encrypt certificate, Force SSL, HTTP/2,
and HSTS, all verified.

---

## 1. Architecture (replicated from comode)

```
                    ┌──────────────────────────────────────────────┐
   Client ─── HTTPS │  Nginx Proxy Manager (container)             │
                    │  image: jc21/nginx-proxy-manager:latest      │
                    │  ports: 80, 443, 81(admin)                   │
                    │  - terminates SSL (Let's Encrypt cert npm-29)│
                    │  - reverse proxies bergeerd.ir -> bergeerd   │
                    │    -nginx:80                                 │
                    │  - Force SSL + HSTS + HTTP/2                 │
                    └───────────────┬──────────────────────────────┘
                                    │ proxy-net (docker bridge network)
                            ┌───────▼──────────────┐
                            │ bergeerd-nginx        │
                            │ image: nginx:1.27-alpine
                            │ serve /usr/share/nginx/html (static dist)
                            │ expose 80 (internal only)
                            └───────────────────────┘
```

Mirrors `comode` exactly:
| Component | comode | bergeerd |
|-----------|--------|----------|
| Static container | `comode-nginx` | `bergeerd-nginx` |
| Host dir | `/opt/comode` | `/opt/bergeerd` |
| Network | `proxy-net` | `proxy-net` |
| NPM proxy host | `1` (comodeconcept.ir) | `4` (bergeerd.ir + www) |
| NPM custom cert | `npm-27` | `npm-29` |
| SSL | Let's Encrypt (manual DNS-01) | Let's Encrypt (manual DNS-01) |
| Certbot on | host (2.9.0) | host (2.9.0) |

---

## 2. Server commands executed

### 2.1 Build (local)
```bash
npm run build          # produces dist/
# vite.config.ts base changed from "/." to "/" for root-domain serving
```

### 2.2 Connect (non-interactive, password via file)
```bash
sshpass -f .sshpw ssh -p 3939 root@5.57.39.207 '...'
sshpass -f .sshpw scp -P 3939 ... root@5.57.39.207:...
```

### 2.3 Inspect existing comode (read-only)
- `docker ps`, `docker network ls`
- `find /opt/comode`, `find /opt/nginx-proxy-manager`
- Read: comode `docker-compose.yml`, `nginx/default.conf`,
  NPM `docker-compose.yml`, NPM proxy_host/1.conf, certbot hooks,
  Let's Encrypt renewal config, seed_admin.py

### 2.4 Deploy bergeerd
```bash
# Directory structure
mkdir -p /opt/bergeerd/web/assets /opt/bergeerd/nginx /opt/certs/bergeerd

# Upload configs + dist
scp deploy/nginx-default.conf  root@...:/opt/bergeerd/nginx/default.conf
scp deploy/docker-compose.yml  root@...:/opt/bergeerd/docker-compose.yml
scp -r dist/*                  root@...:/opt/bergeerd/web/

# Start container
cd /opt/bergeerd && docker compose up -d
```

### 2.5 Internal verify (passed)
- `docker exec bergeerd-nginx curl -sI http://localhost/` -> HTTP 200
- `docker exec nginx-proxy-manager curl ... http://bergeerd-nginx/` -> HTTP 200

---

## 3. Configuration files

### 3.1 `/opt/bergeerd/nginx/default.conf`
(Identical to comode's) — SPA fallback (`try_files $uri $uri/ /index.html`),
gzip, long-cache for `/assets/`. See local copy at `deploy/nginx-default.conf`.

### 3.2 `/opt/bergeerd/docker-compose.yml`
```yaml
services:
  nginx:
    image: nginx:1.27-alpine
    container_name: bergeerd-nginx
    restart: unless-stopped
    expose:
      - "80"
    volumes:
      - ./web:/usr/share/nginx/html:ro
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - /opt/certs/bergeerd:/certs/bergeerd:ro
    networks:
      - proxy-net
networks:
  proxy-net:
    external: true
```

### 3.3 On-server scripts (created via heredoc)
- `/root/certbot-auth-hook.sh` — manual DNS-01 auth hook; writes challenge
  data to `/root/dns-challenge-info.txt`, waits for `/root/dns-challenge-go`.
- `/root/certbot-cleanup-hook.sh` — cleanup hook, removes signal files.
- `/etc/letsencrypt/renewal-hooks/deploy/bergeerd-npm-sync.sh` — deploy hook:
  after renewal, copies the new cert into NPM `npm-29` and reloads NPM nginx.

---

## 4. DNS records (Cloudflare)

`bergeerd.ir` was migrated from Liara to **Cloudflare** (nameservers
`carmelo.ns.cloudflare.com` / `martha.ns.cloudflare.com`, set at the iranic
registrar). Confirmed active.

| Type | Name | Content | Proxy status |
|------|------|---------|--------------|
| A | `bergeerd.ir` (@) | `5.57.39.207` | **DNS only** (grey cloud) |
| CNAME | `www` | `bergeerd.ir` | **DNS only** (grey cloud) |

> Why DNS-only: the origin must be reached directly for the Let's Encrypt
> DNS-01 / cert flow and so NPM's TLS is the authoritative one. (Mirrors
> comode, whose A record is also DNS-only to the server.)

### Verify (passed):
```
dig NS bergeerd.ir +short     -> carmelo.ns.cloudflare.com / martha...
dig A  bergeerd.ir +short     -> 5.57.39.207
dig A  www.bergeerd.ir +short -> 5.57.39.207   (via CNAME -> bergeerd.ir)
```

---

## 5. Cloudflare settings

| Setting | Value |
|---------|-------|
| SSL/TLS encryption mode | **Full** (origin has a valid LE cert; Full strict also OK) |
| Always Use HTTPS | ON |
| Automatic HTTPS Rewrites | ON (optional) |
| HSTS | enforced at origin (NPM), not required at CF edge |

---

## 6. SSL — Let's Encrypt via manual DNS-01

**Why not HTTP-01 / NPM-issued:** Let's Encrypt's validation servers cannot
reach port 80 on this Iranian datacenter ("Timeout during connect, likely
firewall problem"). Cloudflare's API is also unreachable from the server
(HTTP 000), so automated Cloudflare DNS-01 failed too. The working path
(matching comode exactly) is **manual DNS-01 via host certbot**.

### How it works
1. `certbot certonly --manual --preferred-challenges dns \
     -d bergeerd.ir -d www.bergeerd.ir` (run on host, hooks attached).
2. The auth hook writes the required TXT record value to
   `/root/dns-challenge-info.txt` and pauses.
3. The operator adds that TXT record in Cloudflare:
   `_acme-challenge.bergeerd.ir` (and `_acme-challenge.www.bergeerd.ir`).
4. Operator creates the signal file `touch /root/dns-challenge-go` to continue.
5. certbot validates, issues the cert at `/etc/letsencrypt/live/bergeerd.ir/`.

### Certificate (issued & valid)
- Path: `/etc/letsencrypt/live/bergeerd.ir/`
- Subject: `CN=bergeerd.ir`
- Issuer: `Let's Encrypt` (CN=YE2)
- Valid: `2026-07-15` → **`2026-10-13`** (90 days)

### Import into NPM
The host certbot cert is NOT visible inside the NPM container (its
`/etc/letsencrypt` maps to a different host dir). So the resolved cert files
were copied into the NPM data volume:
```bash
mkdir -p /opt/nginx-proxy-manager/data/custom_ssl/npm-29
cp -L /etc/letsencrypt/live/bergeerd.ir/fullchain.pem \
      /opt/nginx-proxy-manager/data/custom_ssl/npm-29/fullchain.pem
cp -L /etc/letsencrypt/live/bergeerd.ir/privkey.pem  \
      /opt/nginx-proxy-manager/data/custom_ssl/npm-29/privkey.pem
chmod 644 /opt/nginx-proxy-manager/data/custom_ssl/npm-29/fullchain.pem
chmod 600 /opt/nginx-proxy-manager/data/custom_ssl/npm-29/privkey.pem
```
The certificate was registered in NPM (id `29`, `provider:"other"`,
"bergeerd.ir LE Cert") via the admin API, and proxy host `4` was configured
with `certificate_id:29`, `ssl_forced:true`, `http2_support:true`,
`hsts_enabled:true`.

> **Critical gotcha (resolved):** simply POSTing the cert to the NPM API only
> creates the DB row — it does **not** write the cert files into
> `/data/custom_ssl/npm-29/`. Without those files, NPM's nginx config test
> fails and the proxy host's `4.conf` is never written (HTTPS returns HTTP 000).
> The fix above (copying files into the NPM data volume) makes the cert real,
> and re-PUTting the proxy host regenerates `4.conf`.

---

## 7. NPM Proxy Host (id:4) — final config

```
Domain names:        bergeerd.ir, www.bergeerd.ir
Forward scheme/host: http://bergeerd-nginx:80
Certificate:         npm-29 (Let's Encrypt, provider "other")
Force SSL:           ON   (HTTP 301 -> HTTPS)
HTTP/2 Support:      ON
HSTS Enabled:        ON   (max-age=63072000; preload)
Block Common Exploits: ON
Websockets Support:  ON
```

---

## 8. End-to-end verification (ALL PASSED)

Tested against origin via `curl --resolve bergeerd.ir:443:127.0.0.1`:

| Check | Result |
|-------|--------|
| `https://bergeerd.ir` | **HTTP 200**, ssl_verify=0 (valid), HTTPS ✓ |
| `https://www.bergeerd.ir` | **HTTP 200**, ssl_verify=0, HTTPS ✓ |
| `http://bergeerd.ir` (Force SSL) | **HTTP 301** → `https://bergeerd.ir/` ✓ |
| Cert subject | `CN=bergeerd.ir` ✓ |
| Cert issuer | Let's Encrypt ✓ |
| Cert validity | 2026-07-15 → 2026-10-13 ✓ |
| HSTS header | `strict-transport-security: max-age=63072000; preload` ✓ |
| HTTP/2 | `HTTP/2 200` ✓ |

---

## 9. Firewall

`ufw` is **inactive** on the server; ports 80/443/3939 are open.
No firewall changes required. (Note: LE HTTP-01 is blocked *to this DC*, which
is why DNS-01 is used; normal visitors reach ports 80/443 fine.)

---

## 10. Auto-restart & renewal

- All containers use `restart: unless-stopped` (matches comode).
- `certbot.timer` is **enabled & active** → attempts renewal 30 days before
  expiry using the same manual DNS-01 hooks.
- Renewal deploy hook `bergeerd-npm-sync.sh` automatically:
  1. copies the renewed cert into NPM `npm-29`, and
  2. reloads NPM nginx.
- **Manual step still required at renewal time:** the operator must add the two
  TXT records in Cloudflare when the auth hook prints them (unavoidable with
  manual DNS-01). Everything else is automatic.

---

## 11. Registrar / Cloudflare checklist (for reference)

At the iranic registrar:
1. Change nameservers to `carmelo.ns.cloudflare.com` and
   `martha.ns.cloudflare.com`.
2. (Optional) Disable DNSSEC at the registrar if it was enabled under Liara's
   NS, then re-enable only with Cloudflare's DS data if desired.

In Cloudflare (zone `bergeerd.ir`):
1. DNS ▸ add A `bergeerd.ir` → `5.57.39.207` (DNS only / grey cloud).
2. DNS ▸ add CNAME `www` → `bergeerd.ir` (DNS only / grey cloud).
3. SSL/TLS ▸ Edge Certificates ▸ mode **Full**; Always Use HTTPS **ON**.
4. (Future renewals) DNS ▸ add the two `_acme-challenge*` TXT records the auth
   hook prints, wait for validation, then they can be deleted.
