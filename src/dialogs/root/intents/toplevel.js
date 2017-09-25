/**
 * Created by chris on 18/01/2017.
 */

import * as builder from "botbuilder";
import config from "../../../config";

export const recognizer = new builder.LuisRecognizer(`https://eastus2.api.cognitive.microsoft.com/luis/v2.0/apps/${config.luis.top.id}?subscription-key=${config.luis.top.key}&timezoneOffset=0&verbose=true&spellCheck=true&q=`);

export const register = (intents) => {
    intents.matches('intro',
      (session) => {
        session.endDialog(
          new builder.Message(session)
            .sourceEvent({directline: {internal: 'help'}})
            .textFormat(builder.TextFormat.markdown)
            .text('I\'m eev'));
      });
    intents.matches('login', [
      (session, results, next) => {
        if (session.userData.name) {
          session.send(builder.Prompts.confirm(session, `Wait I think I've seen your face... ${session.userData.name} right?`));
        } else {
          next();
        }
      },
      (session, results, next) => {
        if (results.response) {
          session.endDialog(`Ok, great, how can i help you ${session.userData.name}?`)
        } else {
          const {message: {address: {channelId}, user: {id: userId}}} = session;
          session.endDialog(
            new builder.Message(session)
              .sourceEvent({directline: {internal: 'login'}})
              .textFormat(builder.TextFormat.markdown)
              .text('Please login in via the following link')
              .attachments([
                new builder.HeroCard(session)
                  .buttons([
                    builder.CardAction.openUrl(session, `${config.api.basePath}/eev/login/${channelId}/${userId}`, 'Log In')
                  ])
              ]));
        }
      }
    ]);
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
                  builder.CardImage.create(session, `${config.ui}/static/img/chris-256.jpg`)
                ])
                .tap(builder.CardAction.openUrl(session, `${config.ui}/team`)),
              new builder.HeroCard(session)
                .title("Martí Cuquet")
                .subtitle("Mad Scientist-in-Chief")
                .text("Martí was Senior Postdoctoral Researcher at Semantic Technology Institute, Universität Innsbruck, and joined as Chief Science Officer.")
                .images([
                  builder.CardImage.create(session, `${config.ui}/static/img/marti-256.jpg`)
                ])
                .tap(builder.CardAction.openUrl(session, `${config.ui}/team`))]));
        session.endDialog(
          new builder.Message(session)
            .sourceEvent({directline: {internal: 'team'}})
            .text(`More details here: ${config.ui}/team`));
      });
    intents.matches('terms',
      (session) => session.endDialog(
        new builder.Message(session)
          .sourceEvent({directline: {internal: 'terms'}})
          .textFormat(builder.TextFormat.markdown)
          .text(`You can find our legal notice and privacy policy here: ${config.ui}/terms`)
          .attachments([
            new builder.HeroCard(session)
              .buttons([
                builder.CardAction.openUrl(session, `${config.ui}/terms`, 'Terms')
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
  }
;
