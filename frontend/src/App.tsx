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
        <h1>ねかセル</h1>
        {user && (
          <div>
            <span>ようこそ、{user.username}さん</span>
            <button onClick={() => setUser(null)} style={{marginLeft:"10px"}}>ログアウト</button>
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