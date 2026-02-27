import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import Select from 'react-select';
import { BsStars } from 'react-icons/bs';
import { HiOutlineCode } from 'react-icons/hi';
import Editor from '@monaco-editor/react';
import { IoCloseSharp, IoCopy } from 'react-icons/io5';
import { PiExportBold } from 'react-icons/pi';
import { ImNewTab } from 'react-icons/im';
import { FiRefreshCcw } from 'react-icons/fi';
import { GoogleGenAI } from "@google/genai";
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

const Home = () => {
  const { user } = useAuth();

  const options = [
    { value: 'html-tailwind', label: 'HTML + Tailwind CSS' },
    { value: 'react-tailwind', label: 'React + Tailwind CSS' },
    { value: 'react-shadcn', label: 'React + Shadcn UI' },
    { value: 'nextjs-tailwind', label: 'Next.js + Tailwind CSS' },
    { value: 'nextjs-shadcn', label: 'Next.js + Shadcn UI' },
    { value: 'nextjs-mui', label: 'Next.js + MUI' },
    { value: 'vue-tailwind', label: 'Vue + Tailwind CSS' },
    { value: 'angular-material', label: 'Angular + Material' },
  ];

  const [outputScreen, setOutputScreen] = useState(false);
  const [tab, setTab] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [frameWork, setFrameWork] = useState(options[0]);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNewTabOpen, setIsNewTabOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // ✅ Extract code safely
  function extractCode(response) {
    const match = response.match(/```(?:\w+)?\n?([\s\S]*?)```/);
    return match ? match[1].trim() : response.trim();
  }

  // ✅ Generate code
  async function getResponse() {
    if (!prompt.trim()) return toast.error("Please describe your component first");

    // Check for custom API key in localStorage, otherwise fallback to .env
    const storedApiKey = localStorage.getItem("custom_gemini_key");
    const aiKeyToUse = storedApiKey && storedApiKey.trim() !== ""
      ? storedApiKey
      : import.meta.env.VITE_GEMINI_API_KEY;

    // Initialize GenAI dynamically based on the current key
    const ai = new GoogleGenAI({
      apiKey: aiKeyToUse
    });

    try {
      setLoading(true);
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `
     You are an experienced programmer with expertise in web development and UI/UX design. You create modern, animated, and fully responsive UI components. You are highly skilled in HTML, CSS, Tailwind CSS, Bootstrap, JavaScript, React, Next.js, Vue.js, Angular, and more.

Now, generate a UI component for: ${prompt}  
Framework to use: ${frameWork.value}  

Requirements:  
- The code must be clean, well-structured, and easy to understand.  
- Optimize for SEO where applicable.  
- Focus on creating a modern, animated, and responsive UI design.  
- Include high-quality hover effects, shadows, animations, colors, and typography.  
- Return ONLY the code, formatted properly in **Markdown fenced code blocks**.  
- Do NOT include explanations, text, comments, or anything else besides the code.  
- And give the whole code in a single HTML file.
      `,
      });

      const generatedCode = extractCode(response.text);
      setCode(generatedCode);
      setOutputScreen(true);

      // Save History Logic
      const historyPayload = {
        prompt,
        framework: frameWork.value,
        code: generatedCode
      };

      if (user) {
        // Logged in: Save to DB
        try {
          await api.post('/history', historyPayload);
        } catch (dbError) {
          console.error("Failed to save history to DB", dbError);
          toast.warning("Generated code, but failed to save to history.");
        }
      } else {
        // Guest mode: Save to localStorage
        const existingHistory = JSON.parse(localStorage.getItem('guest_history') || '[]');
        existingHistory.push({
          ...historyPayload,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('guest_history', JSON.stringify(existingHistory));
      }

    } catch (error) {
      console.error(error);

      // Check if the error is related to the API key
      const errMsg = error?.message?.toLowerCase() || "";
      if (errMsg.includes("api key") || errMsg.includes("key not valid") || errMsg.includes("unauthenticated")) {
        toast.error("Invalid API Key! Please check your Settings.");
      } else {
        toast.error("Something went wrong while generating code");
      }

    } finally {
      setLoading(false);
    }
  };

  // ✅ Copy Code
  const copyCode = async () => {
    if (!code.trim()) return toast.error("No code to copy");
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied to clipboard");
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast.error("Failed to copy");
    }
  };

  // ✅ Download Code
  const downnloadFile = () => {
    if (!code.trim()) return toast.error("No code to download");

    const fileName = "GenUI-Code.html"
    const blob = new Blob([code], { type: 'text/plain' });
    let url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("File downloaded");
  };

  return (
    <>
      <Navbar />

      {/* ✅ Better responsive layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 lg:px-16">
        {/* Left Section */}
        <div className="w-full py-6 rounded-xl bg-white dark:bg-[#141319] shadow-lg dark:shadow-none border border-gray-200 dark:border-gray-800 transition-colors mt-5 p-5">
          <h3 className='text-[25px] font-semibold sp-text'>AI Component Generator</h3>
          <p className='text-gray-600 dark:text-gray-400 mt-2 text-[16px]'>Describe your component and let AI code it for you.</p>

          <p className='text-[15px] font-[700] mt-4 text-gray-900 dark:text-white'>Framework</p>
          <Select
            className='mt-2'
            options={options}
            value={frameWork}
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: "var(--select-bg)",
                borderColor: "var(--select-border)",
                color: "var(--select-text)",
                boxShadow: "none",
                "&:hover": { borderColor: "var(--select-border-hover)" }
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: "var(--select-bg)",
                color: "var(--select-text)"
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isSelected
                  ? "var(--select-bg-active)"
                  : state.isFocused
                    ? "var(--select-bg-focus)"
                    : "var(--select-bg)",
                color: "var(--select-text)",
                "&:active": { backgroundColor: "var(--select-bg-active)" }
              }),
              singleValue: (base) => ({ ...base, color: "var(--select-text)" }),
              placeholder: (base) => ({ ...base, color: "var(--select-text-muted)" }),
              input: (base) => ({ ...base, color: "var(--select-text)" })
            }}
            onChange={(selected) => setFrameWork(selected)}
          />

          <p className='text-[15px] font-[700] mt-5 text-gray-900 dark:text-white'>Describe your component</p>
          <textarea
            onChange={(e) => setPrompt(e.target.value)}
            value={prompt}
            className='w-full min-h-[200px] rounded-xl bg-gray-50 dark:bg-[#09090B] border border-gray-300 dark:border-gray-700 mt-3 p-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-colors'
            placeholder="Describe your component in detail and AI will generate it..."
          ></textarea>

          <div className="flex items-center justify-between mt-3">
            <p className='text-gray-600 dark:text-gray-400 text-sm'>Click on generate button to get your code</p>
            <button
              onClick={getResponse}
              className="flex items-center p-3 rounded-lg border-0 bg-gradient-to-r from-purple-400 to-purple-600 px-5 gap-2 transition-all hover:opacity-80 hover:scale-105 active:scale-95"
            >
              {loading ? <ClipLoader color='white' size={18} /> : <BsStars />}
              Generate
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div className="relative mt-2 w-full h-[80vh] bg-white dark:bg-[#141319] shadow-lg dark:shadow-none border border-gray-200 dark:border-gray-800 transition-colors rounded-xl overflow-hidden">
          {
            !outputScreen ? (
              <div className="w-full h-full flex items-center flex-col justify-center">
                <div className="p-5 w-[70px] flex items-center justify-center text-[30px] h-[70px] rounded-full bg-gradient-to-r from-purple-400 to-purple-600">
                  <HiOutlineCode className="text-white" />
                </div>
                <p className='text-[16px] text-gray-600 dark:text-gray-400 mt-3'>Component & code will appear here.</p>
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div className="bg-gray-100 dark:bg-[#17171C] transition-colors w-full h-[50px] flex items-center gap-3 px-3 border-b border-gray-200 dark:border-gray-800">
                  <button
                    onClick={() => setTab(1)}
                    className={`w-1/2 py-2 rounded-lg transition-all ${tab === 1 ? "bg-purple-600 text-white shadow-md" : "bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-zinc-700"}`}
                  >
                    Code
                  </button>
                  <button
                    onClick={() => setTab(2)}
                    className={`w-1/2 py-2 rounded-lg transition-all ${tab === 2 ? "bg-purple-600 text-white shadow-md" : "bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-zinc-700"}`}
                  >
                    Preview
                  </button>
                </div>

                {/* Toolbar */}
                <div className="bg-gray-100 dark:bg-[#17171C] transition-colors w-full h-[50px] flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-4">
                    <p className='font-bold text-gray-800 dark:text-gray-200'>Code Editor</p>
                    <button
                      onClick={() => {
                        setPrompt("");
                        setCode("");
                        setOutputScreen(false);
                        setTab(1);
                      }}
                      className="flex items-center gap-1 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                    >
                      <FiRefreshCcw className="text-xs" /> New Task
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    {tab === 1 ? (
                      <>
                        <button onClick={copyCode} className="w-10 h-10 rounded-xl border border-gray-300 dark:border-zinc-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#333] transition-colors"><IoCopy /></button>
                        <button onClick={downnloadFile} className="w-10 h-10 rounded-xl border border-gray-300 dark:border-zinc-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#333] transition-colors"><PiExportBold /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setIsNewTabOpen(true)} className="w-10 h-10 rounded-xl border border-gray-300 dark:border-zinc-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#333] transition-colors"><ImNewTab /></button>
                        <button onClick={() => setRefreshKey(prev => prev + 1)} className="w-10 h-10 rounded-xl border border-gray-300 dark:border-zinc-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#333] transition-colors"><FiRefreshCcw /></button>
                      </>
                    )}
                  </div>
                </div>

                {/* Editor / Preview */}
                <div className="h-full">
                  {tab === 1 ? (
                    <Editor value={code} height="100%" theme='vs-dark' language="html" />
                  ) : (
                    <iframe key={refreshKey} srcDoc={code} className="w-full h-full bg-white text-black"></iframe>
                  )}
                </div>
              </>
            )
          }
        </div>
      </div>

      {/* ✅ Fullscreen Preview Overlay */}
      {isNewTabOpen && (
        <div className="absolute inset-0 bg-white w-screen h-screen overflow-auto">
          <div className="text-black w-full h-[60px] flex items-center justify-between px-5 bg-gray-100">
            <p className='font-bold'>Preview</p>
            <button onClick={() => setIsNewTabOpen(false)} className="w-10 h-10 rounded-xl border border-zinc-300 flex items-center justify-center hover:bg-gray-200">
              <IoCloseSharp />
            </button>
          </div>
          <iframe srcDoc={code} className="w-full h-[calc(100vh-60px)]"></iframe>
        </div>
      )}
    </>
  )
}

export default Home
