import {  useState } from "react";
import { API_URL } from "./config";
import { Dialog } from "@mui/material";
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
interface SimpleDialogProps {
    open: boolean;
    onClose: (value: boolean) => void;
}

export default function FeedbackDialog(props: SimpleDialogProps) {
    const { onClose, open } =props;
    const [feedbackValue,setFeedbackValue]=useState<string>("");

    const feedbackPost = async () => {
        const response = await fetch(`${API_URL}/feedback`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({ feedback: feedbackValue })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`サーバーエラー:${response.status} - ${errorText}`);
        } else {
            alert("フィードバックを受け取りました！")
            setFeedbackValue("");
            onClose(false);
        };
    };

    return (
        <Dialog onClose={onClose} open={open}>
            <div className="m-2">
                <h1 className="text-2xl pt-2 px-2 font-medium">フィードバックを投稿</h1>
                <div className="p-2">
                    <p className="pb-2">このサービスに追加してほしい機能や改善点があれば教えてください。</p>
                    <textarea
                        className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-xl focus:ring-brand focus:border-brand block w-full p-3.5 shadow-xs placeholder:text-body"
                        value={feedbackValue}
                        onChange={(e) => setFeedbackValue(e.target.value)}
                    />
                    <button
                        className="px-4 py-3 my-5 rounded-xl bg-[color:rgba(29,231,140,0.2)] text-[#1de78c] font-semibold hover:bg-[#1de78c] hover:text-black transition-all w-full"
                        onClick={feedbackPost}
                    >投稿
                    </button>
                </div>
            </div>
        </Dialog>
    )
}