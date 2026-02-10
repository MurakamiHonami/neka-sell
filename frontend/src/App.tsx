import React, { useState } from "react";
import DataList from "./components/Datalist";
import Login from "./components/Login";
import "./App.css"

interface UserInfo {
    id: string;
    username: string;
}

const App: React.FC = () => {
  const [user, setUser]=useState<UserInfo | null>(null);
  
  const handleLoginSuccess = (userInfo: UserInfo) => {
    setUser(userInfo);
  };
  
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <img className="app-logo" src="/logo_koara.png" alt="コアラのロゴ"/>
            <div className="app-title-group">
              <h1>ねかセル</h1>
              <p className="app-subtitle">モノを大切にするフリマサイト</p>
            </div>
          </div>
          {user && (
            <div className="user-nav">
              <p className="user-greeting">ようこそ、{user.username}さん</p>
              <button onClick={() => setUser(null)} className="logout-btn">ログアウト</button>
            </div>
          )}
        </div>
      </header>
      <main className="main-content">
        {!user ? (
          <Login onLoginSuccess={handleLoginSuccess}/>
        ) : (
          <DataList currentUser={user}/>
        )}
      </main>
    </div>
  )
}

export default App;