// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
const { Card, Suggestion } = require('dialogflow-fulfillment');
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

	function worldwideLatestStats(agent) {
		const type = agent.parameters.type;
		return getJSON('https://coronavirus-tracker-api.ruizlab.org/v2/latest?source=jhu').then(result => {
			agent.add('According to my data, ');
			if (type.length >= 3) {
				agent.add(`There are currently: ${result.latest.confirmed} confirmed cases, ${result.latest.deaths} deaths , and ${result.latest.recovered} people who recovered from COVID-19.`);
				return;
			}

			for (let i = 0; i < type.length; i++) {
				if (i == 1) {
					agent.add(`In addition, `);
				}

				switch (type[i]) {
					case 'confirmed':
						agent.add(`There are currently ${result.latest.confirmed} confirmed cases of COVID-19.`);
						break;
					case 'deaths':
						agent.add(`There are currently ${result.latest.deaths} deaths because of COVID-19.`);
						break;
					case 'recovered':
						agent.add(`There are currentlty ${result.latest.recovered} people who have recovered from COVID-19. I hope this number increases.`);
						break;
					default: //all conditions 
						agent.add(`There are currently: ${result.latest.confirmed} confirmed cases, ${result.latest.deaths} deaths, and ${result.latest.recovered} people who recovered from COVID-19.`);
				}

			}
		}).catch(err => {
			console.log(err);
		});
	}

	async function locationLatestStats(agent) {
		const type = agent.parameters.type;
		const country = agent.parameters.country;
		const state = agent.parameters['geo-state'];
		const city = agent.parameters['geo-city'];
		const county = agent.parameters.county;
		const baseURL = `https://coronavirus-tracker-api.ruizlab.org/v2/locations`;
		console.log(agent.parameters);

		if (state && state.length) {
			let response;
			for (let i = 0; i < state.length; i++) {
				let stateURL = `${baseURL}?source=csbs&province=${state[i]}&timelines=false`;
				let result = await getJSON(stateURL);
				if (i == 0) {
					agent.add('According to my data, ');
				}

				if (i >= 1) {
					agent.add(`Also, `);
				}

				if (type.length >= 3) {
					agent.add(`There are currently: ${result.latest.confirmed} confirmed cases, ${result.latest.deaths} deaths , and ${result.latest.recovered} people who recovered from COVID-19 in ${state[i]}`);
					return;
				}

				for (let j = 0; j < type.length; j++) {
					if (j >= 1) {
						agent.add(`In addition, `);
					}

					switch (type[j]) {
						case 'confirmed':
							agent.add(`There are currently ${result.latest.confirmed} confirmed cases of COVID-19,`);
							break;
						case 'deaths':
							agent.add(`There are currently ${result.latest.deaths} deaths because of COVID-19,`);
							break;
						case 'recovered':
							agent.add(`There are currentlty ${result.latest.recovered} people who have recovered from COVID-19. I hope this number increases,`);
							break;
						default: //all conditions 
							agent.add(`There are currently: ${result.latest.confirmed} confirmed cases, ${result.latest.deaths} deaths, and ${result.latest.recovered} people who recovered from COVID-19,`);
					}
				}
				agent.add(`in ${state[i]}.`);
			}
			return response;
		} else if (country && country.length) {
			let response;
			for (let i = 0; i < country.length; i++) {
				let countryCode = country[i]['alpha-2'];
				let countryName = country[i].name;
				let countryURL = `${baseURL}?source=jhu&country_code=${countryCode}&timelines=false`;
				let result = await getJSON(countryURL);
				if (i == 0) {
					agent.add('According to my data, ');
				}

				if (i >= 1) {
					agent.add(`Also, `);
				}

				if (type.length >= 3) {
					agent.add(`There are currently: ${result.latest.confirmed} confirmed cases, ${result.latest.deaths} deaths , and ${result.latest.recovered} people who recovered from COVID-19 in ${countryName}`);
					return;
				}

				for (let j = 0; j < type.length; j++) {
					if (j >= 1) {
						agent.add(`In addition, `);
					}

					switch (type[j]) {
						case 'confirmed':
							agent.add(`There are currently ${result.latest.confirmed} confirmed cases of COVID-19,`);
							break;
						case 'deaths':
							agent.add(`There are currently ${result.latest.deaths} deaths because of COVID-19,`);
							break;
						case 'recovered':
							agent.add(`There are currentlty ${result.latest.recovered} people who have recovered from COVID-19. I hope this number increases,`);
							break;
						default: //all conditions 
							agent.add(`There are currently: ${result.latest.confirmed} confirmed cases, ${result.latest.deaths} deaths, and ${result.latest.recovered} people who recovered from COVID-19,`);
					}
				}
				agent.add(`in ${countryName}.`);
			}
			return response;
		}
	}

	let intentMap = new Map();
	intentMap.set('Default Welcome Intent', welcome);
	intentMap.set('Default Fallback Intent', fallback);
	intentMap.set('WorldWide Latest Stats', worldwideLatestStats);
	intentMap.set('Location Latest Stats', locationLatestStats);
	agent.handleRequest(intentMap);
});
