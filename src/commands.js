// commands file

import { Promise } from 'bluebird';
import { habitApi } from './habit.js';
import { map, filter } from 'lodash/collection';
import { has, get } from 'lodash/object';

function sendToChannel(channel) {
	return function (text) {
		channel.send(text);
		console.log(`[#${channel.name}] > ${text}`);
	};
}

const commands = {
	hello(channel, user) {
		const message = `Hello, ${user.name}! My name is habitbot. Type "@habitbot: help" for more info.`;
		sendToChannel(channel)(message);
	},
	help(channel, user) {
		sendToChannel(channel)(
			`I am a helper bot for your Habitica party! Here is my current list of commands:
				- say <message>: say something in your channel
				- list: get the current list of party members
				- stats <stat>: get the current value of <stat> for each party member
				- partyData <path>: retrieve the raw group object and output the value at <path> [volatile]
			If you have any questions, concerns, or praise, heap it upon lilactown. Thanks!`
		);
	},
	say(channel, user, ...parts) {
		const message = parts.join(" ");
		sendToChannel(channel)(message);
	},
	partyData(channel, user, path) {
		const send = sendToChannel(channel);
		send("Querying...");

		const getPath = (json) => {
			if (has(json, path)) {
				console.log(get(json, path));
				return get(json, path);
			}
			else {
				return "Value is undefined.";
			}
		};

		const sendValue = (value) => send(JSON.stringify(value));

		habitApi
			.getParty()
			.then(getPath)
			.then(sendValue)
			.catch((err) => console.error(err));
	},
	list(channel, user) {
		const send = sendToChannel(channel);
		send("Querying...");

		habitApi
			.getParty()
			.then((json) => json.members.map((member) => member.profile.name).join(', '))
			.then(send)
			.catch((err) => console.error(err));
	},
	stats(channel, user, stat) {
		const send = sendToChannel(channel);
		send("Querying...");

		habitApi
			.getParty()
			.then((json) => json.members.map((member) => member._id))
			.then((idArray) =>
				Promise.all(idArray.map((id) =>
					habitApi.getMember(id)
				))
			)
			.then((members) => members.map((member) => `${member.profile.name}: ${Math.round(member.stats[stat])} ${stat}`).join(', '))
			.then(send)
			.catch((err) => console.error(err));
	}
};

module.exports = commands;
