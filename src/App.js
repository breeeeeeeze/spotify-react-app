import React, { Component } from "react";
import hash from "./hash";
import "./App.css";
import Processing from "./Processing";
import Form from "./Form";

export const authEndpoint = 'https://accounts.spotify.com/authorize';

// Replace with your app's client ID, redirect URI and desired scopes
const clientId = "1166f0e6c40b40c199eedadc85df690e";
const redirectUri = "http://localhost:3000";
const scopes = "user-read-private user-read-email user-follow-read playlist-modify-public user-read-recently-played user-library-read";

window.location.hash = "";

class App extends Component {
	
	constructor() {
		super();
		this.state = {
			formData: {
				artists: {
					submitted: false,
					playlistURI: '',
					playlistAuto: true,
					days: null,
					country: '',
					albumTypes: {
						single: true,
						album: true,
						appearson: false,
						compilation: false
					},
					trackFilter: {
						radio: true,
						extended: true
					}
				}
			},
			token: null,
			no_data: false,
		};

	this.handleInput = this.handleInput.bind(this);
	this.handleSubmit = this.handleSubmit.bind(this);
	this.validateDays = this.validateDays.bind(this);
	}

	validateDays(days) {
		if (days < 7) return 7;
		if (days > 30) return 30;
		return days;
	}

	validateMarkets(market) {
		const available_markets = ["AD","AE","AG","AL","AM","AO","AR","AT","AU","AZ","BA","BB","BD","BE","BF","BG","BH","BI","BJ","BN","BO","BR","BS","BT","BW","BY","BZ","CA","CH","CI","CL","CM","CO","CR","CV","CW","CY","CZ","DE","DJ","DK","DM","DO","DZ","EC","EE","EG","ES","FI","FJ","FM","FR","GA","GB","GD","GE","GH","GM","GN","GQ","GR","GT","GW","GY","HK","HN","HR","HT","HU","ID","IE","IL","IN","IS","IT","JM","JO","JP","KE","KG","KH","KI","KM","KN","KR","KW","KZ","LA","LB","LC","LI","LK","LR","LS","LT","LU","LV","MA","MC","MD","ME","MG","MH","MK","ML","MN","MO","MR","MT","MU","MV","MW","MX","MY","MZ","NA","NE","NG","NI","NL","NO","NP","NR","NZ","OM","PA","PE","PG","PH","PK","PL","PS","PT","PW","PY","QA","RO","RS","RU","RW","SA","SB","SC","SE","SG","SI","SK","SL","SM","SN","SR","ST","SV","SZ","TD","TG","TH","TL","TN","TO","TR","TT","TV","TW","TZ","UA","UG","US","UY","UZ","VC","VN","VU",	"WS",	"XK",	"ZA",	"ZM",	"ZW"]
		if (available_markets.includes(market)) return true;
		return false;
	}


	handleInput(event) {
		const target = event.target;
		let value = target.type === 'checkbox' ? target.checked : target.value;
		const name = target.name;

		let data = {...this.state.formData};

		if (name === "days") {
			value = this.validateDays(value);
		}

		if (name.split('_').length === 2) {
			data.artists[name.split('_')[0]][name.split('_')[1]] = value;
		} else {
			data.artists[name] = value;
		}

		this.setState({ data });
	}

	handleSubmit(event) {
		event.preventDefault();
		if (!this.validateMarkets(this.state.formData.artists.country)) alert(`${this.state.formData.artists.country} is not a valid market.`);
		const checkboxes = this.state.formData.artists.albumTypes
		if (!(checkboxes.single || checkboxes.album || checkboxes.appearson || checkboxes.compilation)) alert(`At least one album type must be selected.`)
		let data = {...this.state.formData}
		

		data.artists.submitted = true;
		this.setState({ data });
		console.log('Submitted');
	}



	componentDidMount() {
		// Set token
		let _token = hash.access_token;
		if (_token) {
			// Set token
			this.setState({
				token: _token
			});
		}
	}

	render() {
		return (
			<div className="App">
				<header className="App-header">
					{/* <img src={logo} className="App-logo" alt="logo" /> */}
					<h1> RecentPlaylistGenerator </h1>
				</header>
				<div className="App-body">
					{ !this.state.token && (
						<a
								className="btn btn-light"
								href={`${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${encodeURI(scopes)}&response_type=token&show_dialog=true`}
							>
								Login to Spotify
							</a>
					)}
					{ this.state.token && !this.state.formData.artists.submitted && (
						<div className="main-wrapper">
							<Form 
								formData = {this.state.formData}
								handleInput = {this.handleInput}
								handleSubmit = {this.handleSubmit}
							/>
						</div>
					)}
					{ this.state.token && this.state.formData.artists.submitted && (
						<Processing 
							procType = "artists"
							data = {this.state.formData}
							token = {this.state.token}
						/>
					)}
				</div>
			</div>
		);
	}

}
export default App;