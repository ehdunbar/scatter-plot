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
        .scatter-chart {
          width: 100%;
          height: 100%;
        }
        .highcharts-container {
        } 
        
      </style>
    `;

    let container = element.appendChild(document.createElement("div"));
    container.className = "scatter-chart";

    this._textElement = container.appendChild(document.createElement("div"));

    this.chart = ReactDOM.render(
      <Scatter
        done={false}
      />
     ,this._textElement
    );

  },

  // When Looker receives data from the query, we run this guy
  // Changing viz config stuff forces a rerun on this guy
  updateAsync: function(data, element, config, queryResponse, details, done) {
    this.clearErrors();
    if (queryResponse.fields.dimensions.length < 3) {
      this.addError({title: "Not Enough Minerals (In a StarCraft Voice)", message: "You must construct additional dimensions (again, in a StarCraft voice)."});
      return;
    }

    

    this.scatter = ReactDOM.render(

      // CAN FEED THESE INTO Scatter.js instead of InBetweenClass (with some refactoring) which means I have access to all the InBetweenClass stuff
      // in Scatter.js
      <Scatter
        // From InBetweenClass
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
