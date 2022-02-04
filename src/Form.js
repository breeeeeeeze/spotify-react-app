import React from "react";
import "./Form.css";

class Form extends React.Component {

	constructor(props){
		super(props)
	}

	render() {

		return (
		<div className="Form-Wrapper">
			<div className="Form">
				<ArtistsColumn 
					formData = {this.props.formData}
					handleInput = {this.props.handleInput}
					handleSubmit = {this.props.handleSubmit}
				/>
			</div>
		</div>
		);
	};
}

class ArtistsColumn extends React.Component {

	constructor(props){
		super(props)
	}

	render() {

		const albumTypes = ['Single','Album','Appears On','Compilation'];
		const filters = ['Extended Mixes','Radio Shows'];

		return (
			<div className="ArtistsForm">
				<form onSubmit={this.props.handleSubmit}>
					<div className="playlistAuto form-check">
						<input className="form-check-input" defaultChecked={this.props.formData.artists.playlistAuto} type="checkbox" name="playlistAuto" id="playlistAuto" value={this.props.formData.artists.playlistAuto} onChange={this.props.handleInput} />
						<label className="form-check-label" htmlFor="playlistAuto">Automatically create playlist</label>
					</div>
					{!this.props.formData.artists.playlistAuto && 
					<div className="playlistURI mb-3">
						<label htmlFor="playlistURIInput" className="form-label">Playlist URI</label>
						<input type="text" className="form-control" name="playlistURI" onChange={this.props.handleInput} value={this.props.formData.artists.playlistURI} id="playlistURIInputID" placeholder="spotify:playlist:37i9dQZF1DXcBWIGoYBM5M" aria-describedby="playlistURIHelp" />
					</div>
					}
					<div className="days mb-3">
						<label htmlFor="daysRange" className="form-label"> Days</label>
						<input type="number" className="form-control" name="days" onChange={this.props.handleInput}  placeholder="14" min="7" max="30" id="daysRange" />
					</div>
					<div className="country mb-3">
						<label htmlFor="countryField" className="form-label"> Market </label>
						<input type="text" className="form-control" name="country" maxLength="2" onChange={this.props.handleInput} value={this.props.formData.artists.country} placeholder="DE" id="countryField" />
					</div>
					<div className="albumTypesWrapper">
						<label className="albumTypesLabel"> Album types</label><br />
						{albumTypes.map((element) => 
							<CheckboxItem key={element}
								itemName={element}
								itemNameCleaned={element.toLowerCase().split(' ').join('')}
								itemType="albumTypes"
								formData = {this.props.formData}
								handleInput = {this.props.handleInput}
								/>
						)}
					</div>
					<div className="trackFilterWrapper">
						<label className="trackFilterLabel"> Filter tracks/albums </label><br />
						{filters.map((element) => 
							<CheckboxItem key={element}
								itemName={element}
								itemNameCleaned={element.toLowerCase().split(' ')[0]}
								itemType="trackFilter"
								formData={this.props.formData}
								handleInput={this.props.handleInput}
								/>
						)}
					</div>
					<div className="submitButtonWrapper">
						<input type="submit" className="btn btn-primary" value="Submit" />
					</div>
				</form>
			</div>
		);
	};
}

class CheckboxItem extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className="form-check form-check-inline">
				<input className="form-check-input" type="checkbox" name={this.props.itemType+"_"+this.props.itemNameCleaned} id={this.props.itemType+this.props.itemNameCleaned} value={this.props.formData.artists[this.props.itemType][this.props.itemNameCleaned]} onChange={this.props.handleInput} />
				<label className="form-check-label" htmlFor={this.props.itemType+this.props.itemNameCleaned}>{this.props.itemName}</label>
			</div>
		);

	};
}

export default Form;

