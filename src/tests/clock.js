import React from "react";

export default class Clock extends React.Component
{
    constructor(props) {
        super(props);
        this.state = {date: new Date() };
        //this.state = {};
        //this.tick();
    }
    
    tick() {
        //app.console.log("Tick");
        this.setState({ date: new Date() });
    }

    componentDidMount() {
        this.timerID = setInterval(
          () => this.tick(),
          1000
        );
    }
    
    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    render() {
        return (
        <div>
          <h2>Time: {this.state.date.toLocaleTimeString()}.</h2>
        </div>
        );
    }
}
