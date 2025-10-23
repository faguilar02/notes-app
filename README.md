# Ensolvers - Notes App Challenge

This project is a full-stack application with an Angular frontend and a NestJS backend, containerized with Docker.

## Live Demo

The application is deployed and accessible at:

- **Frontend:** [https://aguilarvaldez-b0ba5b-1.onrender.com](https://aguilarvaldez-b0ba5b-1.onrender.com)
- **Backend API:** [https://aguilarvaldez-b0ba5b.onrender.com](https://aguilarvaldez-b0ba5b.onrender.com)

## Default Credentials

To access the application, use the following credentials:

- **Username:** `ensolvers`
- **Password:** `ensolvers`

## Prerequisites

- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/products/docker-desktop/) & [Docker Compose](https://docs.docker.com/compose/)

## Quick Start

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/hirelens-challenges/AguilarValdez-b0ba5b.git
    cd AguilarValdez-b0ba5b
    ```

2.  **Run the application:**
    The provided script will check for prerequisites, then build and run the entire application using Docker Compose.

    - **For Windows (using PowerShell):**

      ```powershell
      ./start.ps1
      ```

    - **For Linux or macOS:**
      ```bash
      chmod +x start.sh
      ./start.sh
      ```
      This process will set up the frontend, backend, and database containers.

3.  **Access the application:**
    Once the containers are up and running, the services will be available at:

    - **Frontend (Angular):** [http://localhost:4200](http://localhost:4200)
    - **Backend API (NestJS):** [http://localhost:3000](http://localhost:3000)

The application is now ready to be tested.
