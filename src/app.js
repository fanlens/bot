if (process.env.DEV_MODE === 'true') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

import restify from "restify";
import builder from "botbuilder";
import Swagger from "swagger-client";
import rootDialog from "./dialogs/root";
import demoDialog from "./dialogs/demo";

const client = (swagger) => new Swagger({
  url: `${process.env.DOMAIN}${swagger}`,
  usePromise: true,
  authorizations: {
    headerAuth: new Swagger.ApiKeyAuthorization('Authorization-Token', process.env.API_KEY, 'header')
  }
});
const activitiesApi = client('/v3/activities/swagger.json');
const modelApi = client('/v3/model/swagger.json');

const connector = new builder.ChatConnector({
  appId: process.env.EEV_APP_ID,
  appPassword: process.env.EEV_APP_PASSWORD
});


const bot = new builder.UniversalBot(connector);

demoDialog(bot);
rootDialog(bot);


const server = restify.createServer();
server.post('/v3/eev/api/messages', connector.listen());
server.listen(process.env.port || 3978, () => console.log('%s listening to %s', server.name, server.url));
