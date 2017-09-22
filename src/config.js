export default {
  app:{
    id: process.env.FL_BOT_APP_ID,
    password: process.env.FL_BOT_APP_PASSWORD,
  },
  server:{
    endpoint: `/${process.env.FL_VERSION}/eev/api/messages`,
    host: process.env.FL_BOT_HOST || '127.0.0.1',
    port: process.env.FL_BOT_PORT || 3978,
  },
  devMode: process.env.FL_BOT_DEV_MODE === 'true' || false,
  api:{
    host: process.env.FL_BOT_API_HOST,
    version: process.env.FL_VERSION,
    basePath: `${process.env.FL_BOT_API_HOST}/${process.env.FL_VERSION}`,
  },
  ui: process.env.FL_BOT_UI_HOST,
  demo: {
    modelId: process.env.FL_BOT_DEMO_MODEL_ID,
    sourceId: process.env.FL_BOT_DEMO_SOURCE_ID,
  },
  luis:{
    top: {
      id: process.env.FL_BOT_LUIS_TOP_ID,
      key: process.env.FL_BOT_LUIS_TOP_KEY,
    },
    command: {
      id: process.env.FL_BOT_LUIS_COMMAND_ID,
      key: process.env.FL_BOT_LUIS_COMMAND_KEY,
    },
  },
};