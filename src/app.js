import restify from "restify";
import * as builder from "botbuilder";
import config from "./config";
import rootDialog from "./dialogs/root/";
import demoDialog from "./dialogs/demo/";

const connector = new builder.ChatConnector({
  appId: config.app.id,
  appPassword: config.app.password
});

const bot = new builder.UniversalBot(connector);

demoDialog(bot);
rootDialog(bot);

const server = restify.createServer();
server.post(config.server.endpoint, connector.listen());
server.listen(config.server.port, config.server.host, () => console.log('%s listening to %s', server.name, server.url));
