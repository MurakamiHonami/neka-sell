import React, { useEffect, useState } from "react";
import { Data } from "../types/Data"
import { fetchData } from "../service/DataService";

interface DataListProps {
    currentUser: {
        id: string;
        username: string;
    };
}

const DataList: React.FC<DataListProps> = ({ currentUser}) => {
    const [data, setData] = useState<Data[]>([]);
    const [loading, setLoading] = useState(true);
    const [image, setImage] = useState<File>()
    const [productInfo, setProductInfo] = useState<Partial<Data>>({
        name: "",
        price: 0,
        state: true
    });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    
    useEffect(() => {
        fetchData()
            .then((data) => {
                setData(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    },[]);
    
    if (loading) return <p>読み込み中...</p>

    const getImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(!e.target.files || e.target.files.length === 0) return;
        const img = e.target.files[0];
        setImage(img)

        const url = URL.createObjectURL(img);
        setPreviewUrl(url);
    }

    const submitProduct = async () => {
        if(!image || productInfo.name==="" || productInfo.price===0 || productInfo.state===false) {
            alert("商品情報を登録してください")
            return;
        }
        
        const formData = new FormData()

        formData.append("image",image);
        formData.append("name",String(productInfo.name));
        formData.append("price", String(productInfo.price));
        formData.append("state", String(productInfo.state));
        formData.append("seller_id", currentUser.id);

        const postImageUri = "http://localhost:5000/api/upload"

        try {
            const response = await fetch(postImageUri, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("送信に失敗しました");

            const result: Data = await response.json();

            console.log("保存されたデータ",result);
            setData([...data,result])
            
            setProductInfo({name:"",price:0,state:true});
            setImage(undefined);
            setPreviewUrl(null);
            alert(`${result.name} の出品に成功しました！`);
        } catch (err) {
            console.error("エラーが発生しました", err);
        }
    }

    const purchaseProduct = async (id: string) => {
        try {
            const response = await fetch(`http://localhost:5000/api/purchase/${id}`,{
                method: "PATCH",
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "購入に失敗しました");
            }

            setData(prevData =>
                prevData.map(item =>
                    item.id === id ? { ...item, state: false } : item
                )
            );

            alert("購入完了");
        } catch (err) {
            console.error("購入エラー:",err);
            alert("購入に失敗しました");
        }
    };

    return (
        <div>
            <h2>商品一覧</h2>
            <ul>
                {data.map((d) => (
                    <li key={d.id}>
                        <strong>{d.name}</strong> - 価格:{d.price}円<br/>
                        {d.state ? (
                            currentUser.id === d.sellerId ? (
                                <span style={{color: "gray"}}>(自分の出品です)</span>
                                ) : (
                                <button onClick={()=> purchaseProduct(d.id)}>購入する</button>
                                )
                            ): (
                                <span style={{ color: "red"}}>売り切れ</span>
                            )}
                        <img
                            src={d.imageUrl}
                            alt={`${d.name}の画像`}
                            style={{ width: "100px" }}
                        />
                    </li>
                ))}
            </ul>
            <h2>出品</h2>
            <form>
                <p>
                    商品名:
                    <input
                        type="text"
                        value={productInfo.name}
                        onChange={e => setProductInfo({...productInfo, name:e.target.value})}
                    />
                </p>
                <p>
                    価格:
                    <input
                        type="number"
                        value={productInfo.price}
                        onChange={e => setProductInfo({...productInfo, price:e.target.valueAsNumber})}
                        min="0"
                        max="999999"
                    />
                </p>
                <p>
                    商品画像:
                    <input type="file" accept="image/*,.png,.jpg,.jpeg,.gif" onChange={getImage}/>
                    {previewUrl && (
                        <div style={{display: "flex" ,gap: "2rem",marginTop: "10px"}}>
                            <p>プレビュー:</p>
                            <img
                                src={previewUrl}
                                alt="商品画像のプレビュー"
                                style={{ width: "100px" }}
                            />
                        </div>
                    )}
                </p>
                <button type="button" onClick={submitProduct}>保存</button>
            </form>
        </div>
    )
}

export default DataList;