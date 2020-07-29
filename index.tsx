import React, { Component } from "react";
import { render } from "react-dom";
import Hello from "./Hello";
import "./style.css";

import BoxPlot from "./components/BoxPlot";
import data from "./dummy";

interface AppProps {}
interface AppState {
  name: string;
}

class App extends Component<AppProps, AppState> {
  constructor(props) {
    super(props);
    this.state = {
      name: "React"
    };
  }

  render() {
    return (
      <BoxPlot
        data={data}
        dimensions={{ svgWidth: 800, svgHeight: 500 }}
        themeName="dark"
        showBox
        showMedian
        showOutliers
        showWhiskers
      />
    );
  }
}

render(<App />, document.getElementById("root"));
