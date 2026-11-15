#!/usr/bin/env bash
# ==============================================================================
# SMCAS - Azure Ubuntu Linux VM Automated Bootstrap Script
# Target OS: Ubuntu 22.04 / 24.04 LTS (Azure Standard_B2s or B2ats)
# ==============================================================================
set -euo pipefail

echo "=================================================================="
echo " Starting SMCAS Azure VM Provisioning & Dependency Bootstrap"
echo "=================================================================="

# 1. Verify Superuser / Root Privileges
if [ "$EUID" -ne 0 ]; then
    echo "[-] Error: This script must be run as root (use sudo bash $0)."
    exit 1
fi

export DEBIAN_FRONTEND=noninteractive

# 2. Configure 2GB Swap Memory (Prevents JVM OOM Spikes)
if [ ! -f /swapfile ]; then
    echo "[+] Creating 2GB swap file for JVM stability..."
    fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    if ! grep -q '/swapfile' /etc/fstab; then
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
    fi
    # Optimize swappiness for microservice workloads
    sysctl vm.swappiness=10
    echo 'vm.swappiness=10' >> /etc/sysctl.d/99-smcas-swap.conf
    echo "[+] 2GB swap configured successfully."
else
    echo "[*] Swap file already exists. Skipping swap creation."
fi

# 3. Update Package Repositories
echo "[+] Updating system packages..."
apt-get update -y
apt-get upgrade -y

# 4. Install Base Tools, Java 21, Maven, Nginx, Certbot
echo "[+] Installing Java 21 LTS, Maven, Nginx, Certbot..."
apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    jq \
    ufw \
    openjdk-21-jdk \
    maven \
    nginx \
    certbot \
    python3-certbot-nginx

# 5. Install Docker & Docker Compose
if ! command -v docker &> /dev/null; then
    echo "[+] Installing Docker Engine and Docker Compose Plugin..."
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    chmod a+r /etc/apt/keyrings/docker.asc

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      tee /etc/apt/sources.list.d/docker.list > /dev/null

    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl enable docker
    systemctl start docker

    # Add default ubuntu/azureuser to docker group if present
    for user in azureuser ubuntu "$SUDO_USER"; do
        if id "$user" &>/dev/null; then
            usermod -aG docker "$user"
            echo "[+] Added $user to docker group."
        fi
    done
else
    echo "[*] Docker already installed. Skipping."
fi

# 6. Configure UFW Firewall (Allow SSH, HTTP, HTTPS)
echo "[+] Configuring firewall rules..."
ufw allow OpenSSH || true
ufw allow 'Nginx Full' || true
ufw allow 80/tcp || true
ufw allow 443/tcp || true
ufw allow 8080/tcp || true
echo "y" | ufw enable || true

# 7. Prepare Nginx Directories & ACME Webroot
mkdir -p /var/www/certbot
chown -R www-data:www-data /var/www/certbot

echo "=================================================================="
echo " Azure VM Bootstrap Complete!"
echo "=================================================================="
echo "Installed Components:"
echo " - Java: $(java -version 2>&1 | head -n 1)"
echo " - Maven: $(mvn -version 2>&1 | head -n 1)"
echo " - Docker: $(docker --version 2>&1 || true)"
echo " - Nginx: $(nginx -v 2>&1 || true)"
echo " - Certbot: $(certbot --version 2>&1 || true)"
echo ""
echo "Next Steps on Azure VM:"
echo " 1. Clone repository: git clone <repo_url> /opt/smcas"
echo " 2. Configure /opt/smcas/backend/.env with your MongoDB & Azure keys"
echo " 3. Copy Nginx config: sudo cp /opt/smcas/deploy/nginx/smcas-http-initial.conf /etc/nginx/sites-available/smcas.conf"
echo " 4. Run Certbot: sudo certbot --nginx -d <your-azure-dns>"
echo " 5. Start Backend: cd /opt/smcas && bash scripts/start-backend.sh (or docker compose up -d)"
echo "=================================================================="
