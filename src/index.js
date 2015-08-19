/*
	Slack bot for team #ghostbusters on Habitica!
*/

// const Slack = require('slack-client');
import { default as Slack } from 'slack-client';
import { map, filter } from 'lodash/collection';
import { has, get } from 'lodash/object';
import { readFileSync } from 'fs';
import { habitApi } from './habit.js';

// import api token
const token = readFileSync('apiToken', { encoding: 'utf8' });
const autoReconnect = true;
const autoMark = true;

const slack = new Slack(token, autoReconnect, autoMark);

function sendToChannel(channel, text) {
	channel.send(text);
	console.log(`[${channel.name}] > ${text}`);
}

const commands = {
	hello(channel, user) {
		const message = `Hello, ${user.name}! My name is habitbot. Type "@habitbot: help" for more info.`;
		sendToChannel(channel, message);
	},
	say(channel, user, ...parts) {
		const message = parts.join(" ");
		sendToChannel(channel, message);
	},
	partyData(channel, user, path) {
		sendToChannel(channel, "Querying...");

		const getPath = (json) => {
			if (has(json, path)) {
				console.log(get(json, path));
				return get(json, path);
			}
			else {
				return "Value is undefined.";
			}
		};

		const sendValue = (value) => sendToChannel(channel, JSON.stringify(value));

		habitApi
			.getParty()
			.then(getPath)
			.then(sendValue)
			.catch((err) => console.error(err));
	},
	partyList(channel, user) {
		sendToChannel(channel, "Querying...");
	}
};

function isCommand(string) {
	return has(commands, string);
}

function runCommand(command, ...args) {
	return commands[command](...args);
} 

function parseCommand(channel, user, text) {
	const [command, ...args] = text.split(' ');
	if (isCommand(command)) {
		runCommand(command, channel, user, ...args);
	}
}

function currentChannels(channels) {
	return map(
		filter(channels, (channel, key) => channel.is_member),
		(channel, key) => channel.name
	);
}

function currentGroups(groups) {
	return map(
		filter(groups, () => group.is_open && !group.is_archived),
		(group, key) => group.name
	);
}

function isDirect(id, text) {
	const tag = `<@${id}>`;
	return text && text.substr(0, tag.length) === tag;
}

function stripTag(id, text) {
	const tag = `<@${id}>: `;
	return text.substr(tag.length);
}

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

	if (isDirect(slack.self.id, text)) {
		const userName = has(user, 'name') ? user.name : 'UKNNOWN_USER';
		const channelName = channel ? channel.name : 'UKNOWN_CHANNEL';
		const msg = stripTag(slack.self.id, text);

		console.log(`[${type}:#${channelName}] ${userName} ${ts}> ${msg}`);

		parseCommand(channel, user, msg);
	}
});

slack.on('error', (err) => console.error(err));

// let's go
slack.login();
