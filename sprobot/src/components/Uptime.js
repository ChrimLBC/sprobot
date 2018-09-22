import React, { Component } from 'react';
import '../App.css';
 
// Be sure to include styles at some point, probably during your bootstrapping
import 'react-switch-button/dist/react-switch-button.css';

export default class Uptime extends Component {
      constructor(props) {
        super(props);
        this.state = {
          uptime: 0
        }
      }

      componentWillUnmount() {
        this.clearUptime();
      }

      msToTime(timeInMS) {
        var pad = function(num, size) { return ('000' + num).slice(size * -1); }
        let seconds = Math.floor(timeInMS / 1000) % 60;
        let minutes = Math.floor(timeInMS / 60 / 1000) % 60;
        let hours = Math.floor(timeInMS / 3600 / 1000) % 24;
        return pad(hours,2) + ":" + pad(minutes,2) + ":" + pad(seconds,2)
      }

      startUptime(uptime) {
        this.setUptimeState(uptime)
        this.interval = setInterval(() => {
          this.setUptimeState(this.state.uptime);
        }, 1000);
      }

      setUptimeState(newUptime) {
        this.setState({
          uptimeFormatted: this.msToTime(newUptime + 1000),
          uptime: newUptime + 1000
        })
      }

      clearUptime() {
        clearInterval(this.interval);
        this.setState({
          uptimeFormatted: null,
          uptime: 0
        })
      }

      render() {
        return this.state.uptimeFormatted ? <span>{this.state.uptimeFormatted}</span> : null
      }
}

