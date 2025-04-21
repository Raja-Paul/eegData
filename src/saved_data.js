import { useState } from "react";
import axios from "./axios";
import "./App.css";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

// Generate a unique color for each subject
const getColor = (index) => {
    const colors = [
        "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
        "#FF9F40", "#E7E9ED", "#2ecc71", "#e74c3c", "#9b59b6",
        "#f1c40f", "#1abc9c", "#34495e", "#d35400", "#7f8c8d"
    ];
    return colors[index % colors.length];
};

const EiPlot = ({ subjects, eidata }) => {
    const seq = Array.from({ length: 5 }, (_, i) => [`Rest ${i + 1}`, `Task ${i + 1}`]).flat();
    const n = subjects.length;
    const datasets = new Array(n);
    for (let i = 0; i < n; i++) {
        eidata[i].sort((it1, it2) => {
            const words1 = it1[0].split(" ", 2);
            const words2 = it2[0].split(" ", 2);
            const index1 = parseInt(words1[1]);
            const index2 = parseInt(words2[1]);
            if (index1 !== index2) return (index1 - index2);
            else if (words1[0] <= words2[0]) return -1;
            else return 1;
        });

        datasets[i] = {
            label: `${subjects[i][0]}`,
            data: eidata[i].map((ei) => ({ x: ei[0], y: ei[1] })),
            borderColor: getColor(i),
            borderWidth: 3,
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
            title: { display: true, text: "EI Plot" },
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
                    text: "EI (Engagement Index)",
                    font: { size: 14 },
                },
            },
        },
        // elements: { point: { radius: 0 } },
    };

    return (
        <div className="plots">
            <Line data={data} options={options} />
        </div>
    );
};

const BandPlot = ({ band, fmin, fmax, subjects, banddata }) => {
    const n = subjects.length;
    const datasets = [];

    for (let i = 0; i < n; i++) {
        for (const [event, points] of Object.entries(banddata[i] ?? {})) {
            datasets.push({
                label: `${subjects[i][0]}, ${event}`,
                data: points.map((p) => ({ x: p[0], y: p[1] })),
                borderColor: getColor(i),
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
                    text: "Frequency (Hz)",
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
        elements: { point: { radius: 0 } },
    };

    return (
        <Line data={data} options={options} />
    );
};

const PsdPlot = ({ subjects, psddata }) => {
    return (
        <div className="plots">
            {psddata?.map?.((b, idx) => (
                <BandPlot
                    key={idx}
                    band={b.band}
                    fmin={b.fmin}
                    fmax={b.fmax}
                    subjects={subjects}
                    banddata={b.points}
                />
            ))}
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

        if (!newShowData) {
            setError(null);
            setResult(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        try {
            const res = await axios.get("/get-saved-data", {
                headers: { "Content-Type": "application/json" },
            });
            setResult(res.data.data);
        } catch (err) {
            setError(err.response?.data?.error || "An error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <button className="btn-submit" onClick={handleClick}>
                {showData ? "Hide Saved Data" : "Show Saved Data"}
            </button>

            {showData && error && <div className="error">Error: {error}</div>}
            {showData && isLoading && <div className="loading">Loading data...</div>}

            {showData && !isLoading && result?.subjects && result?.eis && (
                <EiPlot subjects={result.subjects} eidata={result.eis} />
            )}
            {showData && !isLoading && result?.subjects && result?.psds && (
                <PsdPlot subjects={result.subjects} psddata={result.psds} />
            )}
        </div>
    );
};

export default SavedData;
