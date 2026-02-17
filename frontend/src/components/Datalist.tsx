import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { Data } from "../types/Data";
import { fetchData } from "../service/DataService";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import NotInterestedIcon from "@mui/icons-material/NotInterested";
import { API_URL } from "./config";
import FeedbackDialog from "./Feedback";
import "../index.css";


interface DataListProps {
  currentUser: {
    id: string;
    username: string;
  };
}

const DataList: React.FC<DataListProps> = ({ currentUser }) => {
  const [data, setData] = useState<Data[]>([]);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState<File>();
  const [productInfo, setProductInfo] = useState<Partial<Data>>({
    name: "",
    price: 0,
    state: true,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [canSell, setCanSell] = useState(false);
  const [rakutenItems, setRakutenItems] = useState<any[]>([]);
  const [maxPrice, setMaxPrice] = useState(0);
  const [open, setOpen]=useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  }

  const handleClose = async () => {
    setOpen(false);
  }
  
  useEffect(() => {
    fetchData()
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="w-full py-24 grid place-items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-[color:rgba(29,231,140,0.3)] border-t-[#1de78c] animate-spin" />
          <p className="text-slate-600 dark:text-slate-300 text-sm">読み込み中...</p>
        </div>
      </div>
    );

  const getImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const img = e.target.files[0];
    setImage(img);
    const url = URL.createObjectURL(img);
    setPreviewUrl(url);
  };

  const submitProduct = async () => {
    if (!image || productInfo.name === "" || productInfo.price === 0 || productInfo.state === false) {
      alert("商品情報を登録してください");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("name", String(productInfo.name));
    formData.append("price", String(productInfo.price));
    formData.append("state", String(productInfo.state));
    formData.append("seller_id", currentUser.id);

    const postImageUri = `${API_URL}/api/upload`;

    try {
      const response = await fetch(postImageUri, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("送信に失敗しました");

      const result: Data = await response.json();

      setData([...data, result]);
      setProductInfo({ name: "", price: 0, state: true });
      setImage(undefined);
      setPreviewUrl(null);
      alert(`${result.name} の出品に成功しました！`);
    } catch {}
  };

  const purchaseProduct = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/purchase/${id}`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "購入に失敗しました");
      }

      setData((prevData) => prevData.map((item) => (item.id === id ? { ...item, state: false } : item)));
      alert("購入完了");
    } catch {
      alert("購入に失敗しました");
    }
  };

  const checkCanSell = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!image) return;
    setRakutenItems([]);
    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await fetch(`${API_URL}/api/search`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`サーバーエラー:${response.status} - ${errorText}`);
      }

      const result = await response.json();
      if (result.rakutenItems && result.rakutenItems.length > 0) {
        alert("出品可能な商品が見つかりました");
        setRakutenItems(result.rakutenItems);
        setCanSell(true);
      } else {
        alert("出品できる商品が見つかりませんでした");
        setCanSell(false);
      }
    } catch {
      alert("検索中にエラーが発生しました");
    }
  };

  return (
    <div className="flex flex-col justify-center">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="lg:col-span-2 flex-1">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-xl font-bold relative inline-block">
              商品
              <span className="absolute -bottom-1 left-0 w-1/2 h-1 bg-[#1de78c] rounded-full" />
            </h2>
          </div>
          <ul className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {data.map((d) => (
              <li
                key={d.id}
                className="bg-white dark:bg-[#1a2c24] p-3 rounded-[1rem] flex flex-col shadow-sm border border-slate-100 dark:border-slate-800/50 hover:border-[color:rgba(29,231,140,0.5)] transition-colors"
              >
                <div className="w-full aspect-square rounded-xl overflow-hidden relative">
                  <img src={d.imageUrl} alt={`${d.name}の画像`} className="w-full h-full object-contain transition-transform duration-300 hover:scale-105" />
                  {!d.state && (
                    <div className="absolute inset-0 bg-black/40 grid place-items-center">
                      <span className="text-white font-bold text-sm px-3 py-1 rounded-full border border-white/20">売り切れ</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between pt-3">
                  <div className="flex items-start justify-between">
                    <strong className="font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{d.name}</strong>
                    {d.state ? currentUser.id === d.sellerId ? <span className="bg-[color:rgba(29,231,140,0.1)] text-[#1de78c] border border-[color:rgba(29,231,140,0.2)] text-[10px] px-1.5 py-0.5 rounded-md font-bold">OWNER</span> : null : null}
                  </div>
                  <div className="flex items-end justify-between mt-2">
                    <div className="text-lg font-bold text-[#1de78c]">¥{d.price.toLocaleString()}</div>
                    {d.state ? (
                      currentUser.id === d.sellerId ? (
                        <span className="text-xs text-slate-500">(自分の出品です)</span>
                      ) : (
                        <button
                          onClick={() => purchaseProduct(d.id)}
                          className="px-4 py-2 rounded-full bg-[#1de78c] text-[#11211a] text-sm font-semibold hover:brightness-95 active:scale-95 transition-all shadow-[0_8px_20px_rgba(29,231,140,0.35)]"
                        >
                          購入する
                        </button>
                      )
                    ) : (
                      <span className="text-xs text-slate-400">SOLD</span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-bold relative inline-block">
              出品
              <span className="absolute -bottom-1 left-0 w-1/2 h-1 bg-[#1de78c] rounded-full" />
            </h2>
          </div>

          <div className="bg-white dark:bg-[#1a2c24] p-4 rounded-[1rem] border border-slate-100 dark:border-slate-800/50 shadow-lg">
            <form className="space-y-4">
              {rakutenItems.length > 0 && (
                <div className="bg-[#f6f8f7] dark:bg-[color:rgba(255,255,255,0.06)] border border-[color:rgba(29,231,140,0.3)] rounded-[1rem] p-3 space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    出品可能な商品
                    <small className="ml-2 text-xs text-slate-500">(楽天ブックスから検索)</small>
                  </h3>
                  <div className="flex flex-col gap-3 max-h-72 overflow-y-auto">
                    {rakutenItems.map((item: any, index) => (
                      <div
                        key={index}
                        className="flex gap-3 p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[color:rgba(29,231,140,0.5)] transition-colors cursor-pointer bg-white/70 dark:bg-slate-900/30"
                        onClick={() => {
                          setProductInfo({
                            ...productInfo,
                            name: item.name,
                            price: item.price,
                          });
                          setMaxPrice(item.price);
                          setRakutenItems([]);
                        }}
                      >
                        <img src={item.imageUrl} alt={`${item.name}の画像`} className="w-16 h-16 rounded-lg object-cover" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold line-clamp-2">{item.name}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-[#1de78c] font-bold text-sm">¥{item.price.toLocaleString()}</p>
                            <button type="button" className="px-3 py-1 text-xs rounded-full bg-[#1de78c] text-[#11211a] font-bold">
                              これを選択
                            </button>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">発売日:{item.releaseDate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">商品名:</label>
                <input
                  type="text"
                  value={productInfo.name}
                  onChange={(e) => setProductInfo({ ...productInfo, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1de78c]"
                  placeholder="商品の名前を入力"
                />
              </p>

              <p className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">価格:</label>
                <div className="relative">
                  <input
                    type="number"
                    value={productInfo.price}
                    onChange={(e) => setProductInfo({ ...productInfo, price: e.target.valueAsNumber || 0 })}
                    min={0}
                    max={maxPrice}
                    className="w-full pl-4 pr-12 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1de78c]"
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">円</span>
                </div>
              </p>

              <p className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">商品画像:</label>
                <input
                  className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-[#1de78c] file:text-[#11211a] file:font-semibold file:px-4 file:py-2 hover:file:brightness-95 cursor-pointer text-slate-600 dark:text-slate-300"
                  type="file"
                  accept="image/*,.png,.jpg,.jpeg,.gif"
                  onChange={getImage}
                />
                {previewUrl && (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-500">プレビュー:</p>
                    <img src={previewUrl} alt="商品画像のプレビュー" className="w-full aspect-[4/3] object-cover rounded-xl border border-slate-200 dark:border-slate-700" />
                  </div>
                )}
              </p>

              <button onClick={(e) => checkCanSell(e)} className="w-full px-4 py-3 rounded-xl bg-[color:rgba(29,231,140,0.2)] text-[#1de78c] font-semibold hover:bg-[#1de78c] hover:text-black transition-all">
                ⚠️ねかセルチェック
                <small className="ml-2 text-xs opacity-75">(発売から1年以上経過しているか確認)</small>
              </button>

              <Button
                startIcon={canSell ? <TaskAltIcon /> : <NotInterestedIcon />}
                variant="contained"
                color="success"
                onClick={submitProduct}
                disabled={!canSell}
                className="w-full !rounded-xl !py-3 !text-sm !font-bold !shadow-[0_8px_20px_rgba(29,231,140,0.35)] disabled:!bg-slate-400"
                fullWidth
              >
                {canSell ? "出品" : "出品できません"}
              </Button>
            </form>
          </div>
        </div>
      </div>
      <button
        className="px-4 py-3 my-5 rounded-xl bg-[color:rgba(29,231,140,0.2)] text-[#1de78c] font-semibold hover:bg-[#1de78c] hover:text-black transition-all"
        onClick={handleClickOpen}
      >
        フィードバックを送る
      </button>
      <FeedbackDialog
        open={open}
        onClose={handleClose}
      />
    </div> 
  );
};

export default DataList;
