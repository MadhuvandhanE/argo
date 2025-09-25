import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Viewer, Entity, PointGraphics, EntityDescription } from 'resium';
import { Cartesian3, Color } from 'cesium';
import * as Cesium from 'cesium';
import Plot from 'react-plotly.js';
import { argoData, uniqueFloats, mockAlerts } from './mockData';
import Chatbot from './Chatbot';
import './App.css';

// Replace with your actual token from https://ion.cesium.com/
Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwMDI0MGRhOC00YTJmLTRmZGYtYTQyOS02ZmE3NDc5OWVlYjEiLCJpZCI6MzQxNTM0LCJpYXQiOjE3NTc5NDc5NTh9.fMi6I0wyf_5bSiC1DzOzJJf6wkk-yrB4TY_4rJjhVO4";

const calculateAverage = (floatId, parameter) => {
    const floatData = argoData.filter(d => d.float_id === floatId);
    if (floatData.length === 0) return null;
    const total = floatData.reduce((sum, item) => sum + item[parameter], 0);
    const average = total / floatData.length;
    return average.toFixed(1);
};

const locationToFloatId = {
  'kerala': 2901788,
  'sri lanka': 6330112,
  'bay of bengal': 3002541,
  'andaman': 4119870,
  'arabian sea': 1902345,
  'equator': 3456789
};
const floatIdToLocation = {
  2901788: 'the Kerala Coast',
  6330112: 'Sri Lanka',
  3002541: 'the Bay of Bengal',
  4119870: 'the Andaman Sea',
  1902345: 'the Arabian Sea',
  3456789: 'the Equator',
  5220455: 'the Southern Indian Ocean',
  8556789: 'near Australia',
  7440987: 'the Central Indian Ocean',
  9876543: 'the Sundarbans Delta'
};

function App() {
  const [selectedFloatId, setSelectedFloatId] = useState(uniqueFloats[0]?.float_id);
  const [selectedParameter, setSelectedParameter] = useState('temperature');
  const [messages, setMessages] = useState([{ text: "Hello! Click the bell for alerts or ask me a question.", sender: 'bot' }]);
  const [inputValue, setInputValue] = useState('');
  const [tableData, setTableData] = useState([]);
  const [tableMode, setTableMode] = useState('single');
  const [isChartVisible, setChartVisible] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [lastAlertContext, setLastAlertContext] = useState(null);
  const viewerRef = useRef(null);

  const selectedFloatData = useMemo(() => {
    if (!selectedFloatId) return [];
    return argoData.filter(d => d.float_id === selectedFloatId);
  }, [selectedFloatId]);

  useEffect(() => {
    if (viewerRef.current?.cesiumElement && selectedFloatId) {
      const viewer = viewerRef.current.cesiumElement;
      const selectedFloat = uniqueFloats.find(f => f.float_id === selectedFloatId);
      if (selectedFloat) {
        viewer.camera.flyTo({
          destination: Cartesian3.fromDegrees(selectedFloat.longitude, selectedFloat.latitude, 800000),
          orientation: { heading: Cesium.Math.toRadians(0.0), pitch: Cesium.Math.toRadians(-90.0) },
          duration: 3
        });
      }
    }
  }, [selectedFloatId]);

  const parameterExplanations = {
    temperature: "Sea surface temperature is a critical indicator of climate change and ocean health.",
    salinity: "Salinity measures the saltiness of ocean water and drives currents.",
    pressure: "Pressure is an indicator of depth, crucial for profiling ocean layers.",
    chlorophyll: "Chlorophyll-a is a proxy for phytoplankton, the base of the marine food web.",
    oxygen: "Dissolved oxygen is essential for marine life and a key indicator of ocean health.",
    nitrate: "Nitrate is a crucial nutrient (like fertilizer) for phytoplankton growth."
  };

  const handleParameterChange = (newParameter) => {
    setSelectedParameter(newParameter);
    setTableMode('single');
    if(selectedFloatId) {
      setTableData(argoData.filter(d => d.float_id === selectedFloatId));
    }
    setChartVisible(true);
  };
  
  const handleFloatClick = (floatId) => {
    setSelectedFloatId(floatId);
    setTableData(argoData.filter(d => d.float_id === floatId));
    setTableMode('single');
    setChartVisible(true);
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    const userMessage = { text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setTableData([]);
    const lowerInput = inputValue.toLowerCase();
    let botResponse = "I can't answer that. Try 'show temperature near Kerala'.";

    const parameters = ['temperature', 'salinity', 'pressure', 'chlorophyll', 'oxygen', 'nitrate'];
    const parameter = parameters.find(p => lowerInput.includes(p.substring(0,4)));
    const floatIdFromText = (lowerInput.match(/\d{7}/g) || []).map(Number)[0];
    const locationKey = Object.keys(locationToFloatId).find(loc => lowerInput.includes(loc));
    
    let targetFloatId = floatIdFromText || (locationKey ? locationToFloatId[locationKey] : null);

    if (lowerInput.includes('why') && lastAlertContext) {
      if (lastAlertContext.includes('heatwave')) {
        botResponse = "Marine heatwaves are often caused by atmospheric conditions and weaker ocean currents, leading to prolonged periods of unusually high sea surface temperatures.";
      } else if (lastAlertContext.includes('algal bloom')) {
        botResponse = "Algal blooms are often triggered by an excess of nutrients, like nitrates, combined with warm surface waters, which can lead to low oxygen zones.";
      } else if (lastAlertContext.includes('low oxygen')) {
        botResponse = "Low oxygen events can be caused by rising temperatures and biological activity, such as decaying algal blooms.";
      }
      setLastAlertContext(null);
    } else if (lowerInput.includes('where is') || lowerInput.includes('what are the floats near')) {
        const finalFloatId = targetFloatId || (locationKey ? locationToFloatId[locationKey] : null);
        if(finalFloatId && floatIdToLocation[finalFloatId]){
            botResponse = `Showing float ${finalFloatId}, located near ${floatIdToLocation[finalFloatId]}.`;
            setSelectedFloatId(finalFloatId);
        }
    } else if (lowerInput.includes('bgc') || lowerInput.includes('biogeochemical')) {
        const finalFloatId = targetFloatId || selectedFloatId;
        botResponse = `Analyzing Biogeochemical parameters for float ${finalFloatId}. The data is in the table.`;
        setSelectedFloatId(finalFloatId); 
        setSelectedParameter('chlorophyll');
        setTableData(argoData.filter(d => d.float_id === finalFloatId));
        setTableMode('bgc');
        setChartVisible(true);
    } else if (parameter && targetFloatId) {
        const avg = calculateAverage(targetFloatId, parameter);
        botResponse = `The average ${parameter} for float ${targetFloatId} is ${avg}.`;
        setSelectedFloatId(targetFloatId); 
        setSelectedParameter(parameter);
        setTableData(argoData.filter(d => d.float_id === targetFloatId));
        setTableMode('single');
        setChartVisible(true);
    } else if (targetFloatId && !parameter) {
        botResponse = `Showing float ${targetFloatId}. Displaying default parameter (Temperature).`;
        setSelectedFloatId(targetFloatId);
        setSelectedParameter('temperature');
        setTableData(argoData.filter(d => d.float_id === targetFloatId));
        setTableMode('single');
        setChartVisible(true);
    }

    setTimeout(() => { setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]) }, 1000);
    setInputValue('');
  };

  const handleAlertClick = (alert) => {
    setSelectedFloatId(alert.float_id);
    setSelectedParameter(alert.parameter);
    setTableData(argoData.filter(d => d.float_id === alert.float_id));
    setTableMode('single');
    setChartVisible(true);
    setShowAlerts(false);

    const botMessage = {
      text: `Alert: Investigating "${alert.title}". Panning to float ${alert.float_id} and displaying its ${alert.parameter} data.`,
      sender: 'bot'
    };
    
    setMessages(prev => [...prev, botMessage]);
    setLastAlertContext(alert.title.toLowerCase());
  };

  const chartStats = useMemo(() => {
    if (selectedFloatData.length === 0) return { minPoint: null, maxPoint: null, average: 0 };
    let min = selectedFloatData[0];
    let max = selectedFloatData[0];
    const total = selectedFloatData.reduce((sum, point) => {
      if (point[selectedParameter] < min[selectedParameter]) min = point;
      if (point[selectedParameter] > max[selectedParameter]) max = point;
      return sum + point[selectedParameter];
    }, 0);
    const average = total / selectedFloatData.length;
    return { minPoint: min, maxPoint: max, average: average };
  }, [selectedFloatData, selectedParameter]);

  return (
    <div className="app-container">
      <div className="sidebar">
          <h1>🛰️ ArgoSphere</h1>
          <p>AI-powered prototype for exploring ARGO float data.</p>
          <label htmlFor="param-select">Select Parameter:</label>
          <select id="param-select" value={selectedParameter} onChange={(e) => handleParameterChange(e.target.value)}>
              <option value="temperature">Temperature</option>
              <option value="salinity">Salinity</option>
              <option value="pressure">Pressure</option>
              <option value="chlorophyll">Chlorophyll</option>
              <option value="oxygen">Dissolved Oxygen</option>
              <option value="nitrate">Nitrate</option>
          </select>
          <h2>Selected Float: {selectedFloatId || 'None'}</h2>
          <p className="parameter-explanation">
            {parameterExplanations[selectedParameter]}
          </p>
          {tableData.length > 0 && isChartVisible && (
            <div className="sidebar-table-container">
              <h3>Query Results:</h3>
              <table className="sidebar-table">
                {tableMode === 'bgc' ? (
                  <>
                    <thead><tr><th>Time</th><th>Chloro</th><th>Oxygen</th><th>Nitrate</th></tr></thead>
                    <tbody>{tableData.map((row, index) => (<tr key={index}><td>{new Date(row.time).toLocaleDateString()}</td><td>{row.chlorophyll}</td><td>{row.oxygen}</td><td>{row.nitrate}</td></tr>))}</tbody>
                  </>
                ) : (
                  <>
                    <thead><tr><th>Time</th><th>{selectedParameter.slice(0, 4)}...</th></tr></thead>
                    <tbody>{tableData.map((row, index) => (<tr key={index}><td>{new Date(row.time).toLocaleDateString()}</td><td>{row[selectedParameter]}</td></tr>))}</tbody>
                  </>
                )}
              </table>
            </div>
          )}
      </div>
      <div className={`main-content ${isChartVisible ? 'chart-visible' : ''}`}>
        <div className="cesium-container">
          <Viewer full ref={viewerRef}>
            {uniqueFloats && uniqueFloats.map(float => (
              <Entity key={float.float_id} name={`Float ID: ${float.float_id}`} position={Cartesian3.fromDegrees(float.longitude, float.latitude, 0)} onClick={() => handleFloatClick(float.float_id)}>
                <PointGraphics pixelSize={8} color={selectedFloatId === float.float_id ? Cesium.Color.RED : Cesium.Color.ROYALBLUE} outlineColor={Cesium.Color.WHITE} outlineWidth={2}/>
                <EntityDescription><h1>Float ID: {float.float_id}</h1><p>Click to select</p></EntityDescription>
              </Entity>
            ))}
          </Viewer>
        </div>
        <div className="plotly-container">
          <button className="close-chart-btn" onClick={() => setChartVisible(false)}>X</button>
          {selectedFloatId && (
            <div className="plotly-wrapper">
              <Plot
                data={[ { x: selectedFloatData.map(d => d.time), y: selectedFloatData.map(d => d[selectedParameter]), type: 'scatter', mode: 'lines+markers', name: selectedParameter, line: { color: '#1f77b4', width: 3, shape: 'spline', smoothing: 1.0 }, marker: { size: 8, color: '#1f77b4' }, fill: 'tozeroy', fillcolor: 'rgba(31, 119, 180, 0.2)', customdata: selectedFloatData.map(d => ({ temp: d.temperature, sal: d.salinity, pres: d.pressure })), hovertemplate: `<b>Date</b>: %{x}<br>-----------------<br><b>Temp:</b> %{customdata.temp}°C<br><b>Salinity:</b> %{customdata.sal} PSU<br><b>Pressure:</b> %{customdata.pres} dbar<extra></extra>` } ]}
                layout={{
                  title: { text: `Analysis for Float ${selectedFloatId}`, font: { size: 18, color: '#2c3e50' } },
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: 'rgba(255, 255, 255, 0.6)',
                  margin: { l: 60, r: 60, t: 60, b: 50 },
                  xaxis: { gridcolor: '#e0e0e0', title: 'Date' },
                  yaxis: { title: selectedParameter, gridcolor: '#e0e0e0' },
                  hovermode: 'x unified',
                  shapes: [ { type: 'line', xref: 'paper', x0: 0, x1: 1, yref: 'y', y0: chartStats.average, y1: chartStats.average, line: { color: '#ff7f0e', width: 2, dash: 'dash' } } ],
                  annotations: [
                    { x: chartStats.maxPoint?.time, y: chartStats.maxPoint?.[selectedParameter], text: `Max: ${chartStats.maxPoint?.[selectedParameter]}`, showarrow: true, arrowhead: 4, ax: 0, ay: -30, font: { color: '#2ca02c' } },
                    { x: chartStats.minPoint?.time, y: chartStats.minPoint?.[selectedParameter], text: `Min: ${chartStats.minPoint?.[selectedParameter]}`, showarrow: true, arrowhead: 4, ax: 0, ay: 30, font: { color: '#d62728' } },
                    { xref: 'paper', x: 0.95, y: chartStats.average, text: `Avg: ${chartStats.average.toFixed(2)}`, showarrow: false, xanchor: 'left', font: { color: '#ff7f0e' } }
                  ]
                }}
                style={{ width: '100%', height: '100%' }}
                config={{ responsive: true, displaylogo: false }}
              />
            </div>
          )}
        </div>
      </div>
      <div className="chatbot-container">
        <div className="chatbot-header">
          <h2>FloatChat</h2>
          <div className="notification-bell" onClick={() => setShowAlerts(!showAlerts)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            <div className="notification-dot"></div>
          </div>
        </div>
        <Chatbot messages={messages} inputValue={inputValue} onInputChange={setInputValue} onSendMessage={handleSendMessage} />
      </div>
      {showAlerts && (
        <div className="alerts-panel">
          {mockAlerts.map(alert => (
            <div key={alert.id} className="alert-item" onClick={() => handleAlertClick(alert)}>
              <h4>{alert.title}</h4>
              <p>{alert.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;