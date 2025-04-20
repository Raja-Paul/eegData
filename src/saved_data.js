import { useState } from "react";
import axios from "./axios";
import "./App.css"
import { Line } from "react-chartjs-2";
import "chart.js/auto";


const EiPlot = ({subjects, eidata}) => {
    // const seq = ["Rest 1", "Task 1", "Rest 2", "Task 2", "Rest 3", "Task 3"];
    const seq = Array.from({ length: 5}, (_, i) => [`Rest ${i + 1}`, `Task ${i + 1}`]).flat();
    const n = subjects.length;
    var datasets = new Array(n);
    for (let i = 0; i < n; i++) {
        datasets[i] = {
            label: `${subjects[i][0]}`,
            data: eidata[i].map((ei) => ({x: ei[0], y: ei[1]})),
            borderColor: (subjects[i][1] === 1) ? "blue" : "green",
            borderWidth: (subjects[i][1] === 1) ? 2 : 4,
            fill: false,
            parsing: false
        };
    }

    const data = {
        labels: seq,
        datasets: datasets,
    };

    const options = {
        responsive: true,
        plugins: {
            // legend: { position: 'top' },
            title: { display: true, text: "EI plot" },
        },
        scales: {
            x: {
              title: {
                display: true,
                text: "Event",
                font: { size: 14 },
              },
            },
            y: {
              title: {
                display: true,
                text: "EI(Engagement Index)",
                font: { size: 14 },
              },
            },
        },
    };

    return (
        <div className="plots">
            <Line data={data} options={options}/>
        </div>
    );
};


const BandPlot = ({band, fmin, fmax, subjects, banddata}) => {
    const n = subjects.length;
    var datasets = new Array();
    for (let i = 0; i < n; i++) {
        for (const [event, points] of Object.entries(banddata[i] ?? {})) {
            datasets.push({
                label: `${subjects[i][0]}, ${event}`,
                data: points.map((p) => ({x: p[0], y: p[1]})),
                borderColor: (subjects[i][1] === 1) ? "blue" : "red",
                borderWidth: (event.charAt(0) === "R") ? 2 : 4,
                fill: false,
                parsing: false
            });
        }
    }

    const data = {
        datasets: datasets,
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: `${band}` },
        },
        scales: {
            x: {
              title: {
                display: true,
                text: "Frequency(Hz)",
                font: { size: 14 },
              },
              type: 'linear', 
              min: fmin,          
              max: fmax,         
              ticks: {
                 stepSize: 0.25, 
              },
            },
            y: {
              title: {
                display: true,
                text: "Pxx",
                font: { size: 14 },
              },
            },
        },
    };

    return (
        <Line data={data} options={options}/>
    );
};

const PsdPlot = ({subjects, psddata}) => {
    // console.log(psddata);
    return (
        <div className="plots">
            {psddata?.map?.((b) => <BandPlot band={b.band} fmin={b.fmin} fmax={b.fmax} subjects={subjects} banddata={b.points} />)}
        </div>
    );
};




const SavedData = () => {
    const [showData, setShowData] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleClick = async (e) => {
        e.preventDefault();

        const newShowData = !showData;
        setShowData(newShowData);
        // console.log(newShowData);
        if (!newShowData) {
            setError(null);
            setResult(null);
            setIsLoading(false);
            
            return;
        }

        setIsLoading(true);

        try {
            const res = await axios.get(
                "/get-saved-data",
                {
                    headers: { "Content-Type": "application/json" },
                }
            );
            setResult(res.data.data);
            
        } catch (err) {
            setError(err.response?.data?.error || "An error occurred.");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div>
            <button
                className="btn-submit"
                onClick={handleClick}
            >
                {showData ? "Hide Saved Data" : "Show Saved data"}
            </button>

            {showData && error && <div className="error">Error: {error}</div>}

            {showData && isLoading && <div className="loading">Loading data</div>}

            {showData && !isLoading && result?.subjects && result?.eis && <EiPlot subjects={result.subjects} eidata={result.eis} />}
            {showData && !isLoading && result?.subjects && result?.psds && <PsdPlot subjects={result.subjects} psddata={result.psds} />}
        </div>
    );
};

export default SavedData;