import React, { useState } from "react";
import DataList from "./components/Datalist";
import Login from "./components/Login";
import "./index.css";

interface UserInfo {
  id: string;
  username: string;
}

const App: React.FC = () => {
  const [user, setUser] = useState<UserInfo | null>(null);

  const handleLoginSuccess = (userInfo: UserInfo) => {
    setUser(userInfo);
  };

  return (
    <div className="dark min-h-screen bg-[#f6f8f7] dark:bg-[#11211a] text-slate-800 dark:text-slate-100 font-[Plus Jakarta Sans,sans-serif]">
      <header className="sticky top-0 z-50 bg-[color:rgba(255,255,255,0.8)] dark:bg-[color:rgba(17,33,26,0.8)] backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 pt-6 pb-4 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1de78c] flex items-center justify-center border-2 border-[color:rgba(29,231,140,0.4)] overflow-hidden text-xs font-bold text-[#11211a] shadow-[0_4px_0_0_rgba(255,255,255,0.2)]">
              <img src="/logo_koara.png" alt="" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                ねか<span className="text-[#1de78c]">セル</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                モノを大切にするフリマサイト
              </p>
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <p className="text-sm text-slate-700 dark:text-slate-200">ようこそ、{user.username}さん</p>
              <button
                onClick={() => setUser(null)}
                className="px-4 py-2 rounded-full bg-[#1de78c] text-[#11211a] font-bold text-sm shadow-[0_8px_20px_rgba(29,231,140,0.35)] hover:brightness-95 active:scale-95 transition-all"
              >
                ログアウト
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-4 py-6 selection:bg-[#1de78c] selection:text-black">
        {!user ? <Login onLoginSuccess={handleLoginSuccess} /> : <DataList currentUser={user} />}
      </main>
    </div>
  );
};

export default App;