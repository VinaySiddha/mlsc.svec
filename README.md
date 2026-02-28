# MLSC Hub - Hiring Portal

This is a full-stack web application designed as a hiring portal for the Machine Learning Student Club. It is built with Next.js, Firebase, and Google Genkit, and is containerized with Docker for easy deployment on a Virtual Machine (VM).

## Key Technologies

- **Frontend:** Next.js (React, TypeScript)
- **Backend:** Next.js API routes and server actions
- **AI:** Google Genkit, Google Gemini
- **Authentication:** JWT-based, with Firebase integration
- **Database:** Firebase Firestore
- **Deployment:** Docker & Docker Compose

## VM Deployment with Docker

This application is configured to run in a Docker environment, making it simple to deploy on any cloud VM (e.g., Google Compute Engine, AWS EC2, Azure VMs) that has Docker and Docker Compose installed.

### 1. Prerequisites

- A Cloud VM with Docker and Docker Compose installed.
- Your domain pointing to the VM's public IP address.
- Nginx installed on the VM to act as a reverse proxy.

### 2. Setup

1.  **Clone the Repository:**
    ```sh
    git clone <your-repo-url>
    cd hiring
    ```

2.  **Configure Environment Variables:**
    You will need a `.env` file in the project root to hold your secrets. If you don't have one, you can copy the example if it exists, or create a new one. It must contain all required secrets (Firebase keys, JWT secret, etc.).

3.  **Configure Nginx:**
    Use the provided `nginx.conf` as a template. You will need to copy it to your Nginx configuration directory (e.g., `/etc/nginx/conf.d/`) and set up SSL (e.g., using Let's Encrypt). The configuration is set up to load balance between three instances of the application.

4.  **Build and Run with Docker Compose:**
    From the root of the project directory, run:
    ```sh
    docker-compose up --build -d
    ```
    This command will build the Next.js Docker image and start the application services defined in `docker-compose.yml` in the background.

### 3. Accessing the Application

Once the containers are running and Nginx is configured, you should be able to access the application via your domain name.

### 4. Managing the Application

-   **To stop the services:** `docker-compose down`
-   **To view logs:** `docker-compose logs -f`

## Local Development

1.  **Install dependencies:**
    ```sh
    npm install
    ```
2.  **Setup Environment Variables:** Create a `.env.local` file with the required secrets.
3.  **Start development server:**
    ```sh
    npm run dev
    ```
4.  **Run Genkit AI dev server (for AI features):**
    ```sh
    npm run genkit:dev
    ```
