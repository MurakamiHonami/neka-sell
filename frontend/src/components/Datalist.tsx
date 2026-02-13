import React, { useEffect, useState } from "react";
import Button from '@mui/material/Button';
import { Data } from "../types/Data"
import { fetchData } from "../service/DataService";
import "../App.css"

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
    
    if (loading) return (
        <div className="loading-container">
            <div className="text-center">
                <div className="spinner"></div>
                <p className="loading-text">読み込み中...</p>
            </div>
        </div>
    )

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


    const checkCanSell = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!image) return;
        setRakutenItems([]);
        const formData = new FormData();
        formData.append("image",image);

        try {
            const response = await fetch("http://172.20.0.1:5000/api/search",{
                method: "POST",
                body: formData
            });

            if(!response.ok) {
                const errorText = await response.text();
                throw new Error(`サーバーエラー:${response.status} - ${errorText}`)
            }
    
            const result = await response.json();
            console.log("バックエンドからのレスポンス:",result);
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
        <div className="flex-box">
            <div className="data-list-container">
                <h2 className="section-title">商品一覧</h2>
                <ul className="product-grid">
                    {data.map((d) => (
                        <li key={d.id} className="product-card">
                            <div className="card-image-wrapper">
                                <img
                                    src={d.imageUrl}
                                    alt={`${d.name}の画像`}
                                    className="product-image"
                                />
                            </div>
                            <div className="card-content">
                                <strong className="product-name">{d.name}</strong>
                                <div className="product-price">¥{d.price.toLocaleString()}</div>
                                {d.state ? (
                                    currentUser.id === d.sellerId ? (
                                        <span className="badge-owner">(自分の出品です)</span>
                                    ) : (
                                        <button onClick={()=> purchaseProduct(d.id)} className="purchase-btn">購入する</button>
                                    )
                                ): (
                                    <span className="badge-sold">売り切れ</span>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="sell-form-panel">
                <h2 className="section-title">出品</h2>
                <form className="sell-form-container">
                    {rakutenItems.length > 0 && (
                        <div className="rakuten-suggestion">
                            <h3 className="suggestion-title">出品可能な商品<small>(楽天ブックスから検索)</small></h3>
                            <div className="suggestion-list">
                                {rakutenItems.map((item, index)=>(
                                    <div
                                    key={index}
                                    className="suggestion-item"
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
                                        <img src={item.imageUrl} alt={`${item.name}の画像`} className="suggestion-img"/>
                                        <div className="suggestion-info">
                                            <p className="suggestion-name">{item.name}</p>
                                            <p className="suggestion-price">¥{item.price.toLocaleString()}</p>
                                            <p className="suggestion-date">発売日:{item.releaseDate}</p>
                                            <button type="button" className="suggestion-select-btn">これを選択</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    )}
                    <p className="form-group">
                        <label>商品名:</label>
                        <input
                            type="text"
                            value={productInfo.name}
                            onChange={e => setProductInfo({...productInfo, name:e.target.value})}
                            className="form-input"
                            placeholder="商品の名前を入力"
                        />
                    </p>
                    <p className="form-group">
                        <label>価格:</label>
                        <div className="price-input-wrapper">
                            <input
                                type="number"
                                value={productInfo.price}
                                onChange={e => setProductInfo({...productInfo, price:e.target.valueAsNumber || 0})}
                                min="0"
                                max={maxPrice}
                                className="form-input"
                                placeholder="0"
                            />
                            <span className="currency-symbol">円</span>
                        </div>
                    </p>
                    <p className="form-group">
                        <label>商品画像:</label>
                        <input className="file-input"
                                type="file"
                                accept="image/*,.png,.jpg,.jpeg,.gif"
                                onChange={getImage}
                        />
                        {previewUrl && (
                            <div className="preview-container">
                                <p className="preview-label">プレビュー:</p>
                                <img
                                    src={previewUrl}
                                    alt="商品画像のプレビュー"
                                    className="preview-image"
                                    />
                            </div>
                        )}
                    </p>
                    <button onClick={(e) => checkCanSell(e)} className="check-btn">⚠️ねかセルチェック<small>(発売から1年以上経過しているか確認)</small></button><br/>
                    <Button variant="contained" color="success" onClick={submitProduct} disabled={!canSell} fullWidth className="check-btn">{canSell ? "出品" : "出品できません"}</Button>
                </form>
                </div>
        </div>
    )
}

export default DataList;