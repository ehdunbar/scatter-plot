import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import styled from 'styled-components'


const Container = styled.div`
`;


export default class Scatter extends React.Component {
  constructor (props) {
    super(props)

    // Feed the highchart chart options here
    this.options = {
        chart: {
            type: 'scatter',
            zoomType: 'xy'
        },
        title: {
            text: 'The Greatest Scatter Chart Known to Mankind'
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

  // Render Function
  render() {

    ////////////// EVERYTHING FROM InBetweenClass' Render Function //////////////


    // Take a JSON blob from the query results, then convert it into a JSON blob High charts can display
    let dataToRender = []
    let data_array = this.props.data
    let number_of_rows = this.props.data.length
    let number_of_dimensions = this.props.queryResponse.fields.dimensions.length
    let scaling_factor = 1/10000
    
    // For each row in my data
    for (let x = (number_of_rows - 1); x >= 0; x--) {

      let temp_json_blob = {}

      // For each dimension/column in my data
      for(let i = 0; i < number_of_dimensions; i++) {
        // TODO: Add temp variable that captures column value using this guy (this.props.queryResponse.fields.dimensions[i].name.value)
        let column_name = this.props.queryResponse.fields.dimensions[i].name

        // X Axis: Close Date Dimension
        if(column_name == "opportunity.close_date") {
          let dateAsArray = data_array[x][column_name].value.split("-") // splits a date string into a three-piece array
          let year = parseInt(dateAsArray[0])
          let month = parseInt(dateAsArray[1]) - 1 // javascript starts month at 0 rather than 1
          let day = parseInt(dateAsArray[2])

          temp_json_blob.x = (Date.UTC(year,month,day))

          // Formatting date for tooltip
          temp_json_blob.formatted_x = dateAsArray.join("-")
        }
        // Y Axis: Days Open Dimension
        else if(column_name == "opportunity.days_open") {
          temp_json_blob.y = data_array[x][column_name].value
        }
        // Tooltip Header: Opportunity Name
        else if(column_name == "opportunity.name") {
          temp_json_blob.name = data_array[x][column_name].value
        }
        // Marker Color: Probability
        else if(column_name == "opportunity.probability") {
          temp_json_blob.probability = data_array[x][column_name].value
        }
        // Marker Radius: Deal Size
        else if(column_name == "opportunity.amount") {
          temp_json_blob.amount = data_array[x][column_name].value || 0

          // Some jank scaling, might want to use log to get the right proportions?
          temp_json_blob.marker = {}
          temp_json_blob.marker.radius = data_array[x][column_name].value*scaling_factor
        }
      }

      // temp_json_blob should be ready to go for Highcharts now
      dataToRender.push(temp_json_blob)
    }

    //////////////////////////////////////////////////////////////////////////

    const options = { ...this.options }
    options.series = []

    //////////////////////////// COLOR ASSIGNMENT ////////////////////////////

    /*
        1. Figure out how many colors the user provided; say X
        2. Divide that into X chunks, ordered in smallest to biggest
        3. Then stuff each data point into a given series based on which chunk they fall into
    */
    let number_of_colors = this.props.config.color.length
    const MAX_PROBABILITY = 100
    let bucket_step = MAX_PROBABILITY/number_of_colors
    let buckets = []

    // Create the buckets
    for(let i = number_of_colors - 1; i >= 0; i--) {
        let bucket_ceiling = 100 - bucket_step*i

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
    dataToRender.map(d => {

        // Let's find the bucket this piece of data belongs to
        for(let i = 0; i < buckets.length; i++) {
            if(d.probability < buckets[i]) {
                options.series[i].data.push(d)
                break
            }
        }
    })

    //////////////////////////////////////////////////////////////////////////

    // Format Options
    options.chart.height = document.documentElement.clientHeight - 50

    // Now that we've created our data series, one for each bucket, let's put it all together by
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
