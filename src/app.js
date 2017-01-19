import restify from "restify";
import builder from "botbuilder";
import rootDialog from "./dialogs/root/";
import demoDialog from "./dialogs/demo/";

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
