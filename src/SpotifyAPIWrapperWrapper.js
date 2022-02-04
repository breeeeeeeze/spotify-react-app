function delay(t, v) {
	return new Promise(function(resolve) {
		setTimeout(resolve.bind(null, v), t);
	});
}

export default async function wrap(...args) {
	const SpotifyAPI = args[0];
	const status_codes = [500, 502, 503, 504];
	try {
		if (args.length === 1) { return await SpotifyAPI(); }
		else if (args.length === 2) { return await SpotifyAPI(args[1]); }
		else { return await SpotifyAPI(...(args.slice(1))); }
	}
	catch(e) {
		if (e.status === 429) {
			const timeout = e.getResponseHeader('retry-after');
			console.log(`I'm getting rate limited :( Retrying in ${timeout} seconds)`);
			return delay(timeout * 1000).then(() => {
				if (args.length === 1) { return wrap(SpotifyAPI); }
				else { return wrap(...args); }
			});
		}
		else if (status_codes.includes(e.status)) {
			return delay(10).then(() => {
				if (args.length === 1) { return wrap(SpotifyAPI); }
				else { return wrap(...args); }
			});
		}
		else {
			throw(e);
		}
	}
}