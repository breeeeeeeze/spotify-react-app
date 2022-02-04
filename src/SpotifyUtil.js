import wrap from "./SpotifyAPIWrapperWrapper"

class SpotifyUtil {
	constructor(spotifyAPI, data) {
		this.Spotify = spotifyAPI
		this.today = new Date();
		this.albumTypes = [];
		for (const el in data.albumTypes) {
			if (data.albumTypes[el]) { this.albumTypes.push(el); }
		}
		this.country = data.country;
		this.days = data.days;
		this.playlistURI = data.playlistURI;
		this.playlistAuto = data.playlistAuto;
		this.checkedAlbums = [];
		this.extendedMixes = ['Extended Mix', 'Extended Dub Mix', 'Extended Vocal Mix', 'Extended Remix'];
		this.radioShows = ['Group Therapy','A State Of Trance','Destinations','Wake Your Mind Radio','Find Your Harmony','Tritonia','Call of the Wild','Monstercat Silk Showcase'];
		this.playlistCache = [];
	}

	setAccessToken(token) {
		this.Spotify.setAccessToken(token);
	}

	async getArtistList() {
		const artistList = [];
		//let response = await this.Spotify.getFollowedArtists()	
		let response = await wrap(this.Spotify.getFollowedArtists);
		artistList.push(...response.artists.items)
		 while(response.artists.next) {
		 	response = await wrap(this.Spotify.getGeneric, response.artists.next);
		 	artistList.push(...response.artists.items)
		 }
		return artistList;
		
	}

	async getArtistAlbums(id) {
		const artistAlbumList = [];

		try {
			{/*let response = await this.Spotify.getArtistAlbums(id, {limit: 50, album_type: this.albumTypes.join(','), country: this.country })*/}
			let response = await wrap(this.Spotify.getArtistAlbums, id, {limit: 50, album_type: this.albumTypes.join(','), country: this.country });
			artistAlbumList.push(...response.items);
			while(response.next) {
				// response = await this.Spotify.getGeneric(response.next);
				response = await wrap(this.Spotify.getGeneric, response.next);
				artistAlbumList.push(...response.items);
			}
		}
		catch (e) {
			console.log('Something whoopsied in getArtistAlbums');
			console.log(e);
		}
		return artistAlbumList;
	}

	checkDateDifference(date2) {
		const diffInMs = this.today - date2;
		return diffInMs/86400000;
	}

	async checkAlbum(album) {
		if (
			album.release_date_precision === 'day' &&
			!this.isRadioshow(album.name) &&
			this.checkDateDifference(Date.parse(album.release_date)) < this.days &&
			!this.checkedAlbums.includes(album.id)
		) {
			try {
				// const markets = await this.Spotify.getAlbum(album.id)
				const markets = await wrap(this.Spotify.getAlbum, album.id);
				if (markets.available_markets.includes(this.country)) {
					this.checkedAlbums.push(album.id);
					return true;
				}
			}
			catch (e) {
				console.log('Something whoopsied in checkAlbum');
				console.log(e);
			}
		}
		return false;	
	}

	async getTracks(id) {
		try {
			// return this.Spotify.getAlbumTracks(id)
			return wrap(this.Spotify.getAlbumTracks, id);
		}
		catch (e) {
			console.log('Something whoopsied in getTracks');
			console.log(e);
		}
	}

	checkTrack(track, artist) {
		for (const a of track.artists) {
			if ((!artist || artist.name === a.name) && !this.isExtended(track.name)) {
				return true;
			}

		}
		return false;
	}

	isExtended(name) {
		for (const el of this.extendedMixes) {
			if (name.includes(el)) { return true; }
		}
		return false;
	}

	isRadioshow(name) {
		for (const el of this.radioShows) {
			if (name.includes(el)) { return true; }
		}
		return false;
	}

	addToPlaylistCache(id) {
		this.playlistCache.push(id);
	}

	async writePlaylist() {
		if (this.playlistAuto) { this.playlistURI = await this.makeAutoPlaylist() }
		const chunkedPlaylist = this.splitPlaylistCache();
		wrap(this.Spotify.replaceTracksInPlaylist, this.playlistURI, chunkedPlaylist[0]);
		if (chunkedPlaylist.length > 1){
			for (const el of chunkedPlaylist.slice(1)) {
				wrap(this.Spotify.addTracksToPlaylist, this.playlistURI, el);
			}
		}
	}

	splitPlaylistCache() {
		const chunkedPlaylist = [];
		const chunkSize = 50;
		for (let i=0; i<this.playlistCache.length; i+=chunkSize) {
			chunkedPlaylist.push(this.playlistCache.slice(i,i+chunkSize));
		}
		return chunkedPlaylist;
	}

	async makeAutoPlaylist() {
		let response = await wrap(this.Spotify.getUserPlaylists, undefined, {limit: 50})
		for (const playlist of response.items) {
			if (playlist.name === 'NewReleases-Artists') {
				return playlist.id;
			}
		}
		const userID = wrap(this.Spotify.getMe).id;
		response = wrap(this.Spotify.createPlaylist, userID, {name: 'NewReleases-Artists', description: 'Updated by RecentPlaylistGenerator'});
		return response.id;
	}

}

export default SpotifyUtil;