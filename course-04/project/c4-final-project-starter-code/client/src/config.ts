// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '...'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  // Get from: https://manage.auth0.com/dashboard/us/dev-hhrq1tik/
  domain: 'dev-hhrq1tik.auth0.com', // Auth0 domain
  clientId: 'zv2uxvDOZNicGc1gI7dMGTE8Ad30fCEI', // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
