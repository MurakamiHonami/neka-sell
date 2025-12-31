import requests
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
import re

load_dotenv()
RAKUTEN_APP_ID=os.getenv("RAKUTEN_APP_ID")
BOOKS_URL="https://app.rakuten.co.jp/services/api/BooksTotal/Search/20170404"
def check_sales_data(sales_date_str):
    if not sales_date_str:
        return False
    
    try:
        nums = re.findall(r'\d+', sales_date_str)
        if not nums:
            return False

        year = int(nums[0])
        month = int(nums[1]) if len(nums) > 1 else 1 # 月がない場合は1月とする
        day = int(nums[2]) if len(nums) > 2 else 1   # 日がない場合は1日とする
        
        sales_date = datetime(year, month, day).date()

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