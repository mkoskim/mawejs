import React from "react";
import ReactDOM from "react-dom";

//import Tables from "./tables";

import "./index.css";

//-----------------------------------------------------------------------------

/*
import SceneListEditor from "./scenelist";

ReactDOM.render(<SceneListEditor />, document.getElementById("root"));
*/

//-----------------------------------------------------------------------------
// Tests and such
//-----------------------------------------------------------------------------

/*
function Author(props)
{
    var { name } = props.author;
    return <div>Author: {name}</div>;
}

function Comment(props) {
  var {author, text, date} = props;
  return (
    <div className="Comment">
      <Author author={props.author} />
      <div className="Comment-text">
        {text}
      </div>
      <div className="Comment-date">
        {date}
      </div>
    </div>
  );
}

ReactDOM.render(
    <Comment author={{name: "Yes"}} text="1" date="2" />,
    document.getElementById('root')
);
/**/

/*
class Toggle extends React.Component {
  state = {isToggleOn: true};
  
  handleClick = (event) => {
    //console.log(event);
    this.setState(state => ({
      isToggleOn: !state.isToggleOn
    }));
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        {this.state.isToggleOn ? 'ON' : 'OFF'}
      </button>
    );
  }
}

ReactDOM.render(
  <Toggle />,
  document.getElementById('root')
);
/**/

//*
//const fs = require("fs")

//const ipc = window.require("electron").ipcRenderer;
//console.log(fs.readdirSync("/"));
console.log(window.fs.readdirSync("/"));

class Clock extends React.Component
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
          <h1>Hello, world!</h1>
          <h2>It is {this.state.date.toLocaleTimeString()}.</h2>
        </div>
        );
    }
}

ReactDOM.render(<Clock/>, document.getElementById('root'));

/**/

/*
ReactDOM.render(
    <div id="main">
        <PlainText />
        <PlainText />
    </div>,
    document.getElementById('root')
);
/**/
