import React from "react";
import ReactDOM from "react-dom";
import Button from '@material-ui/core/Button';

// import "./index.css";

//import Tables from "./tables";
import LocalFS from "./storage/localfs";
new LocalFS();

//-----------------------------------------------------------------------------

/*
import SceneListEditor from "./scenelist";

ReactDOM.render(<SceneListEditor />, document.getElementById("root"));
*/

//-----------------------------------------------------------------------------
// Tests and such
//-----------------------------------------------------------------------------

//*

function App() {
  return (
    <Button variant="contained" color="primary">
      Hello World
    </Button>
  );
}

ReactDOM.render(<App />, document.getElementById('root')); //document.querySelector('#app'));
/**/

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

/*

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
          <h2>Time: {this.state.date.toLocaleTimeString()}.</h2>
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
