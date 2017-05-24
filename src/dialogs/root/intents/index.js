/**
 * Created by chris on 18/01/2017.
 */
import * as builder from "botbuilder";
import * as commands from "./commands";
import * as toplevel from "./toplevel";

const intents = new builder.IntentDialog({
  recognizers: [
    commands.recognizer,
    toplevel.recognizer
  ],
  recognizeOrder: 'series'
});

commands.register(intents);
toplevel.register(intents);

intents.onDefault((session) => session.endDialog('Sorry didn\'t get that'));

export default intents;
