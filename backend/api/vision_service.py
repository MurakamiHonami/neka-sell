from google.cloud import vision
import os
from dotenv import load_dotenv

load_dotenv()
base_dir=os.path.dirname(__file__)
key_path=os.path.join(base_dir,os.getenv("KEY_PATH"))
os.environ["GOOGLE_APPLICATION_CREDENTIALS"]=key_path

def get_keywords_from_image(image_content):
    client=vision.ImageAnnotatorClient()
    image=vision.Image(content=image_content)

    response=client.web_detection(image=image)
    annotations=response.web_detection

    keywords=[]
    if annotations.web_entities:
        for entity in annotations.web_entities:
            if entity.description:
                keywords.append(entity.description)
    
    return keywords