const restify = require('restify');
const builder = require('botbuilder');
const Swagger = require('swagger-client');

const client = (swagger) => new Swagger({
  url: `https://${process.env.DOMAIN}/${swagger}`,
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
const recognizer = new builder.LuisRecognizer(`https://api.projectoxford.ai/luis/v1/application?id=${process.env.LUIS_ID}&subscription-key=${process.env.LUIS_KEY}`);
const router = new builder.IntentDialog();
const intents = new builder.IntentDialog({recognizers: [recognizer]});
const bot = new builder.UniversalBot(connector);

bot.dialog('/', router);
bot.dialog('/eev', intents);
bot.dialog('/demo', [
  (session) => builder.Prompts.text(session, 'Hi Christian! How can I help?'),
  (session) => builder.Prompts.text(session, 'Ok, make it a bit more tech-y; show some more excitement.'),
  (session) => session.endDialog('Perfect! I\'ll send it out')
]);

router.matches(/^start demo$/i, (session) => session.beginDialog('/demo'));
router.onDefault('/eev');

intents.matches('show', [
  (session, args, next) => {
    const tag = builder.EntityRecognizer.findEntity(args.entities, 'Tag').entity;
    const count = builder.EntityRecognizer.findEntity(args.entities, 'builtin.number').entity || 5;
    next({tag, count})
  },
  (session, results) => {
    session.send(`right on, fetching ${results.count} comments for tag ${results.tag}`
    );
    activitiesApi.then(
      (api) => api.activity.get_source_ids({
        source_ids: _.chain(sources).filter('active').map('id').value(),
        count: results.count,
        random: true
      }).then(({status, obj}) => obj)
        .then(({activities}) => session.send(activities.map((comment, idx) =>
          `${idx + 1}) ${comment.text}`
        ).join('\n\n')))
        .catch((error) => console.log(error)));
  }
]);


intents.matches('evaluate', [
  (session, args, next) => {
    const text = builder.EntityRecognizer.findEntity(args.entities, 'Text');
    if (!text) {
      builder.Prompts.text(session, 'Sorry bro, didn\'t understand what you want me to say, please repeat just the text.');
    } else {
      next({response: text.entity});
    }
  },
  (session, results) => {
    session.send('alright, just give me 1 sec...');
    modelApi.then(
      (api) => api.suggestion.post_suggestion({body: {text: results.response}})
        .then(({status, obj}) => obj)
        .then(({suggestion}) => session.send('my magic 8ball is telling me this is %s', JSON.stringify(suggestion)))
        .catch((error) => console.log(error)));
  }
]);

intents.onDefault((session) => session.endDialog('Sorry didn\'t get that'));

const server = restify.createServer();
server.post('/v3/eev/api/messages', connector.listen());
server.listen(process.env.port || 3978, () => console.log('%s listening to %s', server.name, server.url));