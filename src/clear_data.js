import { useState, useEffect } from "react";
import axios from "./axios";
import "./App.css";

const ClearData = () => {
    const [isClearing, setIsClearing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [showMsg, setShowMsg] = useState(false);


    useEffect(() => {
        if (showMsg) {
            const timer = setTimeout(() => {
                setShowMsg(false);
                setResult(null);
                setError(null);
            }, 4000);          // disappear after 4 secs

            return () => clearTimeout(timer);
        }
    }, [showMsg]);


    const handleClick = async (e) => {
        e.preventDefault();
        const newIsClearing = !isClearing;
        setIsClearing(newIsClearing);
        if (!newIsClearing) return;

        try {
            const res = await axios.delete(
                "/clear-saved-data",
                {
                    headers: { "Content-Type": "application/json" },
                }
            );
            setResult(res.data.data);
            setShowMsg(true);
        } catch (err) {
            setError(err.response?.data?.error || "An error occurred.");
        } finally {
            setIsClearing(false);
        }

    };


    return (
        <div>
            <button
                className="btn-submit"
                onClick={handleClick}
            >
                {isClearing ? "Clearing Saved Data....." : "Clear Saved data"}
            </button>

            {!isClearing && showMsg && !result && error && <div className="error">Error: {error}</div>}

            {!isClearing && showMsg && result && <div className="result">Data cleared successfully</div>}
        </div>
    );
};

export default ClearData;