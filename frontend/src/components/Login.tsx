import React, { useState } from "react";
import { API_URL } from "./config";
import "../index.css";

interface UserInfo {
  id: string;
  username: string;
}

interface LoginProps {
  onLoginSuccess: (user: UserInfo) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handlesubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isRegister ? "/api/register" : "/api/login";

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "認証に失敗しました");
      }

      if (isRegister) {
        alert("登録が完了しました。ログイン画面へ移行します");
        setIsRegister(false);
      } else {
        onLoginSuccess(data.user);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "エラーが発生しました");
    }
  };

  return (
    <div className="w-full grid place-items-center py-10">
      <div className="w-full max-w-md bg-white dark:bg-[#1a2c24] border border-slate-200/60 dark:border-slate-800/60 rounded-[1rem] p-6 shadow-2xl">
        <h3 className="text-center text-2xl font-extrabold mb-6 text-slate-900 dark:text-white">{isRegister ? "ユーザー登録をしてください" : "ログインしてください"}</h3>
        <form onSubmit={handlesubmit} className="space-y-4">
          <input
            type="text"
            placeholder="ユーザー名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-brand focus:border-brand block w-full p-3.5 shadow-xs placeholder:text-slate-400"
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-brand focus:border-brand block w-full p-3.5 shadow-xs placeholder:text-slate-400" 
          />
          <button type="submit" className="w-full bg-[#1de78c] text-[#11211a] px-6 py-3 rounded-xl font-bold text-sm shadow-[0_8px_20px_rgba(29,231,140,0.35)] active:translate-y-[1px] transition-all">
            {isRegister ? "新規登録" : "ログイン"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-[#1de78c] font-bold cursor-pointer hover:underline" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "🍃すでにアカウントをお持ちの方(ログイン)" : "🌱初めてご利用の方(新規登録)"}
        </p>
      </div>
    </div>
  );
};

export default Login;