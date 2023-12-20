# LinkEase Backend

## Description

LinkEase est un projet backend visant à créer un service similaire à IFTTT (If This Then That). IFTTT est une plateforme permettant aux utilisateurs de créer des flux de travail automatisés en connectant diverses applications et appareils. De manière similaire, LinkEase propose une plateforme personnalisable pour la création de tâches automatisées basées sur des déclencheurs et des actions prédéfinis.

## Technologies Utilisées

- JavaScript
- Node.js
- Express.js
- Node-fetch
- Swagger
- CI/CD (Continuous Integration/Continuous Deployment)

## Installation

### Docker (Recommandé)

1. Assurez-vous d'avoir Docker installé sur votre machine.
2. Exécutez le Dockerfile avec la commande suivante :
    ```bash
    docker build -t linkease-backend .
    docker run -p 8080:8080 linkease-backend
    ```

### Installation Locale

1. Installez Node.js (https://nodejs.org/).
2. Clonez le dépôt et exécutez les commandes suivantes :
    ```bash
    npm install
    npm start
    ```

### Configuration

Modifiez le fichier `.env` avec les paramètres suivants :
```env
PRIVATE_KEY="bonjour !"
DIALECT="mysql"
DB_NAME="linkease"
DB_USER="root"
DB_PASSWORD=""
HOST="127.0.0.1"
```

## Architecture

LinkEase utilise une architecture similaire à un modèle MVC, comprenant des controllers, des middlewares, des models et des vues.

## Endpoints/API (Swagger)

Consultez la documentation Swagger pour explorer les endpoints et tester l'API : [http://{url}:8080/docs](http://{url}:8080/docs)

## Contributeurs

- Younes Bahri - DevOps, Développeur Back-end
- Simon Vermeulen - Développeur Back-end
- Kéziah Imer - Développeur Back-end

## Contact

En cas de problème, veuillez contacter les développeurs dans l'ordre de priorité suivant :

1. Younes Bahri - younes1.bahri@epitech.eu
2. Simon Vermeulen - simon.vermeulen@epitech.eu
3. Kéziah Imer - keziah.imer@epitech.eu

## Licence

Ce projet est sous licence MIT. Consultez le fichier [LICENSE](LICENSE) pour plus de détails.
