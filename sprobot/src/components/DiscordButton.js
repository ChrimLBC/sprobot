import React, { Component } from 'react';
import Switch from 'react-switch';
import '../App.css';
import 'ws';
import { connect } from 'react-redux'
import Uptime from './Uptime.js';
import { updateSprobot } from "../actions/Actions"
 
// Be sure to include styles at some point, probably during your bootstrapping
import 'react-switch-button/dist/react-switch-button.css';
import { parseStatus } from '../utils/parser';

class DiscordContainer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      error: null
    }
  }

      handleChange = (checked) => {
        console.log(process.env.REACT_APP_DISCORD_TOKEN)
        if (checked) {
            //run sprobot
            fetch('/api/connect', {
              method: "POST",
              mode: "cors", // no-cors, cors, *same-origin
              cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
              credentials: "same-origin", // include, same-origin, *omit
              headers: {
                "Content-Type": "application/json; charset=utf-8",
                // "Content-Type": "application/x-www-form-urlencoded",
              },
              body: JSON.stringify({token: process.env.REACT_APP_DISCORD_TOKEN})
            }).then(res => {
              return res.json();
            }).then(res => {
              this.setState({ 
                error: res.error
              });
              res.error && setTimeout(() => { this.setState({error: undefined}) }, 5000)
              console.log("started bot")
            }).catch(res => { 
              this.setState({ error : "Failed to connect"})
              setTimeout(() => { this.setState({error: undefined}) }, 5000)
             });
            
        }
        else {
            //stop sprobot
            fetch('/api/disconnect', {
              method: "POST",
              mode: "cors",
              body: JSON.stringify({token: process.env.REACT_APP_DISCORD_TOKEN})
            }).then(res => {
              return res.json();
            }).then(res => {
              console.log("stopped bot");
            }).catch(res => { 
              this.setState({ error : "Failed to disconnect"})
              setTimeout(() => { this.setState({error: undefined})}, 5000)
             });
        }
      }

      componentWillReceiveProps(nextProps) {
        if (nextProps.discordStatus !== "Disconnected" && this.props.discordStatus === "Disconnected") {

          this.timer.startUptime(nextProps.discordUptime);
        }

        if (nextProps.discordStatus === "Disconnected" && this.props.discordStatus !== "Disconnected") {
          this.timer.clearUptime();
        }
      }

      componentDidMount() {
        //Check status and set checked
        fetch('/api/client').then(res => {
          return res.json();
        }).then(res => {
          this.props.updateStatus(res.clientStatus, res.uptime);
          res.status && this.timer.startUptime(res.uptime);
        }).catch(res => { 
          this.setState({ error : "Failed to determine status of Discord Client"})
          setTimeout(() => { this.setState({error: undefined})}, 5000)
         });
      }

      render() {
        return (
          <div>
            <label htmlFor="normal-switch">
              <span style={{fontSize: 32, fontStyle: 'bold'}}>
                  Sprobot&nbsp;&nbsp;
              </span>
              <Switch
                onChange={this.handleChange}
                checked={this.props.discordStatus === "Disconnected" ? false : true}
                id="normal-switch"
              />
              {this.state.error && <span>&nbsp;&nbsp;{this.state.error}</span>}
            </label>
            <div>
              <label htmlFor="uptime">
                <span style={{fontSize: 32, fontStyle: 'bold'}}>
                  Uptime:
                </span>
                <Uptime id="uptime" ref={(el) => this.timer = el}/>
              </label>
            </div>
            <div>
              <label htmlFor="status">
                <span style={{fontSize: 32, fontStyle: 'bold'}}>
                  Status:&nbsp;
                </span>
                <span id="status">
                  {this.props.discordStatus}
                </span>
              </label>
            </div>
          </div>
        );
      }
}

const mapStateToProps = (state) =>{ return {
  discordStatus: state.discord ? state.discord.status : parseStatus(5), // discord is a reducer
  discordUptime: state.discord ? state.discord.uptime : 0
 }
}

const mapDispatchToProps = dispatch => ({
  updateStatus: (status, uptime) => {
    dispatch(updateSprobot(status, uptime))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(DiscordContainer)