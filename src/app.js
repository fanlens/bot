import restify from "restify";
import * as builder from "botbuilder";
import rootDialog from "./dialogs/root/";
import demoDialog from "./dialogs/demo/";

const connector = new builder.ChatConnector({
  appId: process.env.BOT_APP_ID,
  appPassword: process.env.BOT_APP_PASSWORD
});

const bot = new builder.UniversalBot(connector);

demoDialog(bot);
rootDialog(bot);

const server = restify.createServer();
server.post('/v4/eev/api/messages', connector.listen());
server.listen(process.env.PORT || 3978, () => console.log('%s listening to %s', server.name, server.url));
