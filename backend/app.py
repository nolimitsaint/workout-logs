from flask import Flask, request, jsonify
from flask_cors import CORS
import json, os
from math import ceil

app = Flask(__name__)
CORS(app)  # allow Netlify frontend to call this API (cross-origin)

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "workouts.json")

# ----------------------------
# JSON file helpers
# ----------------------------
def read_data():
    with open(DATA_PATH, "r") as f:
        return json.load(f)

def write_data(records):
    with open(DATA_PATH, "w") as f:
        json.dump(records, f, indent=2)

def next_id(records):
    return (max([r["id"] for r in records]) if records else 0) + 1

# ----------------------------
# Server-side validation (required)
# ----------------------------
def validate(w):
    if not w.get("date") or not w.get("exercise"):
        return False, "date and exercise are required"

    try:
        sets = int(w.get("sets"))
        reps = int(w.get("reps"))
        weight = float(w.get("weight"))
    except:
        return False, "sets, reps, and weight must be numbers"

    if sets < 1 or sets > 20:
        return False, "sets must be between 1 and 20"
    if reps < 1 or reps > 50:
        return False, "reps must be between 1 and 50"
    if weight < 0 or weight > 1000:
        return False, "weight must be between 0 and 1000"

    return True, ""

# ----------------------------
# GET (paged list) — required paging (10/page)
# GET /api/workouts?page=1&limit=10
# ----------------------------
@app.get("/api/workouts")
def get_workouts():
    records = read_data()
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))

    total = len(records)
    total_pages = max(1, ceil(total / limit))

    # clamp page bounds
    page = max(1, min(page, total_pages))

    start = (page - 1) * limit
    end = start + limit
    items = records[start:end]

    return jsonify({
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": total_pages,
        "records": items
    })

# ----------------------------
# GET stats (entire dataset)
# ----------------------------
@app.get("/api/stats")
def get_stats():
    records = read_data()
    total = len(records)
    total_weight = sum(float(r.get("weight", 0)) for r in records)
    avg_weight = (total_weight / total) if total else 0

    return jsonify({
        "total": total,
        "avgWeight": round(avg_weight, 1)
    })

# ----------------------------
# POST create
# ----------------------------
@app.post("/api/workouts")
def create_workout():
    records = read_data()
    w = request.get_json(force=True)

    ok, msg = validate(w)
    if not ok:
        return jsonify({"error": msg}), 400

    new_item = {
        "id": next_id(records),
        "date": w["date"],
        "exercise": w["exercise"].strip(),
        "sets": int(w["sets"]),
        "reps": int(w["reps"]),
        "weight": float(w["weight"])
    }

    records.append(new_item)
    write_data(records)
    return jsonify(new_item), 201

# ----------------------------
# PUT update
# ----------------------------
@app.put("/api/workouts/<int:item_id>")
def update_workout(item_id):
    records = read_data()
    w = request.get_json(force=True)

    ok, msg = validate(w)
    if not ok:
        return jsonify({"error": msg}), 400

    for r in records:
        if r["id"] == item_id:
            r["date"] = w["date"]
            r["exercise"] = w["exercise"].strip()
            r["sets"] = int(w["sets"])
            r["reps"] = int(w["reps"])
            r["weight"] = float(w["weight"])
            write_data(records)
            return jsonify({"ok": True})

    return jsonify({"error": "not found"}), 404

# ----------------------------
# DELETE delete
# ----------------------------
@app.delete("/api/workouts/<int:item_id>")
def delete_workout(item_id):
    records = read_data()
    new_records = [r for r in records if r["id"] != item_id]

    if len(new_records) == len(records):
        return jsonify({"error": "not found"}), 404

    write_data(new_records)
    return jsonify({"ok": True})

if __name__ == "__main__":
    app.run(debug=True)
# To run the app, use the command: python backend/app.py


