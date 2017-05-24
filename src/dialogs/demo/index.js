/**
 * Created by chris on 18/01/2017.
 */

import * as builder from "botbuilder";

export const register = (bot) => bot.dialog('/demo', [
  (session) => builder.Prompts.text(session, 'Hi Christian! How can I help?'),
  (session) => builder.Prompts.text(session, 'Ok, make it a bit more tech-y; show some more excitement.'),
  (session) => session.endDialog('Perfect! I\'ll send it out')
]);

export default register;