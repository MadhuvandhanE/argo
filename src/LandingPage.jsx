import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Viewer } from 'resium';
import { Cartesian3 } from 'cesium';
import * as Cesium from 'cesium';
import './LandingPage.css';

Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwMDI0MGRhOC00YTJmLTRmZGYtYTQyOS02ZmE3NDc5OWVlYjEiLCJpZCI6MzQxNTM0LCJpYXQiOjE3NTc5NDc5NTh9.fMi6I0wyf_5bSiC1DzOzJJf6wkk-yrB4TY_4rJjhVO4";

function LandingPage() {
  const viewerRef = useRef(null);
  const navigate = useNavigate();

  const handleEnter = () => {
    const viewer = viewerRef.current?.cesiumElement;
    if (viewer) {
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(80.0, 15.0, 1500000),
        orientation: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-60.0),
        },
        duration: 4,
        onComplete: () => {
          navigate('/dashboard');
        }
      });
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="landing-container">
      <Viewer 
        full 
        ref={viewerRef} 
        timeline={false} 
        animation={false}
        geocoder={false}
        homeButton={false}
        sceneModePicker={false}
        baseLayerPicker={false}
        navigationHelpButton={false}
      />
      <div className="overlay">
        <h1>🛰️ ArgoSphere</h1>
        <p>An AI-Powered Ocean Data Explorer</p>
        <button onClick={handleEnter}>Enter</button>
      </div>
    </div>
  );
}

export default LandingPage;