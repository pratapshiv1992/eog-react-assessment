import React, { PureComponent } from 'react';
import {
 LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceArea,
} from 'recharts';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import axios from 'axios';
const data = [
  { name: 1, pressure: 4.11, impression: 100 },
  { name: 2, pressure: 2.39, impression: 120 },
  { name: 3, pressure: 1.37, impression: 150 },
  { name: 4, pressure: 1.16, impression: 180 },
  { name: 5, pressure: 2.29, impression: 200 },
  { name: 6, pressure: 3, impression: 499 },
  { name: 7, pressure: 0.53, impression: 50 },
  { name: 8, pressure: 2.52, impression: 100 },
  { name: 9, pressure: 1.79, impression: 200 },
  { name: 10, pressure: 2.94, impression: 222 },
  { name: 11, pressure: 4.3, impression: 210 },
  { name: 12, pressure: 4.41, impression: 300 },
  { name: 13, pressure: 2.1, impression: 50 },
  { name: 14, pressure: 8, impression: 190 },
  { name: 15, pressure: 0, impression: 300 },
  { name: 16, pressure: 9, impression: 400 },
  { name: 17, pressure: 3, impression: 200 },
  { name: 18, pressure: 2, impression: 50 },
  { name: 19, pressure: 3, impression: 100 },
  { name: 20, pressure: 7, impression: 100 },
];

const getAxisYDomain = (from, to, ref, offset) => {
  const refData = data.slice(from - 1, to);
  let [bottom, top] = [refData[0][ref], refData[0][ref]];
  refData.forEach((d) => {
    if (d[ref] > top) top = d[ref];
    if (d[ref] < bottom) bottom = d[ref];
  });

  return [(bottom | 0) - offset, (top | 0) + offset];
};

const initialState = {
  data,
  left: 'dataMin',
  right: 'dataMax',
  refAreaLeft: '',
  refAreaRight: '',
  top: 'dataMax+1',
  bottom: 'dataMin-1',
  top2: 'dataMax+20',
  bottom2: 'dataMin-20',
  animation: true,
  metricValues:[],
  age:12,
  open:false

};

const getDateFromEpoch =(utcSeconds)=>{
let date = new Date(0);
date.setUTCSeconds(utcSeconds);
return date;
}

const MetricOption =({open,handleClose,handleOpen,age,handleChange,options=[]})=>{
  return (
    <form autoComplete="off">
      <FormControl style={{minWidth:"120px",margin: "40px 0px 40px 200px" }} >
        <InputLabel htmlFor="demo-controlled-open-select">Select a Metric Value</InputLabel>
        <Select
          open={open}
          onClose={handleClose}
          onOpen={handleOpen}
          value={age}
          onChange={handleChange}
          inputProps={{
            name: 'Select a Metric Value',
            id: 'demo-controlled-open-select',
          }}
        >
          {options.map((value)=><MenuItem value={value}>{value}</MenuItem>)}
          
        </Select>
      </FormControl>
    </form>
  );
}

export default class HistoricalChart extends PureComponent {
  constructor(props) {
    super(props);
    this.state = initialState;
  }

  zoom() {
    let { refAreaLeft, refAreaRight, data } = this.state;

    if (refAreaLeft === refAreaRight || refAreaRight === '') {
      this.setState(() => ({
        refAreaLeft: '',
        refAreaRight: '',
      }));
      return;
    }

    // xAxis domain
    if (refAreaLeft > refAreaRight) [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];

    // yAxis domain
    const [bottom, top] = getAxisYDomain(refAreaLeft, refAreaRight, 'pressure', 1);
    const [bottom2, top2] = getAxisYDomain(refAreaLeft, refAreaRight, 'impression', 50);

    this.setState(() => ({
      refAreaLeft: '',
      refAreaRight: '',
      data: data.slice(),
      left: refAreaLeft,
      right: refAreaRight,
      bottom,
      top,
      bottom2,
      top2,
    }));
  }

  componentDidMount(){    
    axios({
      url: 'https://react.eogresources.com/graphql',
      method: 'post',
      data: {
        query: `{
          getMetrics
        }`
      }
    }).then(({data:{data:{getMetrics:metricValues}}}) => {
      console.log('====>>>',metricValues);
      this.setState({metricValues});
    });
  }

  handleChange=(event)=>{
    this.setState({age:event.target.value});
  }

  handleClose=()=>{
    this.setState({open:false});
  }

  handleOpen=()=>{
    this.setState({open:true});
  }

  render() {
    const {
      data, left, right, refAreaLeft, refAreaRight, top, bottom, top2, bottom2,age,open,metricValues
    } = this.state;

    return (
      <div className="highlight-bar-charts" style={{ userSelect: 'none' }}>
        <MetricOption age={age} open={open} handleClose={this.handleClose} handleChange={this.handleChange} handleOpen={this.handleOpen} options={metricValues}  />

        <LineChart
          width={800}
          height={400}
          data={data}
          onMouseDown={e => this.setState({ refAreaLeft: e.activeLabel })}
          onMouseMove={e => this.state.refAreaLeft && this.setState({ refAreaRight: e.activeLabel })}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            allowDataOverflow
            dataKey="name"
            domain={[left, right]}
            type="number"
          />
          <YAxis
            allowDataOverflow
            domain={[bottom, top]}
            type="number"
            yAxisId="1"
          />
          <YAxis
            orientation="right"
            allowDataOverflow
            domain={[bottom2, top2]}
            type="number"
            yAxisId="2"
          />
          <Tooltip />
          <Line yAxisId="1" type="natural" dataKey="pressure" stroke="#8884d8" animationDuration={300} />
          <Line yAxisId="2" type="natural" dataKey="impression" stroke="#82ca9d" animationDuration={300} />

          {
            (refAreaLeft && refAreaRight) ? (
              <ReferenceArea yAxisId="1" x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.3} />) : null
            }
        </LineChart>

      </div>
    );
  }
}
