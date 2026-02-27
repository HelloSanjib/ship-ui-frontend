import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { ClipLoader } from 'react-spinners';
import Editor from '@monaco-editor/react';
import { IoCloseSharp, IoCopy, IoTrashOutline } from 'react-icons/io5';
import { PiExportBold } from 'react-icons/pi';
import { toast } from 'react-toastify';

const Profile = () => {
    const { user, loading: authLoading } = useAuth();
    const [history, setHistory] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // ✅ Delete History Item
    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Prevent opening the modal
        if (window.confirm("Are you sure you want to delete this component?")) {
            try {
                await api.delete(`/history/${id}`);
                setHistory(history.filter(item => item._id !== id));
                toast.success("Component deleted");
            } catch (error) {
                console.error("Failed to delete", error);
                toast.error("Failed to delete component");
            }
        }
    };

    // ✅ Copy Code function
    const copyCode = async () => {
        if (!selectedItem || !selectedItem.code) return toast.error("No code to copy");
        try {
            await navigator.clipboard.writeText(selectedItem.code);
            toast.success("Code copied to clipboard");
        } catch (err) {
            console.error('Failed to copy: ', err);
            toast.error("Failed to copy");
        }
    };

    // ✅ Download Code function
    const downloadFile = () => {
        if (!selectedItem || !selectedItem.code) return toast.error("No code to download");

        const ext = selectedItem.framework.includes('html') ? '.html' : (selectedItem.framework.includes('vue') ? '.vue' : '.jsx');
        const fileName = `Generated-Component${ext}`;
        const blob = new Blob([selectedItem.code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("File downloaded successfully!");
    };

    useEffect(() => {
        if (user) {
            const fetchHistory = async () => {
                try {
                    setLoadingData(true);
                    const { data } = await api.get('/history');
                    setHistory(data);
                } catch (error) {
                    console.error('Failed to fetch history', error);
                } finally {
                    setLoadingData(false);
                }
            };
            fetchHistory();
        }
    }, [user]);

    if (authLoading) {
        return (
            <>
                <Navbar />
                <div className="flex items-center justify-center min-h-[calc(100vh-90px)] bg-gray-50 dark:bg-[#09090B]">
                    <ClipLoader color="#a855f7" size={40} />
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="flex flex-col items-center min-h-[calc(100vh-90px)] px-6 lg:px-16 py-10 text-gray-900 dark:text-white bg-gray-50 dark:bg-[#09090B] transition-colors">

                {user ? (
                    <div className="w-full max-w-4xl flex flex-col items-start">
                        <div className="flex items-center gap-4 mb-8">
                            <img src={user.avatar} alt="Avatar" className="w-16 h-16 rounded-full border border-purple-500 shadow-lg" />
                            <div>
                                <h1 className="text-3xl font-bold">{user.name}</h1>
                                <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                            </div>
                        </div>

                        <h2 className="text-2xl font-semibold mb-6 sp-text">Your Generation History</h2>

                        {loadingData ? (
                            <div className="flex justify-center w-full py-10"><ClipLoader color="#a855f7" size={30} /></div>
                        ) : history.length > 0 ? (
                            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                                {history.map((item) => (
                                    <div
                                        key={item._id}
                                        onClick={() => setSelectedItem(item)}
                                        className="bg-white dark:bg-[#141319] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-purple-500/50 transition-all cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded">
                                                    {item.framework}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <button
                                                onClick={(e) => handleDelete(e, item._id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                title="Delete"
                                            >
                                                <IoTrashOutline size={18} />
                                            </button>
                                        </div>
                                        <p className="text-sm font-medium line-clamp-3 text-gray-800 dark:text-gray-200 mt-3">
                                            "{item.prompt}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="w-full p-10 flex flex-col items-center justify-center bg-white dark:bg-[#141319] border border-gray-200 dark:border-gray-800 rounded-xl">
                                <p className="text-gray-500">You haven't generated any components yet.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full my-auto text-center mt-20">
                        <h1 className="text-4xl font-bold mb-4 sp-text">Sign In Required</h1>
                        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl bg-white dark:bg-[#141319] p-8 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                            Currently, Ship UI allows guests to generate components freely! <br /><br />
                            However, to view your generation history across different devices, please <b>sign in with Google</b> via the Navbar. We will automatically sync your guest history to your account upon login.
                        </p>
                    </div>
                )}
            </div>

            {/* Modal for viewing history item */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#141319] w-full max-w-5xl h-[80vh] rounded-xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#09090B]">
                            <div className="flex-1 pr-4">
                                <span className="text-xs font-bold px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded mr-3 inline-block mb-1">
                                    {selectedItem.framework}
                                </span>
                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                    "{selectedItem.prompt}"
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={copyCode}
                                    className="p-[8px] bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-[5px] transition-all"
                                    title="Copy Code"
                                >
                                    <IoCopy className='text-[18px]' />
                                </button>
                                <button
                                    onClick={downloadFile}
                                    className="p-[8px] bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-[5px] transition-all"
                                    title="Download File"
                                >
                                    <PiExportBold className='text-[18px]' />
                                </button>
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="text-gray-500 hover:text-red-500 transition-colors p-1 ml-2"
                                >
                                    <IoCloseSharp size={28} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 w-full relative bg-[#1e1e1e]">
                            <Editor
                                height="100%"
                                defaultLanguage={selectedItem.framework.includes('html') ? 'html' : 'javascript'}
                                theme="vs-dark"
                                value={selectedItem.code}
                                options={{
                                    readOnly: true,
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    padding: { top: 16 }
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Profile;
