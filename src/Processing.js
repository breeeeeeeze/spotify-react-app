import React from 'react';
import SpotifyUtil from './SpotifyUtil';
import './Processing.css';
const SpotifyWebApi = require('spotify-web-api-js');

class Processing extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			nowProcessing: '',
			totalEntries: 0,
			processingEntry: 0,
			Spotify: new SpotifyUtil(new SpotifyWebApi(), this.props.data.artists),
			processingStep: 'Starting',
		};

		this.processSpotify = this.processSpotify.bind(this);
		this.sleep = this.sleep.bind(this);
	}

	componentDidMount() {
		if (!this.props.token) {
			throw Error('No token provided');
		}

	{/*	const sp = new SpotifyWebApi()
		sp.setAccessToken(this.props.token)
		console.log(sp);
		this.setState({
			Spotify: new SpotifyUtil(sp)
		})*/}

		this.processSpotify();
	}

	updateArtistDisplay(artist, entry) {
		this.setState({
			nowProcessing: artist,
			processingEntry: entry,
		});
	}

	sleep() {
		return new Promise(resolve => setTimeout(resolve, 100));
	}
	async processSpotify() {
		this.state.Spotify.setAccessToken(this.props.token);
		this.setState({
			processingStep: 'Collecting artists you follow',
		});
		const artistList = await this.state.Spotify.getArtistList();
		this.setState({
			processingStep: 'Finding recent releases',
			totalEntries: artistList.length,
		});

		let artistAlbumList = [];
		for (const [i, artist] of artistList.entries()) {
			this.updateArtistDisplay(artist.name, i + 1);
			artistAlbumList = await this.state.Spotify.getArtistAlbums(artist.id);
			for (const album of artistAlbumList) {
				if (await this.state.Spotify.checkAlbum(album)) {
					const tracks = await this.state.Spotify.getTracks(album.id);
					for (const track of tracks.items) {
						if (this.state.Spotify.checkTrack(track, artist)) {
							this.state.Spotify.addToPlaylistCache(`spotify:track:${track.id}`);
						}
					}
				}
			}
		}

		this.setState({
			processingStep: 'Filling playlist',
		});
		await this.state.Spotify.writePlaylist();

		this.setState({
			processingStep: 'Done!',
		});

	}

	render() {

		return (
			<ProcessingView
				nowProcessing={this.state.nowProcessing}
				processingEntry={this.state.processingEntry}
				totalEntries={this.state.totalEntries}
				processingStep={this.state.processingStep}
			/>
		);
	}
}

class ProcessingView extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className="ProcessingWrapper">
				<h2> {this.props.processingStep} </h2>
				{ this.props.processingStepb !== 'Done!' && (
					<div className="spinner-border" role="status">
  						<span className="visually-hidden">Loading...</span>
					</div>
				)}
				{(this.props.processingStep === 'Finding recent releases') && (
					<div className="processingNow">
						{this.props.nowProcessing}<br />
						{this.props.processingEntry}/{this.props.totalEntries}
					</div>
				)}
			</div>
		);
	}
}

export default Processing;