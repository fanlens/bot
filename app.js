const restify = require('restify');
const builder = require('botbuilder');

const TOKEN = 'WyI3IiwiOGE3MDFkMGRlNmMzYTNiNDc1NzRmZTRkZDdlNzY5NzUiXQ.CtPxhA.RUIXj5DwSWwe7WfwISu2VBgYBd0';
const encode = (data) => Object.keys(data).map((key) => [key, data[key]].map(encodeURIComponent).join("=")).join("&");
const api = (endpoint, query = {}) => `/v2/tagger${endpoint}?api_key=${TOKEN}&${encode(query)}`;

const client = restify.createJsonClient('https://fanlens.io');
const connector = new builder.ChatConnector({
  appId: "a2e8dab5-dfca-4d44-a5a9-5e5cbd804d80",
  appPassword: "OuyOr7sD4itWCFoQZ5ejcv1"
});
const recognizer = new builder.LuisRecognizer('https://api.projectoxford.ai/luis/v1/application?id=837848ff-1d6e-4b8b-91ab-1e431537126c&subscription-key=a07b0358014e495d8640da44a95d6f67');
const intents = new builder.IntentDialog({recognizers: [recognizer]});
const bot = new builder.UniversalBot(connector);

bot.dialog('/', intents);

intents.matches('show', [
  (session, args, next) => {
    const tag = builder.EntityRecognizer.findEntity(args.entities, 'Tag').entity;
    const count = builder.EntityRecognizer.findEntity(args.entities, 'builtin.number').entity || 5;
    next({tag, count})
  },
  (session, results) => {
    session.send(`right on, fetching ${results.count} comments for tag ${results.tag}`);
    client.get(api('/comments/_random', {count: results.count, with_entity: true}),
      (err, req, res, obj) => session.endDialog(obj.comments.map((comment, idx) => `${idx + 1}) ${comment.message}`).join('\n\n')));
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
    client.post(api('/suggestion'),
      {text: results.response},
      (err, req, res, obj) => session.endDialog('my magic 8ball is telling me this is %s', JSON.stringify(obj.suggestion))
    );
  }
]);

const server = restify.createServer();
server.post('/eev/api/messages', connector.listen());
server.listen(process.env.port || 3978, () => console.log('%s listening to %s', server.name, server.url));