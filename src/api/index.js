/**
 * Created by chris on 19/01/2017.
 */
import config from "../config";

if (config.devMode === true) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

import Swagger from "swagger-client";

const client = (swagger) => new Swagger({
  url: `${config.api.basePath}${swagger}`,
  usePromise: true,
  authorizations: {
    // TODO use session.userData.jwt
//    headerAuth: new Swagger.ApiKeyAuthorization('Authorization', process.env.API_KEY, 'header')
  }
});

export const activities = client('/activities/swagger.json');

export const model = client('/model/swagger.json');
