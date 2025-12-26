import React, { use, useEffect, useState } from "react";
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
    const [canSell, setCanSell]=useState(false);
    const [rakutenItems, setRakutenItems]=useState<any[]>([]);
    const [maxPrice, setMaxPrice]=useState(0);

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


    const checkCanSell = async () => {
        if (!image) return;
        setRakutenItems([]);
        const formData = new FormData();
        formData.append("image",image);

        try {
            const response = await fetch("http://localhost:5000/api/search",{
                method: "POST",
                body: formData
            });
    
            const result = await response.json();
            if (result.rakutenItems && result.rakutenItems.length > 0) {
                alert("出品可能な商品が見つかりました");
                setRakutenItems(result.rakutenItems);
                setCanSell(true);
            } else {
                alert("出品できる商品が見つかりませんでした")
                setCanSell(false);
            }
        } catch (err) {
            console.error(err);
            alert("検索中にエラーが発生しました");
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
                {rakutenItems.length > 0 && (
                    <div style={{
                        border: "2px solid aqua",
                        padding: "10px",
                        margin: "10px 0",
                        borderRadius: "8px",
                    }}>
                        <h3>出品可能な商品<small>(楽天ブックスから検索)</small></h3>
                        <div style={{maxHeight: "300px", overflowY: "scroll"}}>
                            {rakutenItems.map((item, index)=>(
                                <div
                                    key={index}
                                    style={{
                                        display: "flex",
                                        gap: "10px",
                                        padding: "10px",
                                        alignItems: "center",
                                        cursor: "pointer"
                                    }}
                                    onClick={()=>{
                                        setProductInfo({
                                            ...productInfo,
                                            name: item.name,
                                            price: item.price
                                        });

                                        setMaxPrice(item.price)
                                        setRakutenItems([]);
                                    }}
                                >
                                    <img src={item.imageUrl} alt={item.name} style={{ width:"60px", height: "60px", objectFit: "cover"}}/>
                                    <div>
                                        <p>{item.name}</p>
                                        <p>{item.price.toLocaleString()}円</p>
                                        <p>発売日:{item.releaseDate}</p>
                                        <button type="button">これを選択</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                )}
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
                        onChange={e => setProductInfo({...productInfo, price:e.target.valueAsNumber || 0})}
                        min="0"
                        max={maxPrice}
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
                <button type="button" onClick={checkCanSell}>ねかセルチェック<small>(発売から1年以上経過しているか確認)</small></button><br/>
                {canSell &&
                    <button type="button" onClick={submitProduct}>出品</button>
                }
            </form>
        </div>
    )
}

export default DataList;