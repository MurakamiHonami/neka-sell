import requests
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()
RAKUTEN_APP_ID=os.getenv("RAKUTEN_APP_ID")
BOOKS_URL="https://app.rakuten.co.jp/services/api/BooksTotal/Search/20170404"
def check_sales_data(sales_date_str):
    if not sales_date_str:
        return False
    
    try:
        clean_date=sales_date_str.replace("年","-").replace("月","-").replace("日","")

        sales_date=datetime.strptime(clean_date, "%Y-%m-%d").date()

        one_yaer_ago=datetime.now().date() - timedelta(days=365)

        return sales_date <= one_yaer_ago
    except Exception as e:
        print(f"Error: {e}")
        return False

def search_product_on_rakuten(keyword):
    params = {
        "applicationId": RAKUTEN_APP_ID,
        "keyword": keyword,
        "format": "json",
        "hits": 5
    }

    response = requests.get(BOOKS_URL, params=params)
    if response.status_code != 200:
        return []

    items=response.json().get("Items",[])
    results=[]

    for i in items:
        item=i["Item"]
        sales_date_str=item.get("salesDate")
        judge=check_sales_data(sales_date_str)
        if judge:
            results.append({
                "name": item["title"],
                "price": item["itemPrice"],
                "imageUrl": item["mediumImageUrl"],
                "canSell": True,
                "releaseDate": sales_date_str
            })
    return results