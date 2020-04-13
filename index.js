// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const bent = require('bent');
const getJSON = bent('json');
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  function worldwideLatestStats (agent) {
    const type = agent.parameters.type;
    return getJSON('https://coronavirus-tracker-api.herokuapp.com/v2/latest?source=jhu').then(result => {
        agent.add('According to my data');
        switch (type[0]) {
            case 'confirmed': 
                agent.add(`There are currently ${result.latest.confirmed} confirmed cases of COVID-19`);
                break;
            case 'deaths':
                agent.add(`There are currently ${result.latest.deaths} deaths because of COVID-19`);
                break;
            case 'recovered':
                agent.add(`There are currentlty ${result.latest.recovered} people who have recovered from COVID-19. I hope this number increases.`);
                break;
            default:
                agent.add(`There are currently: ${result.latest.confirmed} confirmed cases, ${result.latest.deaths}, and ${result.latest.recovered} people who recovered from COVID-19.`);
        }
    }).catch(err => {
        console.log(err);
    });
  }

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('WorldWide Latest Stats', worldwideLatestStats);
  agent.handleRequest(intentMap);
});
