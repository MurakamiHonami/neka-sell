from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, String, Integer, Boolean
from flask_cors import CORS
import uuid
import os

app=Flask(__name__)
CORS(app)

base_dir=os.path.dirname(__file__)
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

with app.app_context():
    db.create_all()

@app.route("/api/register", methods=["POST"])
def register():
    data=request.get_json()
    username=data.get("username")
    password=data.get("password")

    if User.query.filter_by(username=username).first():
        return jsonify({"error":"このユーザー名は既に使用されています"}),400
    
    new_user=User(
        id=str(uuid.uuid4()),
        username=username,
        password=password
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

    user=User.query.filter_by(username=username, password=password).first()

    if user:
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

UPLOAD_FOLDER="./uploads"
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
            imageUrl=f"http://localhost:5000/uploads/{new_filename}",
            seller_id=seller_id,
        )

        db.session.add(new_product)
        db.session.commit()

        return jsonify({
            "id": new_product.id,
            "name": new_product.name,
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
    app.run(debug=True)