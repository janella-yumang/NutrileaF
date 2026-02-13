"""
Remove category field from forum_threads collection
"""
from pymongo import MongoClient
from config import Config

# Connect to MongoDB
client = MongoClient(Config.MONGODB_URI)
db = client.get_database()

# Remove category field from all forum threads
result = db.forum_threads.update_many(
    {"category": {"$exists": True}},
    {"$unset": {"category": ""}}
)

print(f"Updated {result.modified_count} forum threads")
print(f"Matched {result.matched_count} documents with category field")

# Verify
remaining = db.forum_threads.count_documents({"category": {"$exists": True}})
print(f"Remaining documents with category field: {remaining}")

client.close()
print("Done!")
