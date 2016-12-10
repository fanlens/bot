if (process.env.DEV_MODE === 'true') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const restify = require('restify');
const builder = require('botbuilder');
const Swagger = require('swagger-client');
const _ = require('lodash');

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

const recognizerTopLevel = new builder.LuisRecognizer(`https://api.projectoxford.ai/luis/v1/application?id=${process.env.LUIS_TOP_ID}&subscription-key=${process.env.LUIS_TOP_KEY}`);
const recognizer = new builder.LuisRecognizer(`https://api.projectoxford.ai/luis/v1/application?id=${process.env.LUIS_ID}&subscription-key=${process.env.LUIS_KEY}`);
const intents = new builder.IntentDialog({recognizers: [recognizerTopLevel, recognizer], recognizeOrder: 'series'});
const bot = new builder.UniversalBot(connector);

bot.dialog('/', intents);
bot.dialog('/demo', [
  (session) => builder.Prompts.text(session, 'Hi Christian! How can I help?'),
  (session) => builder.Prompts.text(session, 'Ok, make it a bit more tech-y; show some more excitement.'),
  (session) => session.endDialog('Perfect! I\'ll send it out')
]);

intents.matches('intro',
  (session) => session.endDialog(
    new builder.Message(session)
      .sourceEvent({directline: {internal: 'help'}})
      .textFormat(builder.TextFormat.markdown)
      .text('I\'m eev')));
intents.matches('team',
  (session) => {
    session.send(
      new builder.Message(session)
        .sourceEvent({directline: {internal: 'ignore'}})
        .attachments([
          new builder.HeroCard(session)
            .title("Christian Junker")
            .subtitle("Chief Everything Officer")
            .text("Christian is a lifelong hacker, entrepreneur and researcher, and has over 10 years of experience mainly in the fields of data science and big data.")
            .images([
              builder.CardImage.create(session, `${process.env.DOMAIN}/cdn/img/chris-256.jpg`)
            ])
            .tap(builder.CardAction.openUrl(session, `${process.env.DOMAIN}/team`)),
          new builder.HeroCard(session)
            .title("Martí Cuquet")
            .subtitle("Mad Scientist-in-Chief")
            .text("Martí was Senior Postdoctoral Researcher at Semantic Technology Institute, Universität Innsbruck, and joined as Chief Science Officer.")
            .images([
              builder.CardImage.create(session, `${process.env.DOMAIN}/cdn/img/marti-256.jpg`)
            ])
            .tap(builder.CardAction.openUrl(session, `${process.env.DOMAIN}/team`))]));
    session.endDialog(
      new builder.Message(session)
        .sourceEvent({directline: {internal: 'team'}})
        .text(`More details here: ${process.env.DOMAIN}/team`));
  });
intents.matches('terms',
  (session) => session.endDialog(
    new builder.Message(session)
      .sourceEvent({directline: {internal: 'terms'}})
      .textFormat(builder.TextFormat.markdown)
      .text(`You can find our legal notice and privacy policy here: ${process.env.DOMAIN}/terms`)
      .attachments([
        new builder.HeroCard(session)
          .buttons([
            builder.CardAction.openUrl(session, `${process.env.DOMAIN}/terms`, 'Terms')
          ])
      ])
  ));
intents.matches('connect',
  (session) => session.endDialog(
    new builder.Message(session)
      .sourceEvent({directline: {internal: 'connect'}})
      .textFormat(builder.TextFormat.markdown)
      .text("You can find us on\n\n" +
        "* Facebook: https://facebook.com/fanlens\n\n" +
        "* Twitter: https://twitter.com/fanlens_io\n\n" +
        "* Or write an email to: info@fanlens.io")
      .attachments([
        new builder.HeroCard(session)
          .buttons([
            builder.CardAction.openUrl(session, 'https://twitter.com/fanlens_io', 'Twitter'),
            builder.CardAction.openUrl(session, 'https://twitter.com/fanlens_io', 'Facebook'),
            builder.CardAction.openUrl(session, 'mailto:info@fanlens.io', 'Email'),
          ])
      ])
  ));
intents.matches('demo', '/demo');

intents.matches('show', [
  (session, args, next) => {
    session.sendTyping();
    const tag = builder.EntityRecognizer.findEntity(args.entities, 'Tag').entity;
    const count = builder.EntityRecognizer.findEntity(args.entities, 'builtin.number').entity || 5;
    session.send(`right on, fetching ${count} comments for tag ${tag}`);
    session.sendTyping();
    session.sendBatch();
    next({tag, count})
  },
  (session, results) => {
    activitiesApi.then(
      (api) => {
        api.activity.get_source_ids({
          source_ids: 2,
          count: results.count,
          random: true
        }).then(({status, obj}) => obj)
          .then(({activities}) => session.endDialog(activities.map((comment, idx) =>
            `${idx + 1}) ${comment.text}`
          ).join('\n\n')))
          .catch((error) => console.log(error))
      }).catch((error) => console.log('hello', error));
  }
]);


intents.matches('evaluate', [
  (session, args, next) => {
    const text = builder.EntityRecognizer.findEntity(args.entities, 'Text');
    if (!text) {
      builder.Prompts.text(session, 'Sorry bro, didn\'t understand what you want me to say, please repeat just the text.');
    } else {
      session.send('alright, just give me 1 sec...');
      session.sendTyping();
      session.sendBatch();
      next({response: text.entity});
    }
  },
  (session, results) => {
    modelApi.then(
      (api) => api.prediction.post_model_id_prediction({
        model_id: '5d368f28-b6ed-11e6-af92-0242ac130007',
        body: {text: results.response}
      }).then(({status, obj}) => obj)
        .then(({prediction}) => session.endDialog('my magic 8ball is telling me this is mostly %s',
          _.max(_.keys(prediction), (k) => prediction[k])))
        .catch((error) => console.log(error)))
      .catch((error) => console.log(error));
  }
]);


intents.onDefault((session) => session.endDialog('Sorry didn\'t get that'));

const server = restify.createServer();
server.post('/v3/eev/api/messages', connector.listen());
server.listen(process.env.port || 3978, () => console.log('%s listening to %s', server.name, server.url));
