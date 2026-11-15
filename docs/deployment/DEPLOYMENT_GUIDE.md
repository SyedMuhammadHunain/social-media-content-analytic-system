# 🚀 SMCAS Production Deployment Guide
## Vercel Frontend + Azure Linux VM Backend Microservices

This runbook guides you through deploying the **Social Media Content Analysis System (SMCAS)** to production using your **GitHub Student Developer Pack** perks ($100 Azure Credit, free Vercel hosting, and MongoDB Atlas free tier) with **zero out-of-pocket expense**.

---

## 🏛️ System Topology

```mermaid
flowchart TD
    User["User Browser"] -->|HTTPS / Port 443| Vercel["Frontend SPA (Vercel)\nhttps://smcas.vercel.app"]
    User -->|API REST & Chat / HTTPS 443| Nginx["Nginx Reverse Proxy + SSL\nAzure VM (Port 443)"]
    User -->|Direct Media Upload (SAS)| AzureBlob["Azure Blob Storage\n(media-assets)"]

    Nginx -->|Proxy :8080| Gateway["api-gateway\nSpring Cloud"]
    Gateway --> Services["7 Microservices\n(Ports 8081 - 8087)"]
    Gateway --> Atlas[("MongoDB Atlas NoSQL\n(Posts, Feeds, Chat, Users)")]
    Services --> Atlas
```

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- [ ] Active **GitHub Student Developer Pack** with **Microsoft Azure for Students** ($100 credit activated).
- [ ] Free **MongoDB Atlas** cluster created with database `SocialMediaContentAnalysisSystem`.
- [ ] Microsoft Azure Storage Account with container `media-assets`.
- [ ] Free **Vercel** account linked to your GitHub account.

---

## Phase 1: Cloud Persistence & Secrets Setup

### 1. MongoDB Atlas Connection String
1. In MongoDB Atlas, go to **Database Deployments** -> Click **Connect** -> Choose **Drivers** (Java).
2. Copy the URI string:
   ```env
   mongodb+srv://<username>:<password>@smcas.d8avoun.mongodb.net/SocialMediaContentAnalysisSystem?retryWrites=true&w=majority
   ```
3. In **Network Access**, add `0.0.0.0/0` (Allow access from anywhere) so your Azure VM and developers can connect.

### 2. Azure Blob Storage Keys
1. In Azure Portal, search for **Storage accounts** -> Select your storage account.
2. Under **Security + networking**, select **Access keys**.
3. Copy **Connection string** (Key 1):
   ```env
   DefaultEndpointsProtocol=https;AccountName=<storage_name>;AccountKey=<access_key>;EndpointSuffix=core.windows.net
   ```
4. Under **Data storage** -> **Containers**, verify container `media-assets` exists with **Private** access level.

---

## Phase 2: Provision Azure Linux Virtual Machine

1. In Azure Portal, navigate to **Virtual machines** -> Click **+ Create** -> **Azure virtual machine**.
2. Configure Basic Settings:
   - **Subscription:** Azure for Students (Uses your $100 credit).
   - **Resource Group:** Create new `smcas-rg`.
   - **Virtual Machine Name:** `smcas-backend-vm`.
   - **Region:** `East US` (or closest region with low latency).
   - **Security Type:** Standard.
   - **Image:** `Ubuntu Server 24.04 LTS - x64 Gen2`.
   - **Size:** `Standard_B2s` (2 vCPUs, 4 GiB memory — costs ~$30/mo, easily covered by $100 student credit).
   - **Authentication type:** Password or SSH public key (choose **Password** for fast setup).
   - **Username:** `azureuser`.
   - **Password:** Strong 12+ character password.
3. Inbound Port Rules:
   - Select **Allow selected ports**: `SSH (22)`, `HTTP (80)`, `HTTPS (443)`.
4. Click **Review + create** -> Click **Create**.

### Assign a Free Azure DNS Name
1. Once deployed, click **Go to resource** -> Click on your VM's **Public IP address**.
2. Under **Settings** -> Click **Configuration**.
3. In **DNS name label**, enter a unique name (e.g. `smcas-backend`):
   - Your permanent DNS becomes: `smcas-backend.eastus.cloudapp.azure.com`.
4. Click **Save**.

---

## Phase 3: Bootstrap the Azure Linux VM

1. Connect to your Azure VM via SSH from your terminal:
   ```bash
   ssh azureuser@smcas-backend.eastus.cloudapp.azure.com
   ```
2. Clone the repository into `/opt/smcas`:
   ```bash
   sudo git clone https://github.com/SyedMuhammadHunain/social-media-content-analytic-system.git /opt/smcas
   sudo chown -R azureuser:azureuser /opt/smcas
   cd /opt/smcas
   ```
3. Run the automated bootstrap script:
   ```bash
   sudo bash deploy/azure/bootstrap-vm.sh
   ```
   *What this script automates:*
   - Creates a 2GB swap file to prevent JVM out-of-memory spikes.
   - Installs OpenJDK 21 LTS, Maven, Docker CE, Docker Compose, Nginx, and Certbot.
   - Configures the firewall for ports 22, 80, 443, and 8080.

---

## Phase 4: Configure & Start Backend Microservices

### 1. Set Environment Secrets
On your Azure VM, create `/opt/smcas/backend/.env`:
```bash
nano /opt/smcas/backend/.env
```
Paste your secrets:
```env
JWT_SECRET=replace_with_a_secure_random_256_bit_secret_key_at_least_32_chars!
MONGODB_URI=mongodb+srv://<username>:<password>@smcas.d8avoun.mongodb.net/SocialMediaContentAnalysisSystem?retryWrites=true&w=majority
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=<storage_name>;AccountKey=<key>;EndpointSuffix=core.windows.net
AZURE_STORAGE_CONTAINER_NAME=media-assets
AZURE_STORAGE_SAS_EXPIRY=15
ALLOWED_ORIGIN_PATTERNS=https://*.vercel.app,http://localhost:[*]
```
Press `Ctrl+O` then `Enter` to save, and `Ctrl+X` to exit.

### 2. Launch Backend (Choose Option A or Option B)

#### Option A: Docker Compose (Recommended)
Compile the JARs and start the container cluster:
```bash
cd /opt/smcas
bash scripts/build-and-run-docker.sh
```

#### Option B: Native Spring Boot Daemon (No Docker)
```bash
cd /opt/smcas/backend
mvn clean package -DskipTests
cd /opt/smcas
bash scripts/start-backend.sh
```

### 3. Verify Gateway Running
```bash
curl -I http://localhost:8080/actuator/health
```
Expected output: `HTTP/1.1 200 OK`.

---

## Phase 5: Configure Nginx & Let's Encrypt SSL

Vercel frontend runs on `https://`. Modern browsers block calls from HTTPS to plain HTTP (Mixed Content). We configure Nginx on the VM to provide HTTPS on your Azure DNS name.

### 1. Install Initial Nginx Site Config
```bash
sudo cp /opt/smcas/deploy/nginx/smcas-http-initial.conf /etc/nginx/sites-available/smcas.conf
sudo sed -i 's/YOUR_DOMAIN_OR_AZURE_DNS/smcas-backend.eastus.cloudapp.azure.com/g' /etc/nginx/sites-available/smcas.conf
sudo ln -sf /etc/nginx/sites-available/smcas.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### 2. Issue Free SSL Certificate via Certbot
```bash
sudo certbot --nginx -d smcas-backend.eastus.cloudapp.azure.com --non-interactive --agree-tos -m your-email@domain.com
```

### 3. Deploy Hardened Production Nginx Config
```bash
sudo cp /opt/smcas/deploy/nginx/smcas.conf /etc/nginx/sites-available/smcas.conf
sudo sed -i 's/YOUR_DOMAIN_OR_AZURE_DNS/smcas-backend.eastus.cloudapp.azure.com/g' /etc/nginx/sites-available/smcas.conf
sudo nginx -t && sudo systemctl reload nginx
```

### 4. Verify External HTTPS
From your local terminal:
```bash
curl -I https://smcas-backend.eastus.cloudapp.azure.com/actuator/health
```
Expected output: `HTTP/2 200`.

---

## Phase 6: Deploy Frontend to Vercel

1. Open [Vercel Dashboard](https://vercel.com/dashboard) -> Click **Add New...** -> **Project**.
2. Select your GitHub repository: `social-media-content-analytic-system`.
3. Configure Project Settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click `Edit` and select `frontend`.
   - **Build Command:** `npm run build` (detected automatically).
   - **Output Directory:** `dist` (detected automatically).
4. Expand **Environment Variables**:
   | Variable | Value | Notes |
   | :--- | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://smcas-backend.eastus.cloudapp.azure.com` | Your Azure HTTPS Gateway |
   | `VITE_GOOGLE_CLIENT_ID` | `your-google-oauth-client-id.apps.googleusercontent.com` | Optional (leave blank for simulation) |
5. Click **Deploy**.
6. Deployment will complete in ~45 seconds. Vercel will provide your live URL: `https://<project-name>.vercel.app`.

---

## Phase 7: End-to-End Verification Runbook

Perform the following smoke tests on your live Vercel deployment:

1. **Authentication:**
   - Navigate to `https://<your-vercel-domain>.vercel.app`.
   - Log in using either the 1-click Demo Account or sign up for a new account.
2. **News Feed & Filtering:**
   - Switch between **All**, **Trending**, **Media**, and **Following** feed tabs.
   - Verify post likes increment and persist across page reloads.
3. **Media Upload & Azure Blob Storage:**
   - Open Post Composer -> Upload an image or MP4 video.
   - Publish post -> Verify the image/video renders inline and is served from Azure Blob Storage (`media-assets`).
4. **Direct Messaging & Chat Persistence:**
   - Open Messages tab -> Send a message to another user.
   - Refresh the page -> Verify message rehydrates from MongoDB Atlas `chat_messages` collection.
5. **Creator Analytics Dashboard:**
   - Switch to Dashboard tab -> Verify sub-2-second telemetry numbers and charts render accurately.

---

## 💡 Cost Management & Azure Student Credit Tips

- **Student Credit Protection:** Standard_B2s consumes ~$1.00/day. Your $100 credit will last for over 3 months continuously.
- **Stopping the VM:** When not presenting or testing, you can stop the VM in Azure Portal to pause compute charges:
  ```bash
  # From Azure CLI
  az vm deallocate --resource-group smcas-rg --name smcas-backend-vm
  ```
- **Checking Service Logs on VM:**
  ```bash
  # Docker mode:
  docker compose logs -f api-gateway

  # Native mode:
  tail -f /opt/smcas/scripts/api-gateway.log
  ```
