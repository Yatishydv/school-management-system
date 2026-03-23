# Deployment Guide

This guide provides instructions for deploying the School Management System to a production environment.

## Prerequisites

*   A server with Node.js and MongoDB installed.
*   A domain name or IP address for your server.
*   A process manager like PM2 to keep the application running.
*   A web server like Nginx to act as a reverse proxy.

## Backend Deployment

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd school-management-system/backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install --production
    ```

3.  **Create a `.env` file:**
    Create a `.env` file in the `backend` directory and add the following environment variables:
    ```
    PORT=5000
    MONGODB_URI=<your_mongodb_connection_string>
    JWT_SECRET=<your_strong_jwt_secret>
    FRONTEND_URL=<your_frontend_url>
    EMAIL_USER=<your_email@example.com>
    EMAIL_PASS=<your_email_password>
    ```

4.  **Start the application with PM2:**
    ```bash
    pm2 start server.js --name "school-management-system-backend"
    ```

5.  **Configure Nginx as a reverse proxy:**
    Create a new Nginx configuration file in `/etc/nginx/sites-available/`:
    ```
    server {
        listen 80;
        server_name your_domain.com;

        location / {
            proxy_pass http://localhost:5000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```
    Enable the site by creating a symbolic link to `/etc/nginx/sites-enabled/`:
    ```bash
    sudo ln -s /etc/nginx/sites-available/your_domain.com /etc/nginx/sites-enabled/
    ```
    Test the Nginx configuration and restart the service:
    ```bash
    sudo nginx -t
    sudo systemctl restart nginx
    ```

## Frontend Deployment

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd school-management-system/frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Build the application:**
    ```bash
    npm run build
    ```

4.  **Serve the built files with Nginx:**
    Update your Nginx configuration to serve the frontend files:
    ```
    server {
        listen 80;
        server_name your_domain.com;

        root /path/to/your/frontend/dist;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /api {
            proxy_pass http://localhost:5000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```
    Test the Nginx configuration and restart the service:
    ```bash
    sudo nginx -t
    sudo systemctl restart nginx
    ```

## SSL/TLS with Let's Encrypt

It is highly recommended to secure your application with SSL/TLS. You can use Let's Encrypt to get a free SSL certificate.

1.  **Install Certbot:**
    ```bash
    sudo apt-get update
    sudo apt-get install certbot python3-certbot-nginx
    ```

2.  **Obtain and install the certificate:**
    ```bash
    sudo certbot --nginx -d your_domain.com
    ```
    Certbot will automatically update your Nginx configuration to use the SSL certificate.
