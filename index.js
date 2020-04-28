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
		agent.add(`I am not sure how to handle this input. I can answer only questions related to COVID-19 Stats.`);
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
						agent.add(`There are currently ${result.latest.recovered} people who have recovered from COVID-19. I hope this number increases.`);
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
		let country = agent.parameters.country;
		let state = agent.parameters['geo-state'];
		let city = agent.parameters['geo-city'];
		let county = agent.parameters.county;
		const baseURL = `https://coronavirus-tracker-api.ruizlab.org/v2/locations`;
		console.log(agent.parameters);

		if (country && country.length) {
			let response;
			for (let i = 0; i < country.length; i++) {
				let countryCode = country[i]['alpha-2'];
				let countryName = country[i].name;
				try {
					let countryURL = `${baseURL}?source=jhu&country_code=${countryCode}&timelines=false`;
					let result = await getJSON(encodeURI(countryURL));
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
								agent.add(`There are currently ${result.latest.recovered} people who have recovered from COVID-19. I hope this number increases,`);
								break;
							default: //all conditions 
								agent.add(`There are currently: ${result.latest.confirmed} confirmed cases, ${result.latest.deaths} deaths, and ${result.latest.recovered} people who recovered from COVID-19,`);
						}
					}
					agent.add(`in ${countryName}.`);
				} catch (error) {
					console.log(`Error in country data:`, error);
				}
			}
			return response;
		} else if (county && county.length && state && state.length) {
			let response, countyName;
			for (let i = 0; i < county.length; i++) {
				try {
					countyName = county[i];
					county[i] = county[i].replace(/ County| Parish/gi, "");
					let countyURL;
					if (state.length === county.length) {
						countyURL = `${baseURL}?source=csbs&province=${state[i]}&county=${county[i]}&timelines=false`;
					} else {
						countyURL = `${baseURL}?source=csbs&province=${state[0]}&county=${county[i]}&timelines=false`;
					}
					let result = await getJSON(encodeURI(countyURL));
					if (i == 0) {
						agent.add('According to my data, ');
					}

					if (i >= 1) {
						agent.add(`Also, `);
					}

					if (type.length >= 3) {
						agent.add(`There are currently: ${result.latest.confirmed} confirmed cases, ${result.latest.deaths} deaths , and ${result.latest.recovered} people who recovered from COVID-19 in ${county[i]}`);
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
								agent.add(`There are currently ${result.latest.recovered} people who have recovered from COVID-19. I hope this number increases,`);
								break;
							default: //all conditions 
								agent.add(`There are currently: ${result.latest.confirmed} confirmed cases, ${result.latest.deaths} deaths, and ${result.latest.recovered} people who recovered from COVID-19,`);
						}
					}
					if (state.length === county.length) {
						agent.add(`in ${countyName}, ${state[i]}.`);
					} else {
						agent.add(`in ${countyName}, ${state[0]}.`);
					}

				} catch (error) {
					console.log(`Error in county and state data:`, error);
				}
			}
			return response;
		} else if (state && state.length) {
			let response;
			for (let i = 0; i < state.length; i++) {
				try {
					let stateURL = `${baseURL}?source=csbs&province=${state[i]}&timelines=false`;
					let result = await getJSON(encodeURI(stateURL));
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
								agent.add(`There are currently ${result.latest.recovered} people who have recovered from COVID-19. I hope this number increases,`);
								break;
							default: //all conditions 
								agent.add(`There are currently: ${result.latest.confirmed} confirmed cases, ${result.latest.deaths} deaths, and ${result.latest.recovered} people who recovered from COVID-19,`);
						}
					}
					agent.add(`in ${state[i]}.`);
				} catch (error) {
					console.log(`Error in state data:`, error);
				}
			}
			return response;
		} else if (county && county.length) {
			let response;
			for (let i = 0; i < county.length; i++) {
				try {
					county[i] = county[i].replace(/ County| Parish/gi, "");
					let countyURL = `${baseURL}?source=csbs&county=${county[i]}&timelines=false`;
					let result = await getJSON(encodeURI(countyURL));
					if (i == 0) {
						agent.add('According to my data, ');
					}

					if (i >= 1) {
						agent.add(`Also, `);
					}

					if (type.length >= 3) {
						agent.add(`There are currently: ${result.latest.confirmed} confirmed cases, ${result.latest.deaths} deaths , and ${result.latest.recovered} people who recovered from COVID-19 in ${county[i]}`);
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
								agent.add(`There are currently ${result.latest.recovered} people who have recovered from COVID-19. I hope this number increases,`);
								break;
							default: //all conditions 
								agent.add(`There are currently: ${result.latest.confirmed} confirmed cases, ${result.latest.deaths} deaths, and ${result.latest.recovered} people who recovered from COVID-19,`);
						}
					}
					agent.add(`in ${county[i]} County.`);
				} catch (error) {
					console.log(`Error in county data:`, error);
				}
			}
			return response;
		} else {
			//default case, could not find the location; error-control
			agent.add(`Could not find data for the entered location. Please try again!`);
		}
	}

	async function locationStatsTimeline(agent) {
		const type = agent.parameters.type;
		let country = agent.parameters.country;
		let datePeriod = agent.parameters['date-period'];
		let startDate = datePeriod.startDate;
		let endDate = datePeriod.endDate;
		const baseURL = `https://coronavirus-tracker-api.ruizlab.org/v2/locations`;
		console.log(agent.parameters);
		
		let response;
		if (country && country.length) {
			for (let i = 0; i < country.length; i++) {
				let countryCode = country[i]['alpha-2'];
				let countryName = country[i].name;
				try {
					let countryURL = `${baseURL}?source=jhu&country_code=${countryCode}&timelines=true`;
					let result = await getJSON(encodeURI(countryURL));
					console.log(result);
					let locationsObj = result.locations;
					let confirmedCount = 0, deathsCount = 0, recoveredCount = 0;
					if (i == 0) {
						agent.add('According to my data, ');
					}
	
					if (i >= 1) {
						agent.add(`Also, `);
					}
	
					if (type.length >= 3) {
						confirmedCount = await returnCaseCount(locationsObj, 'confirmed', startDate, endDate, result.latest.confirmed);
						deathsCount = await returnCaseCount(locationsObj, 'deaths', startDate, endDate, result.latest.deaths);
						recoveredCount = await returnCaseCount(locationsObj, 'recovered', startDate, endDate, result.latest.recovered);
						agent.add(`There are ${confirmedCount} confirmed cases, ${deathsCount} deaths , and ${recoveredCount} people who recovered from COVID-19 in ${countryName} since the requested timeline.`);
						return;
					}
	
					for (let j = 0; j < type.length; j++) {
						if (j >= 1) {
							agent.add(`In addition, `);
						}
	
						switch (type[j]) {
							case 'confirmed':
								confirmedCount = await returnCaseCount(locationsObj, 'confirmed', startDate, endDate, result.latest.confirmed);
								agent.add(`There are ${confirmedCount} confirmed cases of COVID-19,`);
								break;
							case 'deaths':
								deathsCount = await returnCaseCount(locationsObj, 'deaths', startDate, endDate, result.latest.deaths);
								agent.add(`There are ${deathsCount} deaths because of COVID-19,`);
								break;
							case 'recovered':
								recoveredCount = await returnCaseCount(locationsObj, 'recovered', startDate, endDate, result.latest.recovered);
								agent.add(`There are ${recoveredCount} people who have recovered from COVID-19,`);
								break;
							default: //all conditions 
								confirmedCount = await returnCaseCount(locationsObj, 'confirmed', startDate, endDate, result.latest.confirmed);
								deathsCount = await returnCaseCount(locationsObj, 'deaths', startDate, endDate, result.latest.deaths);
								recoveredCount = await returnCaseCount(locationsObj, 'recovered', startDate, endDate, result.latest.recovered);
								agent.add(`There are ${confirmedCount} confirmed cases, ${deathsCount} deaths , and ${recoveredCount} people who recovered from COVID-19,`);
						}
					}
					agent.add(`in ${countryName} since the requested timeline.`);
				} catch (error) {
					console.log(`Error in country data:`, error);
				}
			}
			return response;
		} else {
			agent.add(`Could not find data for the entered location in the requested timeline. Please try again!`);
		}
		
	}

	async function returnCaseCount(locationObject, dataType, startDate, endDate, latestStat) {
		console.log(startDate, endDate);
		let count = 0, startValue = 0, endValue = 0;
		startDate = startDate.slice(0, 10);
		endDate = endDate.slice(0, 10);
		console.log(`SD: ${startDate}, ED: ${endDate}`);

		if (startDate === endDate) {
			//today case; not updated in the api
			return 0;
		}
		
		let timeObject;

		locationObject.forEach(currentLoc => {
			timeObject = currentLoc.timelines[`${dataType}`].timeline;
			for (let [key, value] of Object.entries(timeObject)) {
				if (key.includes(startDate)) {
					console.log(`Startvalue is: ${value}`);
					startValue += value;
				}
				if (key.includes(endDate)) {
					console.log(`Endvalue is: ${value}`);
					endValue += value;
				}
			}
		});

		if (endValue != 0) {
			count = endValue - startValue;
		} else {
			count = latestStat - startValue;
		}

		console.log(`The number returned is: ${count}`);
		return count;
	}

	let intentMap = new Map();
	intentMap.set('Default Welcome Intent', welcome);
	intentMap.set('Default Fallback Intent', fallback);
	intentMap.set('WorldWide Latest Stats', worldwideLatestStats);
	intentMap.set('Location Latest Stats', locationLatestStats);
	intentMap.set('Location Stats with Timeline', locationStatsTimeline);
	agent.handleRequest(intentMap);
});
