/*
	Slack bot for team #ghostbusters on Habitica!
*/

// const Slack = require('slack-client');
import { default as Slack } from 'slack-client';
import _ from 'lodash';
import { readFileSync } from 'fs';

// import api token
const token = readFileSync('apiToken', { encoding: 'utf8' });
const autoReconnect = true;
const autoMark = true;

const slack = new Slack(token, autoReconnect, autoMark);

slack.on('open', () => {
	const channels = slack.channels;
	console.log(channels);
});

slack.on('error', (err) => console.error(...err));

// let's go
slack.login();
