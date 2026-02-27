import React, { useEffect, useState } from 'react'
import { FaUser } from 'react-icons/fa'
import { HiSun, HiMoon } from 'react-icons/hi'
import { RiSettings3Fill } from 'react-icons/ri'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GoogleLogin } from '@react-oauth/google'

const Navbar = () => {
  const { user, loading, loginWithGoogle, logout } = useAuth();

  const [theme, setTheme] = useState(() => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
      return localStorage.getItem('theme');
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <>
      <div className="nav flex items-center justify-between px-[100px] h-[90px] border-b-[1px] border-gray-200 dark:border-gray-800 transition-colors">
        <Link to="/" className="logo cursor-pointer">
          <h3 className='text-[25px] font-[700] sp-text hover:opacity-80 transition-all'>Ship UI</h3>
        </Link>
        <div className="icons flex items-center gap-[15px]">
          <div
            className="icon flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            onClick={toggleTheme}
            title="Toggle Theme"
          >
            {theme === 'dark' ? <HiSun className="text-white" /> : <HiMoon className="text-gray-900" />}
          </div>
          {!loading && (
            user ? (
              <div className="flex items-center gap-3 ml-2">
                <Link to="/profile" title="User Profile">
                  <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-700 hover:scale-105 transition-all cursor-pointer" />
                </Link>
                <button
                  onClick={logout}
                  className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="ml-2 mt-1">
                <GoogleLogin
                  onSuccess={loginWithGoogle}
                  onError={() => {
                    toast.error('Login Failed');
                  }}
                  theme={theme === 'dark' ? 'filled_black' : 'outline'}
                  shape="pill"
                  text="continue_with"
                />
              </div>
            )
          )}
          <Link
            to="/settings"
            className="icon flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-900 dark:text-white"
            title="Settings"
          >
            <RiSettings3Fill />
          </Link>
        </div>
      </div>
    </>
  )
}

export default Navbar