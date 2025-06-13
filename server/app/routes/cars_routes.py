from flask import Blueprint, jsonify, request
from flask_cors import CORS
from ..extensions import db
from app.models import Car, User, FuelRecord, favorites_table

cars_bp = Blueprint('cars', __name__)
CORS(cars_bp, supports_credentials=True, origins=['http://localhost:3000'])
cars_bp.strict_slashes = False

@cars_bp.route('', methods=['GET', 'POST', 'Options'])
def handle_cars():
    if request.method == 'OPTIONS':
        return ('', 204)  # <-- Return a proper empty response for preflight

    if request.method == 'GET':
        cars = Car.query.all()
        return jsonify([car.to_dict() for car in cars])

    if request.method == 'POST':
        data = request.get_json()
        # validate required fields
        for field in ['make', 'model', 'year', 'price']:
            if field not in data:
                return jsonify({'error': f'Missing {field}'}), 400

        new_car = Car(
            make=data['make'],
            model=data['model'],
            year=int(data['year']),
            price=float(data['price'])
        )
        db.session.add(new_car)
        db.session.commit()
        return jsonify(new_car.to_dict()), 201
    

@cars_bp.route('/<int:car_id>', methods=['GET'])
def get_car_by_id(car_id):
    car = Car.query.get(car_id)
    if not car:
        return jsonify({'message': 'Car not found'}), 404
    return jsonify(car.to_dict()), 200

# Edit car
@cars_bp.route('/<int:car_id>', methods=['PUT'])
def update_car(car_id):
    car = Car.query.get_or_404(car_id)
    data = request.get_json()

    car.make = data.get('make', car.make)
    car.model = data.get('model', car.model)
    car.year = data.get('year', car.year)
    car.price = data.get('price', car.price)

    db.session.commit()
    return jsonify(car.to_dict()), 200

# Delete car
@cars_bp.route('/<int:car_id>', methods=['DELETE'])
def delete_car(car_id):
    car = Car.query.get_or_404(car_id)
    db.session.delete(car)
    db.session.commit()
    return jsonify({'message': 'Car deleted successfully'}), 200




