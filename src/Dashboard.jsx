import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Viewer, Entity, PointGraphics, EntityDescription } from 'resium';
import { Cartesian3, Color } from 'cesium';
import * as Cesium from 'cesium';
import Plot from 'react-plotly.js';
import { argoData, uniqueFloats } from './mockData';
import Chatbot from './Chatbot';
import './App.css';

Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwMDI0MGRhOC00YTJmLTRmZGYtYTQyOS02ZmE3NDc5OWVlYjEiLCJpZCI6MzQxNTM0LCJpYXQiOjE3NTc5NDc5NTh9.fMi6I0wyf_5bSiC1DzOzJJf6wkk-yrB4TY_4rJjhVO4";

const calculateAverage = (floatId, parameter) => {
    const floatData = argoData.filter(d => d.float_id === floatId);
    if (floatData.length === 0) return null;
    const total = floatData.reduce((sum, item) => sum + item[parameter], 0);
    const average = total / floatData.length;
    return average.toFixed(1);
};

const locationToFloatId = { 'kerala': 2901788, 'sri lanka': 6330112, 'bay of bengal': 3002541, 'andaman': 4119870, 'arabian sea': 1902345, 'equator': 3456789 };

function Dashboard() {
  const [selectedFloatId, setSelectedFloatId] = useState(uniqueFloats[0]?.float_id);
  const [selectedParameter, setSelectedParameter] = useState('temperature');
  const [messages, setMessages] = useState([{ text: "Hello! Ask me about ocean data.", sender: 'bot' }]);
  const [inputValue, setInputValue] = useState('');
  const [tableData, setTableData] = useState([]);
  const [tableMode, setTableMode] = useState('single');
  const viewerRef = useRef(null);

  const selectedFloatData = useMemo(() => argoData.filter(d => d.float_id === selectedFloatId), [selectedFloatId]);

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
    if(selectedFloatId) { setTableData(argoData.filter(d => d.float_id === selectedFloatId)); }
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    const userMessage = { text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setTableData([]);
    const lowerInput = inputValue.toLowerCase();
    let botResponse = "I can't answer that. Try 'show BGC data in the arabian sea'.";

    const parameters = ['temperature', 'salinity', 'pressure', 'chlorophyll', 'oxygen', 'nitrate'];
    const parameter = parameters.find(p => lowerInput.includes(p.substring(0,4)));
    let floatId = (lowerInput.match(/\d{7}/g) || []).map(Number)[0];
    const locationKey = Object.keys(locationToFloatId).find(loc => lowerInput.includes(loc));

    let targetFloatId = floatId;
    if (!targetFloatId && locationKey) {
      targetFloatId = locationToFloatId[locationKey];
    }
    
    if (lowerInput.includes('bgc') || lowerInput.includes('biogeochemical')) {
        const finalFloatId = targetFloatId || selectedFloatId;
        botResponse = `Analyzing Biogeochemical parameters for float ${finalFloatId}. The data is in the table.`;
        setSelectedFloatId(finalFloatId); 
        setSelectedParameter('chlorophyll');
        setTableData(argoData.filter(d => d.float_id === finalFloatId));
        setTableMode('bgc');
    } else if (parameter && targetFloatId) {
        const avg = calculateAverage(targetFloatId, parameter);
        botResponse = `The average ${parameter} for float ${targetFloatId} is ${avg}.`;
        setSelectedFloatId(targetFloatId); 
        setSelectedParameter(parameter);
        setTableData(argoData.filter(d => d.float_id === targetFloatId));
        setTableMode('single');
    }

    setTimeout(() => { setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]) }, 1000);
    setInputValue('');
  };

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
          <h2>Selected Float: {selectedFloatId}</h2>
          <p>Click a float on the globe or use the chat.</p>
          {tableData.length > 0 && (
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
      <div className="main-content">
        <div className="cesium-container">
          <Viewer full ref={viewerRef}>
            {uniqueFloats && uniqueFloats.map(float => (
              <Entity key={float.float_id} name={`Float ID: ${float.float_id}`} position={Cartesian3.fromDegrees(float.longitude, float.latitude, 0)} onClick={() => setSelectedFloatId(float.float_id)}>
                <PointGraphics pixelSize={8} color={selectedFloatId === float.float_id ? Cesium.Color.RED : Cesium.Color.ROYALBLUE} outlineColor={Cesium.Color.WHITE} outlineWidth={2}/>
                <EntityDescription><h1>Float ID: {float.float_id}</h1><p>Click to select</p></EntityDescription>
              </Entity>
            ))}
          </Viewer>
        </div>
        <div className="plotly-container">
          <Plot data={[{ x: selectedFloatData.map(d => d.time), y: selectedFloatData.map(d => d[selectedParameter]), type: 'scatter', mode: 'lines+markers', line: { color: '#005a9e', width: 3 }, marker: { size: 8, color: '#007bff' }}]} layout={{ title: `Analysis for Float ${selectedFloatId}`, paper_bgcolor: 'transparent', plot_bgcolor: 'rgba(255,255,255,0.4)', font: { color: '#333' }, margin: { l: 60, r: 40, t: 50, b: 20 }, xaxis: { gridcolor: '#d4e3f3' }, yaxis: { title: selectedParameter, gridcolor: '#d4e3f3' }}} style={{ width: '100%', height: '100%' }} config={{ responsive: true, displaylogo: false }}/>
        </div>
      </div>
      <Chatbot messages={messages} inputValue={inputValue} onInputChange={setInputValue} onSendMessage={handleSendMessage} />
    </div>
  );
}

export default Dashboard;