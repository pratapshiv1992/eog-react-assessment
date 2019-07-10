import React from 'react';
import ApexCharts from 'react-apexcharts';
import axios from 'axios';
import moment from 'moment';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';


const fetchDataFromGraphqlApi = (query,variables)=>{
    return axios({
        url: 'https://react.eogresources.com/graphql',
        method: 'post',
        data: {query,variables},
        headers: {
              'Content-Type': 'application/json'
        }
      })
}


const getMetricsQuery = `{getMetrics}`;
const getMultipleMeasurementsQuery = `query ($input: [MeasurementQuery]) {
  getMultipleMeasurements(input:$input) {
      metric
      measurements {
          at
          value
          metric
          unit
          }   
  }
}`

const MetricOption =({open,handleClose,handleOpen,selectedValue='tubingPressure',handleChange,options=['tubingPressure']})=>{
    return (
        <form autoComplete="off">
            <FormControl style={{minWidth:"120px",margin: "40px 0px 40px 200px" }} >
                <InputLabel htmlFor="demo-controlled-open-select">Select </InputLabel>
                <Select
                    open={open}
                    onClose={handleClose}
                    onOpen={handleOpen}
                    value={selectedValue}
                    onChange={handleChange}
                    inputProps={{
                        name: 'Select',
                        id: 'demo-controlled-open-select',
                    }}
                >
                    {options.map((value)=><MenuItem value={value}>{value}</MenuItem>)}

                </Select>
            </FormControl>
        </form>
    );
}


class App extends React.Component {      
    constructor(props) {
      super(props);

      this.state = {
        metricValues:[],
        open:false,
        selectedValue:'',
        options: {
          dataLabels: {enabled: false},
          stroke: {curve: 'smooth'},
          xaxis: {
            type: 'datetime',
            categories: [
                "Tue, 18 Sep 2018 18:30:00 GMT", "2018-09-19T01:00:00", "2018-09-19T02:30:00",
                "2018-09-19T03:30:00", "2018-09-19T04:30:00", "2018-09-19T05:30:00",
                "2018-09-19T09:30:00"
            ],
          },
          tooltip: {
            x: {format: 'dd/MM/yy HH:mm'},
          }
        },
        series: [{
          name: 'series2',
          data: [11, 32, 45, 32, 34, 52, 41]
        }],
    }}

    componentDidMount(){
        fetchDataFromGraphqlApi(getMetricsQuery,{})
        .then(({data:{data:{getMetrics:metricValues}}}) => {
          this.setState({metricValues});
        });
        this.fetchDataOnChange();
    }

    handleChange=(event)=>{
        this.setState({selectedValue:event.target.value});
        this.fetchDataOnChange(event.target.value);
    }

    fetchDataOnChange=(metricName='tubingPressure')=>{
      const inputVariables = {
        "input": [
           {
              metricName,
              "after": 1562736821958
           }
        ]
     }
     fetchDataFromGraphqlApi(getMultipleMeasurementsQuery,inputVariables).then(({data:{data:{getMultipleMeasurements}}}) => {
      let categoriesArray = [],seriesArray = [];
      getMultipleMeasurements[0].measurements.slice(0,50).forEach(object => {
        const date =  moment.unix(object.at).toISOString().replace('Z','');
        categoriesArray.push(date);
        seriesArray.push(object.value);
      });

      let options = {
        options: {
          dataLabels: {enabled: false},
          stroke: {curve: 'smooth'},
          xaxis: {
            type: 'datetime',
            categories:categoriesArray,
          },
          tooltip: {
            x: {format: 'dd/MM/yy HH:mm'},
          }
        },
        series: [{
          name: 'series2',
          data: seriesArray
        }],
      }
      this.setState({
        ...options
      });

    });
    }

    handleClose=()=>{
        this.setState({open:false});
    }

    handleOpen=()=>{
        this.setState({open:true});
    }



    render() {
      let {metricValues,open,selectedValue} = this.state;
      return (
        <div id="chart">
            <MetricOption selectedValue={selectedValue} open={open} handleClose={this.handleClose} handleChange={this.handleChange} handleOpen={this.handleOpen} options={metricValues}  />
          <ApexCharts options={this.state.options} series={this.state.series} type="area" height="350" />
        </div>
      );
    }
  }



export default App;