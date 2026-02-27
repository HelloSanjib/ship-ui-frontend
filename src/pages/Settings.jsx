import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';

const Settings = () => {
    const [apiKey, setApiKey] = useState("");

    const handleSave = () => {
        if (!apiKey.trim()) {
            localStorage.removeItem("custom_gemini_key");
            toast.success("Custom API key removed. Using default.");
            return;
        }
        localStorage.setItem("custom_gemini_key", apiKey.trim());
        toast.success("Custom API key saved!");
        setApiKey("");
    };

    return (
        <>
            <Navbar />
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-90px)] px-6 lg:px-16 text-gray-900 dark:text-white text-center">
                <h1 className="text-4xl font-bold mb-6 sp-text">Settings</h1>

                <div className="bg-white dark:bg-[#141319] p-8 rounded-xl w-full max-w-xl text-left shadow-lg border border-gray-200 dark:border-gray-800 transition-colors">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">API Configuration</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Configure your API settings below. By default, Ship UI uses Gemini API Key.
                    </p>

                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Override Gemini API Key</label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Enter your custom Google GenAI key"
                            className="w-full bg-gray-50 dark:bg-[#09090B] p-3 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500 border border-gray-300 dark:border-gray-700 transition"
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        className="mt-6 w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 font-bold hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all text-white shadow-lg"
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </>
    );
};

export default Settings;
