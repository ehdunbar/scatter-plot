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

    // Setting axis
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

    console.log("New Data Below")
    console.log(formatedData);


    //////////////////////////////////////////////////////////////////////////

    const options = { ...this.options }
    options.series = []

    //////////////////////////// COLOR ASSIGNMENT ////////////////////////////

    /*
        1. Figure out how many colors the user provided; say X
        2. Divide that into X chunks, ordered in smallest to biggest
        3. Then stuff each data point into a given series based on which chunk they fall into
    */
    var number_of_colors = this.props.config.color.length
    const MAX_PROBABILITY = 100
    var bucket_step = MAX_PROBABILITY/number_of_colors
    var buckets = []

    // Create the buckets
    for(var i = number_of_colors - 1; i >= 0; i--) {
        var bucket_ceiling = 100 - bucket_step*i

        buckets.push(bucket_ceiling) // Create a new bucket with ceiling = bucket_ceiling
        options.series.push({}) // Create a series per bucket


        options.series[(number_of_colors - 1) - i].name = "<" + Math.round(bucket_ceiling, 2).toString()
        // options.series[(number_of_colors - 1) - i].color = this.props.config.color[(number_of_colors - 1) - i]

        // Testing opacity //
        var hexToRGB = function (hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }
        options.series[(number_of_colors - 1) - i].marker = {}
        options.series[(number_of_colors - 1) - i].marker.fillColor = "rgb(" + hexToRGB(this.props.config.color[(number_of_colors - 1) - i]).r.toString() + "," + hexToRGB(this.props.config.color[(number_of_colors - 1) - i]).g.toString() + "," + hexToRGB(this.props.config.color[(number_of_colors - 1) - i]).b.toString() + "," +"0.3)"

        console.log(options.series[(number_of_colors - 1) - i].marker.fillColor)

        options.series[(number_of_colors - 1) - i].marker.lineColor = this.props.config.color[(number_of_colors - 1) - i]
        options.series[(number_of_colors - 1) - i].marker.lineWidth = 2

        ///////////////////////

        options.series[(number_of_colors - 1) - i].data = []
    }

    // For each of row of data in my result
    formatedData.map(d => {

        // var's find the bucket this piece of data belongs to
        for(var i = 0; i < buckets.length; i++) {
            if(d.probability < buckets[i]) {
                options.series[i].data.push(d)
                break
            }
        }
    })

    //////////////////////////////////////////////////////////////////////////

    // Format Options
    options.chart.height = document.documentElement.clientHeight - 50

    // Now that we've created our data series, one for each bucket, var's put it all together by
    // adding these series to the series in the attribute to the chart options
    // BY THE END OF THIS CHAIN, WE SHOULD HAVE X NUMBER OF SERIES CORRESPONDING TO THE NUMBER OF PROBABILITY GROUPS

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
