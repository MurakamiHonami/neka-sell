import { Data } from "../types/Data";
import { API_URL } from "../components/config";

export const fetchData = async (): Promise<Data[]> => {
    const response = await fetch(`${API_URL}/api/data`);
    if (!response.ok) {
        throw new Error("データの取得に失敗しました");
    }
    const data = await response.json();
    console.log(data);
    return data;
}