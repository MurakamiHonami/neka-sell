import React, { useState } from "react";
import DataList from "./components/Datalist";
import Login from "./components/Login";

interface UserInfo {
    id: string;
    username: string;
}

const App: React.FC = () => {
  const [user, setUser]=useState<UserInfo | null>(null);
  return (
    <div>
      <header>
        <div className="flex items-center justify-center">
          <img className="logo w-20 h-20" src="/koara.png"/>
          <h1 className="py-10 px-3 text-5xl text-emerald-200 font-bold font-Roboto [text-shadow:_0_5px_0_var(--tw-shadow-color)] shadow-blue-500">ねかセル</h1>
        </div>
        {user && (
          <div>
            <p>ようこそ、{user.username}さん</p>
            <button onClick={() => setUser(null)} className="m-2 p-1 text-green-700 bg-gray-300 rounded-xl hover:opacity-80 text-base">ログアウト</button>
          </div>
        )}
      </header>
      <main>
        {!user ? (
          <Login onLoginSuccess={(u) => setUser(u)}/>
        ) : (
          <DataList currentUser={user}/>
        )}
      </main>
    </div>
  )
}

export default App;