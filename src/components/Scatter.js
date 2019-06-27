import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import styled from 'styled-components'


const Container = styled.div``;

export default class Scatter extends React.Component {
  constructor (props) {
    super(props)

    // Highchart Options
    this.options = {
        chart: {
            type: 'scatter',
            zoomType: 'xy'
        },
        title: {
            text: 'Scatter Plot'
        },
        xAxis: {
            type: 'datetime',
            title: {
                enabled: true,
                text: 'X Axis Name'
            },
            startOnTick: true,
            endOnTick: true,
            showLastLabel: true,
            tickInterval: (24 * 3600 * 1000),
            labels: {
              formatter: function() {
                return Highcharts.dateFormat('%d-%b-%Y', (this.value));
              }
            }
        },
        yAxis: {
            title: {
                text: 'Y Axis Name'
            }
        },
        legend: {
            title: {text: 'Probability'},
            layout: 'vertical',
            align: 'left',
            verticalAlign: 'top',
            x: 100,
            y: 70,
            floating: true,
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
            borderWidth: 1
        },
        plotOptions: {
            scatter: {
                marker: {
                    radius: 5,
                    states: {
                        hover: {
                            enabled: true,
                            lineColor: 'rgb(100,100,100)'
                        }
                    },
                    symbol: "circle"
                },
                states: {
                    hover: {
                        marker: {
                            enabled: false
                        }
                    }
                },
                // TODO: make tooltip input dynamic
                tooltip: {
                  headerFormat:'<b>{point.point.name}</b><br>',
                  pointFormat: 'Close Date: <b>{point.formatted_x}</b><br/>Days Open: <b>{point.y}</b><br/>Opportunity Amount: <b>${point.amount}</b><br/>'
                }
            }
        },
        series: [],
        credits: {
            enabled: false
        }
    }
  }

  render() {

    this.options.xAxis.title.text = this.props.queryResponse.fields.dimensions[0].label;
    this.options.yAxis.title.text = this.props.queryResponse.fields.dimensions[1].label;

    const columnNameArray = this.props.queryResponse.fields.dimensions;
    var dataArray = this.props.data


    const formatedData = dataArray.map(row => {

      var dateAsArray = row[columnNameArray[0].name].value.split("-")
      var year = parseInt(dateAsArray[0])
      var month = parseInt(dateAsArray[1]) - 1
      var day = parseInt(dateAsArray[2])

      const x = (Date.UTC(year, month, day));
      const formatedX = dateAsArray.join("-");
      const y = row[columnNameArray[1].name].value;
      const name = row[columnNameArray[2].name].value;
      const probability = row[columnNameArray[3].name].value;
      const amount = row[columnNameArray[4].name].value || 0;
      const marker = row[columnNameArray[4].name].value * (1/10000)

      return {
        x: x,
        formated_x: formatedX,
        y: y,
        name: name,
        probability: probability,
        amount: amount,
        marker: { marker}
      };
    });

    const options = { ...this.options };
    options.series = [];

    options.series.push({
      name: "<100",
      marker: {
        fillColor: "rgb(48,219,224,0.3)",
        lineColor: "#30dbe0",
        lineWidth: 2
      },
      data: [...formatedData]
    })

    options.chart.height = document.documentElement.clientHeight - 50

    return (
      <Container>
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
        />
      </Container>
    )
  }
}
