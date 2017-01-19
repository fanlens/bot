/**
 * Created by chris on 18/01/2017.
 */
import intents from "./intents/";

export const register = (bot) => bot.dialog('/', intents);

export default register;