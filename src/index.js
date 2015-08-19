/*
	Slack bot for team #ghostbusters on Habitica!
*/

// const Slack = require('slack-client');
import { default as Slack } from 'slack-client';
import { map, filter } from 'lodash/collection';
import { has } from 'lodash/object';
import { readFileSync } from 'fs';

// import api token
const token = readFileSync('apiToken', { encoding: 'utf8' });
const autoReconnect = true;
const autoMark = true;

const slack = new Slack(token, autoReconnect, autoMark);

const currentChannels = (channels) => map(
	filter(channels, (channel, key) => channel.is_member),
	(channel, key) => channel.name
);

const currentGroups = (groups) => map(
	filter(groups, () => group.is_open && !group.is_archived),
	(group, key) => group.name
);

slack.on('open', () => {
	const channels = currentChannels(slack.channels);
	const groups = currentGroups(slack.groups);
	const unreads = slack.getUnreadCount();

	console.log(`In channels: ${channels.join(', ')}`);
	console.log(`In groups: ${groups.join(', ')}`);
	console.log(`Unread messages: ${unreads}`);
});

slack.on('message', (message) => {
	const channel = slack.getChannelGroupOrDMByID(message.channel);
	const user = slack.getUserByID(message.user);
	const {type, ts, text} = message;

	const userName = has(user, 'name') ? user.name : 'UKNNOWN_USER';
	const channelName = channel ? channel.name : 'UKNOWN_CHANNEL';
	console.log(`[${type}:#${channelName}] ${userName} ${ts}> ${text}`);
});

slack.on('error', (err) => console.error(...err));

// let's go
slack.login();
