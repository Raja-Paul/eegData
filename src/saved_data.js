import { useState } from "react";
import axios from "axios";
import "./App.css"


const EiPlot = ({subjects, eidata}) => {
    const seq = ["Rest 1", "Task 1", "Rest 2", "Task 2", "Rest 3", "Task 3"];
    const n = subjects.length;
    var datasets = new Array(n);
    for (let i = 0; i < n; i++) {
        datasets[i] = {
            label: `${subjects[i][0]}`,
            data: eidata[i].map((ei) => ({x: ei[0], y: ei[1]})),
            borderColor: subjects[i][1] ? "blue" : "green",
            borderWidth: subjects[i][1] ? 0 : 4,
            fill: false,
        };
    }

    const data = {
        labels: seq,
        datasets: datasets,
    };

    const options = {

    }

    return (
        <></>
    )
};


const PsdPlot = ({subjects, psddata}) => {
    return (
        <></>
    )
};




const SavedData = () => {
    const [showData, setShowData] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleClick = async (e) => {
        e.preventDefault();
        setShowData((prev) => !prev)
        if (!showData) {
            setError(null);
            setResult(null);
            setIsLoading(null);

            return;
        }

        setIsLoading(true);

        try {
            const res = await axios.get(
                "http://192.168.0.103:5000/get-saved-data",
                {
                    headers: { "Content-Type": "application/json" },
                }
            );
            console.log("API Response:", res.data);
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

            {showData && isLoading && <div className="loading">Loaading data</div>}

            {showData && !isLoading && result && <EiPlot subjects={result.subjects} eidata={result.eis}/>}
            {showData && !isLoading && result && <PsdPlot subjects={result.subjects} eidata={result.psds}/>}
        </div>
    );
};

export default SavedData;