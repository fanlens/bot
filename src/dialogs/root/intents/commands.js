/**
 * Created by chris on 18/01/2017.
 */
import _ from "lodash";
import builder from "botbuilder";
import {activities, model} from "../../../api/";

export const recognizer = new builder.LuisRecognizer(`https://api.projectoxford.ai/luis/v1/application?id=${process.env.LUIS_ID}&subscription-key=${process.env.LUIS_KEY}`);

export const register = (intents) => {
  intents.matches('show', [
    (session, args, next) => {
      session.sendTyping();
      const tag = builder.EntityRecognizer.findEntity(args.entities, 'Tag').entity;
      const count = builder.EntityRecognizer.findEntity(args.entities, 'builtin.number').entity || 5;
      session.send(`right on, fetching ${count} comments for tag ${tag}`);
      session.sendTyping();
      session.sendBatch();
      next({tag, count});
    },
    (session, results) => {
      activities.then(
        (api) => {
          api.activity.get_source_ids({
            source_ids: 2,
            count: results.count,
            random: true
          }).then(({status, obj}) => obj)
            .then(({activities}) => session.endDialog(activities.map((comment, idx) =>
              `${idx + 1}) ${comment.text}`
            ).join('\n\n')))
            .catch((error) => console.log(error));
        }).catch((error) => console.log(error));
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
      model.then(
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
};
