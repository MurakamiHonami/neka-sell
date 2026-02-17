from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, String, Integer, Boolean
from flask_cors import CORS
import uuid
import os
from vision_service import get_keywords_from_image
from rakuten_service import search_product_on_rakuten
from werkzeug.security import generate_password_hash, check_password_hash
from flask_talisman import Talisman
from dotenv import load_dotenv

load_dotenv()

API_URL=os.getenv("API_URL")

app=Flask(__name__)
CORS(app)
# コンテンツセキュリティポリシーの設定
csp = {
    'default-src': '\'self\'', # 自身のサーバー以外は信用しない
    'img-src': '*', # 画像は外部からも許可
    # 自身のJS/CSSとHTML内に直接書かれたものだけ実行を許可
    'script-src': '\'unsafe-inline\' \'self\'',
    'style-src': '\'unsafe-inline\' \'self\''
}
Talisman(app, content_security_policy=csp, force_https=False)

base_dir=os.path.dirname(os.path.abspath(__file__))
backend_dir=os.path.dirname(base_dir)
UPLOAD_FOLDER=os.path.join(backend_dir,'uploads')
app.config["SQLALCHEMY_DATABASE_URI"] = 'sqlite:///' + os.path.join(base_dir, 'data.sqlite')
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"]=False

db=SQLAlchemy(app)

class Product(db.Model):
    __tablename__="products"
    id=Column(String(36),primary_key=True)
    name=Column(String(255), nullable=False)
    price=Column(Integer, nullable=False)
    state=Column(Boolean, default=True)
    imageUrl=Column(String(255))
    seller_id=Column(String(36), nullable=True)

class User(db.Model):
    __tablename__ = "users"
    id=Column(String(36), primary_key=True)
    username=Column(String(50), unique=True, nullable=False)
    password=Column(String(100), nullable=False)

class Feedback(db.Model):
    __tablename__ = "feedbacks"
    id=Column(String(36), primary_key=True)
    feedback=Column(String(100), nullable=True)

with app.app_context():
    db.create_all()

@app.route("/")
def health_check():
    return "OK", 200

@app.route("/feedback",methods=["POST"])
def post_feedback():
    try:
        data = request.get_json()

        if not data:
             return jsonify({"error": "データが空です"}), 400

        feedback_content = data.get("feedback")

        if not feedback_content:
             return jsonify({"error": "フィードバック内容がありません"}), 400

        new_feedback = Feedback(
            id=str(uuid.uuid4()),
            feedback=feedback_content
        )
        db.session.add(new_feedback)
        db.session.commit()

        return jsonify({
            "message": "フィードバック投稿完了"
        }), 201

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "サーバー内部エラーが発生しました"}), 500

@app.route("/api/register", methods=["POST"])
def register():
    data=request.get_json()
    username=data.get("username")
    password=data.get("password")

    if User.query.filter_by(username=username).first():
        return jsonify({"error":"このユーザー名は既に使用されています"}),400
    
    # パスワードをハッシュ化して保存
    hashed_password = generate_password_hash(password)
    new_user=User(
        id=str(uuid.uuid4()),
        username=username,
        password=hashed_password
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "message":"ユーザー登録完了",
        "id": new_user.id
    }),201

@app.route("/api/login", methods=["POST"])
def login():
    data=request.get_json()
    username=data.get("username")
    password=data.get("password")
    user=User.query.filter_by(username=username).first()

    if user and check_password_hash(user.password, password):
        return jsonify({
            "message":"ログイン成功",
            "user": {
                "id": user.id,
                "username": user.username
            }
        }),200
    else:
        return jsonify({
            "error":"ユーザー名またはパスワードが正しくありません"
        }),401


@app.route("/api/search",methods=["POST"])
def search():
    try:
        image_file=request.files.get("image")
        if not image_file:
            return jsonify({"error":"画像がありません"}),400
        
        image_content=image_file.read()
        keywords=get_keywords_from_image(image_content)

        if not keywords:
            return jsonify({"error":"商品を特定できませんでした"}),404
        
        search_results=[]
        for kw in keywords[:5]:
            result=search_product_on_rakuten(kw)
            search_results.extend(result)
        
        return jsonify({
            "keywords":keywords[:5],
            "rakutenItems": search_results,
            "ok": True
        }),200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}),500

@app.route("/api/data", methods=["GET"])
def get_products():
    products=Product.query.all()
    output=[]
    for p in products:
        output.append({
            "id": p.id,
            "name": p.name,
            "price":p.price,
            "state": p.state,
            "imageUrl": p.imageUrl,
            "sellerId": p.seller_id,
        })
    return jsonify(output)

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route("/api/upload", methods=["POST"])
def upload_product():
    try:
        name = request.form.get("name")
        price = int(request.form.get("price"))
        state_str = request.form.get("state")
        image_file = request.files.get("image")
        seller_id=request.form.get("seller_id")

        if not image_file or not name:
            return jsonify({"error":"不足している項目があります"}),400
        
        file_extension = os.path.splitext(image_file.filename)[1]
        new_filename = f"{uuid.uuid4()}{file_extension}"
        image_path = os.path.join(UPLOAD_FOLDER,new_filename)
        image_file.save(image_path)

        new_product = Product(
            id=str(uuid.uuid4()),
            name=name,
            price=price,
            state=(state_str.lower() == "true"),
            imageUrl=f"{API_URL}/uploads/{new_filename}",
            seller_id=seller_id,
        )

        db.session.add(new_product)
        db.session.commit()

        return jsonify({
            "id": new_product.id,
            "name": new_product.name,
            "price": new_product.price,
            "state": new_product.state,
            "imageUrl": new_product.imageUrl,
            "sellerId": new_product.seller_id,
        }),200
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error":"サーバー内部エラー"}),500

@app.route("/api/purchase/<string:product_id>",methods=["PATCH"])
def purchase_product(product_id):
    product=Product.query.get(product_id)

    if not product:
        return jsonify({"error":"商品が見つかりません"}),400
    
    if not product.state :
        return jsonify({"error":"この商品はすでに売り切れています"}),400
    
    product.state=False
    db.session.commit()

    return jsonify({
        "message": "購入が完了しました",
        "product": {
            "id":product.id,
            "name":product.name,
            "state":product.state
        }
    }),200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)