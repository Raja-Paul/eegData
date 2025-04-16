import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import "./App.css";

const App = () => {
  const [eegFile, setEegFile] = useState(null);
  const [vmrkFile, setVmrkFile] = useState(null);
  const [vhdrFile, setVhdrFile] = useState(null);
  const [eventDesc, setEventDesc] = useState("");
  const [result, setResult] = useState(null);
  const [engagementIndex, setEngagementIndex] = useState(null);
  const [plots, setPlots] = useState(null);
  const [cleanedData, setCleanedData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPlots, setShowPlots] = useState(false);
  const [collapsedBands, setCollapsedBands] = useState({});

  const plotsRef = useRef();

  useEffect(() => {
    if (showPlots && plotsRef.current) {
      plotsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [showPlots]);

  const handleFileChange = (e, setFile) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setPlots(null);
    setCleanedData(null);
    setShowPlots(false);
    setCollapsedBands({});
    setIsLoading(true);
    setEngagementIndex(null);

    if (!eegFile || !vmrkFile || !vhdrFile || !eventDesc) {
      setError("Please upload all files and provide an event description.");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("eeg", eegFile);
    formData.append("vmrk", vmrkFile);
    formData.append("vhdr", vhdrFile);
    formData.append("event_desc", eventDesc);

    try {
      const response = await axios.post(
        "http://localhost:5000/predict",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log("API Response:", response.data);
      setResult(response.data.result);
      setPlots(response.data.plot_data);
      setCleanedData(response.data.cleaned_data);
      setEngagementIndex(response.data.engagement_index);
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderChart = (bandData, label) => {
    const frequencies = bandData.map((point) => point[0]);
    const powerValues = bandData.map((point) => point[1]);

    return (
      <Line
        data={{
          labels: frequencies,
          datasets: [
            {
              label: `${label} Band (Pxx vs Frequency)`,
              data: powerValues,
              borderColor: "#3b82f6",
              fill: false,
            },
          ],
        }}
        options={{
          scales: {
            x: {
              title: {
                display: true,
                text: "Frequency (Hz)",
                font: { size: 14 },
              },
            },
            y: {
              title: { display: true, text: "Pxx", font: { size: 14 } },
            },
          },
        }}
      />
    );
  };

  const renderCleanedDataChart = () => {
    if (!cleanedData || cleanedData.length === 0) return null;

    const downsampledData = cleanedData.filter((_, index) => index % 100 === 0);

    return (
      <Line
        data={{
          labels: Array.from({ length: downsampledData.length }, (_, i) => i),
          datasets: [
            {
              label: "Cleaned Data",
              data: downsampledData,
              borderColor: "#3b82f6",
              fill: false,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { title: { display: true, text: "X" } },
            y: { title: { display: true, text: "Y" } },
          },
          elements: { point: { radius: 0 } },
        }}
      />
    );
  };

  const toggleBand = (band) => {
    setCollapsedBands((prev) => ({
      ...prev,
      [band]: !prev[band],
    }));
  };

  return (
    <div className="container">
      <div className="top-bar">
        <h1>EEG Data Analysis</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>EEG File:</label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, setEegFile)}
          />
        </div>
        <div className="form-group">
          <label>VMRK File:</label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, setVmrkFile)}
          />
        </div>
        <div className="form-group">
          <label>VHDR File:</label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, setVhdrFile)}
          />
        </div>
        <div className="form-group">
          <label>Event Description:</label>
          <input
            type="text"
            value={eventDesc}
            onChange={(e) => setEventDesc(e.target.value)}
            placeholder="Enter event description"
          />
        </div>
        <button type="submit" className="btn-submit">
          Submit
        </button>
      </form>

      {isLoading && (
        <div className="loading">
          <div className="brain">
            🧠
            <div className="dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </div>
          </div>
          <p>Processing EEG Data...</p>
        </div>
      )}

      {error && <div className="error">Error: {error}</div>}

      {result && <h2>Load Status: {result}</h2>}

      {engagementIndex !== null && (
        <div className="engagement-index">
          <h2>Engagement Index</h2>
          <p>{engagementIndex.toFixed(3)}</p>
        </div>
      )}

      {cleanedData && (
        <div className="cleaned-data-chart">
          <h2>Cleaned Data</h2>
          <div style={{ height: "500px" }}>{renderCleanedDataChart()}</div>
        </div>
      )}

      {result && plots && (
        <button
          className="btn-submit"
          onClick={() => setShowPlots((prev) => !prev)}
        >
          {showPlots ? "Hide PSD" : "Show PSD"}
        </button>
      )}

      {showPlots && plots && (
        <div ref={plotsRef} className="plots">
          {plots.map((band) => (
            <div key={band.band} className="chart-container">
              <h3
                onClick={() => toggleBand(band.band)}
                className="collapsible-header"
              >
                {collapsedBands[band.band] ? "▶" : "▼"}{" "}
                {band.band.toUpperCase()} Band
              </h3>
              {!collapsedBands[band.band] &&
                renderChart(band.points, band.band)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
