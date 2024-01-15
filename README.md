# Linkease BackEnd

## Introduction

**Linkease** is an innovative platform inspired by IFTTT, which stands for "If This Then That". IFTTT is a web-based service that allows users to create chains of simple conditional statements, known as applets. These applets can trigger actions in other web services and devices. To learn more about IFTTT, visit their [website](https://ifttt.com/).

Linkease allows users to integrate and automate various services, focusing on OAuth 2.0 and webhook-compatible services. Users can create and manage these services directly on Linkease by filling out a form.

## Features

- **Service Creation:** Users can add OAuth 2.0 and webhook services to Linkease.
- **Triggers and Actions:** Inside these services, users can create triggers and actions, akin to functions that can call each other. This is facilitated by a special, no-code program provided by Linkease, similar to Blueprint or Scratch.
- **Workspaces:** Linkease offers workspaces to group automations, allowing users to create no-code programs that call triggers and actions.
- **Team Collaboration:** Workspace and service managers can invite others to collaborate, enabling teamwork.

## Technologies

Linkease Backend is built using the following technologies:

1. **JavaScript:** A programming language used to implement complex features on web pages.
2. **Node.js:** An open-source, cross-platform JavaScript runtime environment.
3. **ExpressJS:** A web application framework for Node.js, designed for building web applications and APIs.
4. **Swagger:** A set of tools for designing and documenting RESTful APIs.
5. **Sequelize:** A promise-based Node.js ORM for Postgres, MySQL, MariaDB, SQLite, and Microsoft SQL Server.
6. **CI/CD:** Continuous Integration and Continuous Deployment, methodologies for frequent code changes and automated deployment.

## Installation

### Prerequisites

Before installation, ensure you have the necessary tools:

- **For Docker:** Docker needs to be installed.
- **For NPM:** Node.js and NPM are required.

### Via Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone git@github.com:AREA-LinkEase/BackEnd.git
   cd BackEnd
   ```
2. Build and run the Docker container:
   ```bash
   docker build -t linkease-backend .
   docker run -p 8080:8080 linkease-backend
   ```

### Via NPM (Not Recommended)

1. Clone the repository:
   ```bash
   git clone git@github.com:AREA-LinkEase/BackEnd.git
   cd BackEnd
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   npm start
   ```

## Configuration

Configure the project using the `.env` file. Example:

```env
PRIVATE_KEY="..."
WORKER_KEY="..."
DB_NAME="..."
DB_PASSWORD="..."
DB_USER="..."
HOST="..."
DIALECT="..."
OPENAI_KEY="..."
DISCORD_CLIENT_ID="..."
DISCORD_SECRET="..."
DISCORD_REDIRECT_URI="..."
GITHUB_CLIENT_ID="..."
GITHUB_SECRET="..."
GITHUB_REDIRECT_URI="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_SECRET="..."
GOOGLE_REDIRECT_URI="..."
FINAL_REDIRECT_URI="..."
SERVICE_REDIRECT_URI="..."
```

## Architecture

Linkease uses an architecture similar to the MVC model, including controllers, middlewares, models, and views.

## API Documentation

API documentation is available on Swagger at `http://{url}:8080/docs`.

## Contributing

Interested in contributing to Linkease? Check our [Contributing Guidelines](contributing.md).

## Contributors

- Younes Bahri - DevOps, Back-end Developer
- Simon Vermeulen - Back-end Developer
- Kéziah Imer - Back-end Developer

## Contact

For any issues, contact the developers in the following order:

- Younes Bahri - younes1.bahri@epitech.eu
- Simon Vermeulen - simon.vermeulen@epitech.eu
- Kéziah Imer - keziah.imer@epitech.eu

## License

Linkease is licensed under the

MIT License. For more details, please refer to the [LICENSE](LICENSE) file in the project repository.
