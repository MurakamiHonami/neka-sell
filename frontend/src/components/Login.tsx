import React, { useState } from "react";

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
            const response = await fetch(`http://localhost:5000${endpoint}`,{
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
        <div className="items-center justify-start">
            <h3 className="inline-block bg-yellow-100 text-green-700 rounded-xl opacity-90 p-3 m-1 hover:opacity-80">{isRegister ? "ユーザー登録をしてください" :"ログインしてください"}</h3>
            <form onSubmit={handlesubmit}>
                <input
                    type="text"
                    placeholder="ユーザー名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="m-2 border-none text-gray-500 rounded-xl"
                /><br/>
                <input
                    type="password"
                    placeholder="パスワード"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="m-2 border-none text-gray-500 rounded-xl"
                /><br/>
                <button type="submit" className="bg-gray-200 text-green-700 opacity-90 hover:opacity-80 m-2 p-2 rounded-full">
                    {isRegister ? "新規登録" : "ログイン"}
                </button>
            </form>
            <p
                className="inline-block bg-green-700 text-green-200 p-3 opcity-90 hover:opacity-80 rounded-xl"
                onClick={() => setIsRegister(!isRegister)}
            >
                {isRegister ? "🍃すでにアカウントをお持ちの方(ログイン)" : "🌱初めてご利用の方(新規登録)"}
            </p>
        </div>
    );
};

export default Login;