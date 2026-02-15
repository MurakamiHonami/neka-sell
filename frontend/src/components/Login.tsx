import React, { useState } from "react";
import { API_URL } from "./config";
import "../App.css"

interface UserInfo{
    id: string;
    username: string;
}

interface LoginProps {
    onLoginSuccess: (user: UserInfo) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [isRegister, setIsRegister]=useState(false);
    const [username, setUsername]=useState("");
    const [password, setPassword]=useState("");

    const handlesubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const endpoint = isRegister ? "/api/register" : "/api/login";

        try {
            const response = await fetch(`${API_URL}${endpoint}`,{
                method: "POST",
                headers: { "Content-Type" : "application/json"},
                body: JSON.stringify({username,password})
            });

            const data = await response.json();

            if (!response.ok){
                throw new Error(data.error || "認証に失敗しました");
            }

            if (isRegister){
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
        <div className="login-container">
            <h3 className="login-message">{isRegister ? "ユーザー登録をしてください" :"ログインしてください"}</h3>
            <form onSubmit={handlesubmit} className="login-form">
                <input
                    type="text"
                    placeholder="ユーザー名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="login-input"
                /><br/>
                <input
                    type="password"
                    placeholder="パスワード"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="login-input"
                /><br/>
                <button type="submit" className="login-submit-btn">
                    {isRegister ? "新規登録" : "ログイン"}
                </button>
            </form>
            <p
                className="login-toggle-text"
                onClick={() => setIsRegister(!isRegister)}
            >
                {isRegister ? "🍃すでにアカウントをお持ちの方(ログイン)" : "🌱初めてご利用の方(新規登録)"}
            </p>
        </div>
    );
};

export default Login;