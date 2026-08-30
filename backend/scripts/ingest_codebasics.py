"""
Ingest top educational tutorials from 'codebasics' into curated_videos.
"""

import os
import asyncio
import httpx
import re
import urllib.parse
from dotenv import load_dotenv
from supabase import create_client
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

def parse_iso8601_duration(duration: str) -> int:
    match = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", duration)
    if not match:
        return 0
    return int(match.group(1) or 0) * 3600 + int(match.group(2) or 0) * 60 + int(match.group(3) or 0)

load_dotenv('.env')
sb = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))
GEMINI_KEY = os.getenv('GEMINI_API_KEY')
YOUTUBE_KEY = os.getenv('YOUTUBE_API_KEY')

CODEBASICS_VIDEOS = [
    # ── Machine Learning in Python ──
    ("codebasics", "codebasics machine learning tutorial linear regression single variable python", "Linear Regression Single Variable in Python with Scikit-Learn"),
    ("codebasics", "codebasics machine learning tutorial linear regression multiple variables python", "Multivariate Linear Regression in Python with Scikit-Learn"),
    ("codebasics", "codebasics machine learning tutorial gradient descent python from scratch cost function", "Gradient Descent and Cost Function Implementation in Python from Scratch"),
    ("codebasics", "codebasics machine learning tutorial dummy variables one hot encoding python pandas", "Categorical Data Encoding — One-Hot Encoding and Dummy Variables in Python"),
    ("codebasics", "codebasics machine learning tutorial train test split python scikit-learn", "Train/Test Split and Model Evaluation with Scikit-Learn"),
    ("codebasics", "codebasics machine learning tutorial logistic regression binary classification python", "Binary Logistic Regression in Python with Scikit-Learn"),
    ("codebasics", "codebasics machine learning tutorial logistic regression multiclass classification python", "Multiclass Logistic Regression and Digits Dataset Classification"),
    ("codebasics", "codebasics machine learning tutorial decision tree classification python", "Decision Tree Classification in Python with Scikit-Learn"),
    ("codebasics", "codebasics machine learning tutorial support vector machine SVM python", "Support Vector Machines (SVM) Classifier in Python with Scikit-Learn"),
    ("codebasics", "codebasics machine learning tutorial random forest classifier python", "Random Forest Classifier in Python with Scikit-Learn"),
    ("codebasics", "codebasics machine learning tutorial k fold cross validation python", "K-Fold Cross Validation in Python with Scikit-Learn"),
    ("codebasics", "codebasics machine learning tutorial k means clustering algorithm python elbow method", "K-Means Clustering and Elbow Method in Python with Scikit-Learn"),
    ("codebasics", "codebasics machine learning tutorial naive bayes classifier python spam detection", "Naive Bayes Classifier for Email Spam Detection in Python"),
    ("codebasics", "codebasics machine learning tutorial hyperparameter tuning GridSearchCV python", "Hyperparameter Tuning with GridSearchCV and RandomizedSearchCV in Scikit-Learn"),
    ("codebasics", "codebasics machine learning tutorial L1 L2 regularization Lasso Ridge regression python", "L1 (Lasso) and L2 (Ridge) Regularization in Python with Scikit-Learn"),
    ("codebasics", "codebasics machine learning tutorial Principal Component Analysis PCA python code", "Principal Component Analysis (PCA) Implementation in Python with Scikit-Learn"),
    ("codebasics", "codebasics machine learning tutorial feature engineering outlier detection removal python", "Feature Engineering — Outlier Detection and Removal in Python"),

    # ── Deep Learning & Neural Networks ──
    ("codebasics", "codebasics deep learning what is neural network artificial neural network ANN", "Introduction to Artificial Neural Networks (ANN) Architecture"),
    ("codebasics", "codebasics deep learning activation functions sigmoid relu tanh leaky relu", "Neural Network Activation Functions — Sigmoid, ReLU, Tanh, and Leaky ReLU"),
    ("codebasics", "codebasics deep learning loss functions mean squared error vs binary cross entropy", "Neural Network Loss Functions — Mean Squared Error (MSE) vs Cross-Entropy"),
    ("codebasics", "codebasics deep learning gradient descent python from scratch neural network", "Neural Network Gradient Descent and Backpropagation in Python from Scratch"),
    ("codebasics", "codebasics deep learning stochastic gradient descent batch mini batch python", "Batch vs Stochastic vs Mini-Batch Gradient Descent in Deep Learning"),
    ("codebasics", "codebasics deep learning tensorboard visualization tensorflow keras", "TensorBoard Visualization for Neural Network Training and Losses"),
    ("codebasics", "codebasics deep learning dropout regularization prevent overfitting tensorflow", "Dropout Regularization for Preventing Overfitting in Deep Neural Networks"),
    ("codebasics", "codebasics deep learning convolutional neural network CNN image classification", "Convolutional Neural Networks (CNN) for Image Classification with TensorFlow/Keras"),
    ("codebasics", "codebasics deep learning transfer learning fine tuning CNN resnet vgg", "Transfer Learning and Fine-Tuning Pretrained CNN Models"),
    ("codebasics", "codebasics deep learning recurrent neural network RNN simple explanation", "Recurrent Neural Networks (RNN) Architecture for Sequential Data"),
    ("codebasics", "codebasics deep learning word embeddings word2vec gensim python", "Word Embeddings and Word2Vec Implementation in Python with Gensim"),

    # ── Data Analysis with Pandas & Python ──
    ("codebasics", "codebasics pandas dataframe basics tutorial python", "Pandas DataFrame Basics — Creation, Indexing, and Selection"),
    ("codebasics", "codebasics pandas read write excel csv files tutorial", "Reading and Writing CSV, Excel, and JSON Files in Pandas"),
    ("codebasics", "codebasics pandas handle missing data fillna dropna interpolate", "Handling Missing Data in Pandas — dropna, fillna, and interpolate"),
    ("codebasics", "codebasics pandas groupby aggregate split apply combine", "Pandas GroupBy — Split, Apply, Combine and Aggregations"),
    ("codebasics", "codebasics pandas concat merge join dataframes", "Merging, Joining, and Concatenating DataFrames in Pandas"),
    ("codebasics", "codebasics pandas pivot table melt reshape dataframe", "Reshaping DataFrames — Pivot Tables, Stack, and Melt in Pandas"),

    # ── Data Structures & Algorithms in Python ──
    ("codebasics", "codebasics data structures algorithms arrays python Big O notation", "Arrays and Big O Time Complexity in Python"),
    ("codebasics", "codebasics data structures algorithms linked list python implementation", "Linked List Implementation from Scratch in Python"),
    ("codebasics", "codebasics data structures algorithms hash table hash map python collision", "Hash Table (Hash Map) Implementation and Collision Handling in Python"),
    ("codebasics", "codebasics data structures algorithms stack python implementation", "Stack Data Structure Implementation in Python"),
    ("codebasics", "codebasics data structures algorithms queue python implementation", "Queue Data Structure Implementation in Python"),
    ("codebasics", "codebasics data structures algorithms binary search tree BST python", "Binary Search Tree (BST) Implementation in Python"),
    ("codebasics", "codebasics data structures algorithms binary search vs linear search python", "Binary Search vs Linear Search Implementation and Complexity in Python"),
    ("codebasics", "codebasics data structures algorithms bubble sort python", "Bubble Sort Algorithm Implementation in Python"),
    ("codebasics", "codebasics data structures algorithms quick sort python", "QuickSort Algorithm Implementation in Python"),
    ("codebasics", "codebasics data structures algorithms merge sort python", "Merge Sort Algorithm Implementation in Python"),
    ("codebasics", "codebasics data structures algorithms graph representation BFS DFS python", "Graph Representation, BFS, and DFS Traversal in Python"),

    # ── SQL & Database Fundamentals ──
    ("codebasics", "codebasics SQL tutorial select where order by group by", "SQL Basics — SELECT, WHERE, ORDER BY, and GROUP BY Queries"),
    ("codebasics", "codebasics SQL tutorial inner join left join right join full join", "SQL Joins — Inner Join, Left Join, Right Join, and Full Outer Join"),
    ("codebasics", "codebasics SQL tutorial subqueries nested queries with clause CTE", "SQL Subqueries, Nested Queries, and Common Table Expressions (CTEs)"),
    ("codebasics", "codebasics SQL tutorial stored procedures database functions", "Stored Procedures and User-Defined Functions in SQL"),
    ("codebasics", "codebasics SQL tutorial window functions row_number rank dense_rank", "SQL Window Functions — ROW_NUMBER, RANK, DENSE_RANK, and Over Partition By"),
]

async def search_and_ingest():
    print(f"Ingesting {len(CODEBASICS_VIDEOS)} curated codebasics tutorials...")
    async with httpx.AsyncClient(timeout=20.0) as client:
        for channel, query, topic_label in CODEBASICS_VIDEOS:
            headers = {"User-Agent": "Mozilla/5.0"}
            url = f"https://www.youtube.com/results?search_query={urllib.parse.quote(query)}"
            r = await client.get(url, headers=headers)
            video_ids = list(dict.fromkeys(re.findall(r'/watch\?v=([a-zA-Z0-9_-]{11})', r.text)))
            if not video_ids:
                print(f"MISS {topic_label}")
                continue

            r2 = await client.get(
                "https://www.googleapis.com/youtube/v3/videos",
                params={"part": "snippet,contentDetails", "id": ",".join(video_ids[:5]), "key": YOUTUBE_KEY}
            )
            items = r2.json().get("items", [])
            chosen = None
            for item in items:
                dur = parse_iso8601_duration(item.get("contentDetails", {}).get("duration", ""))
                if dur >= 300:
                    chosen = item
                    break

            if not chosen:
                print(f"MISS (duration) {topic_label}")
                continue

            vid_id = chosen["id"]
            title = chosen["snippet"]["title"]
            dur_mins = parse_iso8601_duration(chosen["contentDetails"]["duration"]) // 60

            # Generate embedding
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key={GEMINI_KEY}"
            res = await client.post(url, json={"model": "models/gemini-embedding-2", "outputDimensionality": 768, "content": {"parts": [{"text": topic_label}]}})
            emb = res.json().get("embedding", {}).get("values")

            row = {
                "video_id": vid_id,
                "clean_title": title,
                "channel": "codebasics",
                "topic": topic_label,
                "duration_mins": dur_mins,
                "topic_embedding": emb
            }
            sb.table("curated_videos").upsert(row, on_conflict="video_id").execute()
            print(f"OK [{vid_id}] {dur_mins}m | {topic_label[:65]}")

asyncio.run(search_and_ingest())
EOF
