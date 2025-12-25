import { Data } from "../types/Data";

export const fetchData = async (): Promise<Data[]> => {
    const response = await fetch("http://localhost:5000/api/data");
    if (!response.ok) {
        throw new Error("データの取得に失敗しました");
    }
    const data = await response.json();
    console.log(data);
    return data;
}