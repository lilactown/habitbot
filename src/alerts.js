// alerts

const _alerts = [];

export function register(alertFn) {
	_alerts.push(alertFn);
}

export function runEach(cb) {
	_alerts.length || cb("No alerts set at this time.");
	_alerts.forEach((alert) => alert().then(cb));
}
