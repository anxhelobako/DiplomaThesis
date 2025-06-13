import os
import json
from flask import Blueprint, request, jsonify

used_cars_bp = Blueprint('used_cars', __name__, url_prefix='/api/used_cars')

DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'static', 'data', 'used_cars_data.json')

@used_cars_bp.route('', methods=['GET'])
def get_dummy_used_cars():
    make = request.args.get('make', '').strip().lower()
    model = request.args.get('model', '').strip().lower()
    year = request.args.get('year', '').strip()

    try:
        with open(DATA_PATH, 'r', encoding='utf-8') as f:
            cars = json.load(f)

        filtered = []
        for car in cars:
            car_make = str(car.get('make', '')).strip().lower()
            car_model = str(car.get('model', '')).strip().lower()
            car_year = str(car.get('year', '')).strip()

            # Strict matching
            if (
                (not make or car_make == make) and
                (not model or car_model == model) and
                (not year or car_year == year)
            ):
                filtered.append(car)

        print(f"🔍 Matched {len(filtered)} out of {len(cars)} cars")
        return jsonify(filtered)

    except Exception as e:
        print(f"🔥 Error loading dummy data: {e}")
        return jsonify({"error": "Failed to load used car data"}), 500
