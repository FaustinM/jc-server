![Imgur](https://i.imgur.com/LVUFnS1.png)

# Serveur Just-Comment
Afin de convenir à mes besoins, j'ai décidé de fork le projet et de le modifier ! Notamment en ajoutant un système de modération et autre.

# Original
The server is implemented in NodeJS. Required version is 8+;

## Features

- basic commenting
- single process
- file storage

## Not-included features

- reactions
- nested responses
- sorting
- social login
- email notifications
- push notifications
- reCaptcha
- higly-available & distributed storage

To have these features, please see the paid hosted version:
[JustComments](https://just-comments.com)

## Server Setup

- Clone the repository and run `npm install`.
- Run `node server.js`

You should get a message `JustComments listening on port 3434!`. You can change
the port in `config.js`.

## Frontend Setup

- Clone https://github.com/JustComments/jc-widget and run `npm install`.
- Adjust `API_ENDPOINT` variable in Webpack via CLI or in the source to
  point to 3434.
- Run `npm start` and open `http://localhost:3333/`.

## Frontend Build

- Define URLs where you will host the frontend and backend in Webpack config or
  via CLI.
- Run `npm run build`.
- Copy files from the `dist` to your server.

## Recommended config for the frontend

```
<div
  class="just-comments"
  data-locale="en"
  data-disablesociallogin="true"
  data-disablepushnotifications="true"
  data-disableemailnotifications="true"
  data-disablereactions="true"
></div>
<script src="https://your-server/jc/w2.js"></script>
```
