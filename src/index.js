import React from "react";
import ReactDOM from "react-dom";

//import "./index.css";

//import Tables from "./tables";
// import LocalFS from "./storage/localfs";

//-----------------------------------------------------------------------------

/*
import SceneListEditor from "./scenelist";

ReactDOM.render(<SceneListEditor />, document.getElementById("root"));
*/

//-----------------------------------------------------------------------------
// Tests and such
//-----------------------------------------------------------------------------

//*

import {FileBrowser, XFileBrowser} from "./gui/filebrowser/filebrowser";
import CssBaseline from '@material-ui/core/CssBaseline';
import {Dialog} from "@material-ui/core";

ReactDOM.render(
  //<FileBrowser />,
  //<FileBrowser location="home"/>,
  // <FileBrowser directory={undefined} />,
  //<FileBrowser directory="./src" />,
  //<FileBrowser directory="/dev" />,  
  <FileBrowser directory="." />,
  //<FileBrowser directory="./node_modules" />,
  document.getElementById('root')
);

/**/

/*
import Clock from "./tests/clock";
ReactDOM.render(<Clock/>, document.getElementById('root'));
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
ReactDOM.render(
    <div id="main">
        <PlainText />
        <PlainText />
    </div>,
    document.getElementById('root')
);
/**/
