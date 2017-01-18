/**
 * Created by chris on 18/01/2017.
 */

import builder from "botbuilder";

export const recognizer = new builder.LuisRecognizer(`https://api.projectoxford.ai/luis/v1/application?id=${process.env.LUIS_TOP_ID}&subscription-key=${process.env.LUIS_TOP_KEY}`);

export const register = (intents) => {
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
};
