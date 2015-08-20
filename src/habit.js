// habitica API
import { Promise } from 'bluebird';
import { readFileSync } from 'fs';
import { get as httpGet } from 'https';


const config = JSON.parse(readFileSync('habit.json'));

function parseJSON(resolve, reject, response) {
	let jsonBody = '';
	response.on('data', (chunk) => { jsonBody += chunk; });
	response.on('end', () => {
		resolve (JSON.parse(jsonBody));
	});
	response.on('error', (err) => { reject (err); });
};

export const habitApi = {
	endpoint(endpoint, ...args) {
		// console.log(args);
		const urlArgs = args.join('/');
		const path = `/api/v2/${endpoint}/${urlArgs}`;
		return new Promise((resolve, reject) => {
			const options = {
				hostname: 'habitica.com',
				path: path,
				port: 443,
				headers: {
					"x-api-user": config.uid,
					"x-api-key": config.key
				}
			};
			const resolveJSON = (res) => parseJSON(resolve, reject, res);

			httpGet(options, resolveJSON);
		});
	},
	getParty() {
		return this.endpoint('groups', config.groupId);
	},
	getMember(id) {
		return this.endpoint('members', id);
	},
	getPartyMembersInfo() {
		return this.getParty()
			.then((json) => json.members.map((member) => member._id))
			.then((idArray) =>
				Promise.all(idArray.map((id) =>
					habitApi.getMember(id)
				))
			)
	}
};
