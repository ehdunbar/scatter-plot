import Scatter from './components/Scatter'
import React from 'react'
import ReactDOM from 'react-dom'

looker.plugins.visualizations.add({
  options: {
    color: {
      type: "array",
      label: "Color",
      display: "color",
      default: ["#5b5d9a"]
    }
  },
  // Looker runs this function first
  create: function(element, config) {
    element.innerHTML = `
      <style>
        .scatter-plot {
          width: 100%;
          height: 100%;
        }
        .highcharts-container {
        }
      </style>
    `;

    var container = element.appendChild(document.createElement("div"));
    container.className = "scatter-plot";

    this._textElement = container.appendChild(document.createElement("div"));

    // I don't know what this does to be honest
    this.scatter = ReactDOM.render(
      <Scatter
        done={false}
      />
     ,this._textElement
    );

  },
  // Called when state changes
  updateAsync: function(data, element, config, queryResponse, details, done) {

    this.clearErrors();

    if (queryResponse.fields.dimensions.length < 3) {
      this.addError({title: "Not Enough Dimensions", message: "This Visualization requires 3 dimensions."});
      return;
    }

    // console.log(data);

    this.scatter = ReactDOM.render(
      <Scatter
        key="scatter_chart"
        config={config}
        data={data}
        done={done}
        queryResponse={queryResponse}
      />,
      this._textElement
    );

    done()
  }
});
