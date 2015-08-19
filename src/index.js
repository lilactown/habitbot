/*
	Slack bot for team #ghostbusters on Habitica!
*/

import * as slack from 'slack-client';
import { readFileSync } from 'fs';

// import api token
const token = readFileSync('apiToken', { encoding: 'utf8' });
console.log(token);
