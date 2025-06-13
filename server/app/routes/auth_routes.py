from flask import Blueprint, request, jsonify, session, make_response, current_app
from flask import Flask 
from werkzeug.security import generate_password_hash, check_password_hash
from ..extensions import db
from flask_session import Session
from app.models import Car, User, FuelRecord, favorites_table
import requests
from flask_jwt_extended import JWTManager, get_jwt_identity, jwt_required
from flask_login import login_required
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_caching import Cache
from flask_cors import cross_origin
import time
import feedparser
from dateutil import parser
from datetime import datetime
import urllib.parse
import os
import json
from bs4 import BeautifulSoup

auth_bp = Blueprint('auth', __name__)   
news_bp = Blueprint('news', __name__)
api = Blueprint('api', __name__)
media_bp = Blueprint('media', __name__)
modifications_bp = Blueprint('modifications', __name__, url_prefix='/api/modifications')

MODS_PATH = os.path.join(os.path.dirname(__file__), '..', 'static', 'data', 'modifications_data.json')


# Setup rate limiting
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Setup caching
cache = Cache(config={'CACHE_TYPE': 'SimpleCache'})

@news_bp.route('/api/news', methods=['GET', 'OPTIONS'])
@cross_origin(origins='http://localhost:3000')  # Handles CORS properly
def get_car_news():
    if request.method == 'OPTIONS':
        return '', 200  # Important: respond with 200 to CORS preflight

    # Now cache only the GET result (not OPTIONS)
    @cache.cached(timeout=3600, unless=lambda: request.method != 'GET')
    def get_articles():
        articles = [
            {
                "title": "Rivian R2's Advanced Suspension System Revealed",
                "description": "New details emerge about the innovative suspension in Rivian's upcoming R2 model",
                "url": "https://www.autoblog.com/news/rivian-r2-advanced-suspension",
                "image": "https://example.com/images/rivian-r2.jpg",
                "publishedAt": datetime.utcnow().isoformat(),
                "source": "Autoblog"
            },
            {
                "title": "German Cars Decline in Popularity Among Enthusiasts",
                "description": "Analysis shows shifting preferences in car enthusiast searches worldwide",
                "url": "https://www.autoblog.com/news/german-cars-out-whats-behind-a-big-shift-in-car-enthusiast-searches",
                "image": "https://example.com/images/german-cars.jpg",
                "publishedAt": datetime.utcnow().isoformat(),
                "source": "Autoblog"
            },
            {
                "title": "Audi's Q2 Crossover Ready for Global Expansion",
                "description": "Audi's smallest crossover poised to compete in premium compact segment",
                "url": "https://www.autoblog.com/news/audis-smallest-crossover-is-ready-to-hit-the-big-leagues",
                "image": "https://example.com/images/audi-q2.jpg",
                "publishedAt": datetime.utcnow().isoformat(),
                "source": "Autoblog"
            },
            {
                "title": "Chevrolet Overtakes Ford in EV Market Share",
                "description": "GM's electric vehicle lineup surpasses Ford in US sales rankings",
                "url": "https://www.autoblog.com/news/chevrolet-surpasses-ford-for-number-2-ev-spot",
                "image": "https://example.com/images/chevrolet-ev.jpg",
                "publishedAt": datetime.utcnow().isoformat(),
                "source": "Autoblog"
            },
            {
                "title": "Dacora Emerges as New Luxury EV Contender",
                "description": "Startup aims to challenge Rolls-Royce with premium electric vehicles",
                "url": "https://www.autoblog.com/news/dacora-luxury-ev-rolls-royce-rival",
                "image": "https://example.com/images/dacora-ev.jpg",
                "publishedAt": datetime.utcnow().isoformat(),
                "source": "Autoblog"
            },
            {
                "title": "Kia Reports Record Sales Growth",
                "description": "Korean automaker sees unprecedented demand across its model lineup",
                "url": "https://www.autoblog.com/news/kia-sales-soar",
                "image": "https://example.com/images/kia-showroom.jpg",
                "publishedAt": datetime.utcnow().isoformat(),
                "source": "Autoblog"
            },
            {
                "title": "Apple CarPlay's Major iOS 26 Update",
                "description": "New features coming to Apple's car integration system",
                "url": "https://www.autoblog.com/news/apple-carplay-updates-whats-new-for-ios-26",
                "image": "https://example.com/images/carplay.jpg",
                "publishedAt": datetime.utcnow().isoformat(),
                "source": "Autoblog"
            }
        ]
        return jsonify(articles)

    return get_articles()

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    
    # Check if user already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'message': 'User already exists!'}), 400
    
    new_user = User(name=name, email=email)

    # Create new user and save to database
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"message": "User registered successfully!"}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'message': 'Invalid email or password'}), 401
    
    session.permanent = True
    session.clear()
    session.modified = True

    # Create a session for the user upon successful login
    session['user_id'] = user.id  # Store the user's ID in the session
    
    return jsonify({'message': 'Login successful!', 'user': {'email': user.email, 'name': user.name}}), 200


@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    resp = make_response(jsonify({'message': 'Logged out successfully!'}))
    resp.set_cookie(current_app.config['SESSION_COOKIE_NAME'], '', expires=0, path='/')  # This expires the session cookie immediately
    return resp


@auth_bp.route('/protected', methods=['GET'])
def protected():
    if 'user_id' not in session:
        return jsonify({'message': 'You must be logged in to access this page'}), 401

    user = User.query.get(session['user_id'])
    return jsonify({'message': f'Hello {user.name}, welcome to the protected route!'}), 200


@auth_bp.route('/check_session', methods=['GET'])
def check_session():
    print('Current session:', dict(session))
    
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'logged_in': False}), 200

    user = User.query.get(user_id)
    if not user:
        session.clear()  # Clear invalid session
        return jsonify({'logged_in': False}), 200

    return jsonify({
        'logged_in': True,
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'is_admin': user.is_admin  # include this for admin checks
        }
    }), 200


@auth_bp.route('/add_favorite/<int:car_id>', methods=['POST'])
def add_favorite(car_id):
    if 'user_id' not in session:
        return jsonify({'message': 'Unauthorized'}), 401

    user = User.query.get(session['user_id'])
    car = Car.query.get(car_id)

    if not car:
        return jsonify({'message': 'Car not found'}), 404

    if car not in user.favorites:
        user.favorites.append(car)
        db.session.commit()
        print(f"Added car {car.id} to favorites of user {user.id}")
    else:
        print(f"Car {car.id} already in favorites of user {user.id}")

    return jsonify({'message': 'Car added to favorites'})


@auth_bp.route('/my_favorites', methods=['GET'])
def my_favorites():
    if 'user_id' not in session:
        return jsonify({'message': 'Unauthorized'}), 401

    user = User.query.get(session['user_id'])
    return jsonify([car.to_dict() for car in user.favorites])

@auth_bp.route('/remove_favorite/<int:car_id>', methods=['DELETE'])
def remove_favorite(car_id):
    if 'user_id' not in session:
        return jsonify({'message': 'Unauthorized'}), 401

    user = User.query.get(session['user_id'])
    car = Car.query.get(car_id)

    if not car:
        return jsonify({'message': 'Car not found'}), 404

    if car in user.favorites:
        user.favorites.remove(car)
        db.session.commit()

    return jsonify({'message': 'Car removed from favorites'}), 200

@auth_bp.route('/fuel_records', methods=['POST'])
def add_fuel_record():
    if "user_id" not in session:
        return jsonify({"message": "Unauthorized"}), 401
    
    data = request.json
    user_id = session['user_id']

    record = FuelRecord(
        user_id=user_id,
        distance=data['distance'],
        km_per_liter=data['kmPerLiter'],
        liters_per_100km=data['litersPer100km'],
        total_expense=data.get('totalExpense'),
        cost_per_km=data.get('costPerKm'),
        km_per_currency=data.get('kmPerCurrency'),
        gas_added=data['gasAdded']
    )
    db.session.add(record)
    db.session.commit()
    return jsonify({'message': 'Fuel record added successfully', 'id': record.id})

@auth_bp.route('/fuel_records', methods=['GET'])
def get_fuel_records():
    if "user_id" not in session:
        return jsonify({"message": "Unauthorized"}), 401

    user_id = session['user_id']
    records = FuelRecord.query.filter_by(user_id=user_id).all()
    result = [{
        'id': r.id,
        'distance': r.distance,
        'kmPerLiter': r.km_per_liter,
        'litersPer100km': r.liters_per_100km,
        'totalExpense': r.total_expense,
        'costPerKm': r.cost_per_km,
        'kmPerCurrency': r.km_per_currency,
        'gasAdded': r.gas_added
    } for r in records]
    return jsonify(result)

@auth_bp.route('/fuel_records/<int:record_id>', methods=['DELETE'])
def delete_fuel_record(record_id):
    if "user_id" not in session:
        return jsonify({"message": "Unauthorized"}), 401

    user_id = session['user_id']
    record = FuelRecord.query.filter_by(id=record_id, user_id=user_id).first()
    if not record:
        return jsonify({'error': 'Record not found'}), 404
    db.session.delete(record)
    db.session.commit()
    return jsonify({'message': 'Record deleted'})

@auth_bp.route('/fuel_records/<int:record_id>', methods=['PUT'])
def update_fuel_record(record_id):
    if "user_id" not in session:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.json
    user_id = get_jwt_identity()
    record = FuelRecord.query.filter_by(id=record_id, user_id=user_id).first()
    if not record:
        return jsonify({'error': 'Record not found'}), 404

    record.distance = data['distance']
    record.km_per_liter = data['kmPerLiter']
    record.liters_per_100km = data['litersPer100km']
    record.total_expense = data.get('totalExpense')
    record.cost_per_km = data.get('costPerKm')
    record.km_per_currency = data.get('kmPerCurrency')
    record.gas_added = data['gasAdded']
    db.session.commit()

    return jsonify({'message': 'Fuel record updated'})


@auth_bp.route('/api/used_cars', methods=['GET'])
@login_required
def get_used_cars():
    make = request.args.get('make')
    model = request.args.get('model')
    year = request.args.get('year')
    fuel_type = request.args.get('fuel_type')

    query = Car.query.filter(Car.is_used == True)  # Filter used cars only
    if make:
        query = query.filter(Car.make.ilike(f"%{make}%"))
    if model:
        query = query.filter(Car.model.ilike(f"%{model}%"))
    if year:
        query = query.filter(Car.year == int(year))
    if fuel_type:
        query = query.filter(Car.fuel_type.ilike(f"%{fuel_type}%"))

    used_cars = query.all()
    return jsonify([car.to_dict() for car in used_cars])

@media_bp.route('/api/car_photos/search', methods=['GET'])
@limiter.limit("10 per minute")
@cache.cached(timeout=3600, query_string=True)
def search_car_photos():
    
    try:
        # Get and validate parameters
        make = request.args.get('make', '').strip()
        model = request.args.get('model', '').strip()
        limit = min(int(request.args.get('limit', 6)), 20)  # Max 20 results
        min_width = int(request.args.get('min_width', 300))
        min_height = int(request.args.get('min_height', 200))

        if not make:
            return jsonify({'error': "Parameter 'make' is required"}), 400

        # Build search query
        search_query = f"{make} {model} car".strip()
        base_url = "https://commons.wikimedia.org/w/api.php"
        headers = {
            'User-Agent': 'CarGalleryApp/1.0 (https://yourdomain.com; contact@yourdomain.com)'
        }

        # First API call - search for images
        search_params = {
            'action': 'query',
            'format': 'json',
            'list': 'search',
            'srsearch': search_query,
            'srnamespace': 6,  # File namespace
            'srlimit': min(limit * 2, 50),  # Over-fetch to account for filtering
            'origin': '*'
        }

        search_response = requests.get(
            base_url,
            params=search_params,
            headers=headers,
            timeout=10
        )
        search_response.raise_for_status()
        search_data = search_response.json()

        # Process results
        photos = []
        for item in search_data.get('query', {}).get('search', []):
            if len(photos) >= limit:
                break

            title = item['title']
            
            # Second API call - get image details
            info_params = {
                'action': 'query',
                'format': 'json',
                'titles': title,
                'prop': 'imageinfo',
                'iiprop': 'url|size|mime|dimensions',
                'iiurlwidth': min_width,
                'origin': '*'
            }

            try:
                info_response = requests.get(
                    base_url,
                    params=info_params,
                    headers=headers,
                    timeout=10
                )
                info_response.raise_for_status()
                info_data = info_response.json()

                # Extract image info
                pages = info_data.get('query', {}).get('pages', {})
                if not pages:
                    continue

                page = next(iter(pages.values()))
                image_info = (page.get('imageinfo') or [{}])[0]

                # Validate image
                mime_type = image_info.get('mime', '')
                width = image_info.get('width', 0)
                height = image_info.get('height', 0)

                if (not mime_type.startswith('image/') or 
                    width < min_width or 
                    height < min_height):
                    continue

                # Add to results
                photos.append({
                    'title': title.replace('File:', ''),
                    'url': image_info.get('url', ''),
                    'thumb_url': image_info.get('thumburl', image_info.get('url', '')),
                    'width': width,
                    'height': height,
                    'size': image_info.get('size', 0),
                    'mime_type': mime_type,
                    'description': item.get('snippet', '')
                                      .replace('<span class="searchmatch">', '')
                                      .replace('</span>', ''),
                    'source': 'Wikimedia Commons'
                })

            except (requests.RequestException, KeyError, StopIteration) as e:
                continue  # Skip this image if there's an error

        # Sort by image area (width * height) and limit results
        photos.sort(key=lambda x: x['width'] * x['height'], reverse=True)
        photos = photos[:limit]

        return jsonify({
            'photos': photos,
            'count': len(photos),
            'query': search_query,
            'success': True
        })

    except requests.RequestException as e:
        return jsonify({
            'error': 'Wikimedia API request failed',
            'details': str(e),
            'success': False
        }), 502
    except ValueError as e:
        return jsonify({
            'error': 'Invalid parameter value',
            'details': str(e),
            'success': False
        }), 400
    except Exception as e:
        return jsonify({
            'error': 'Unexpected server error',
            'details': str(e),
            'success': False
        }), 500


@media_bp.route('/api/car_photos/random', methods=['GET'])
@limiter.limit("10 per minute")
def get_random_car_photo():
    """
    Get a random suitable photo for make+model with enhanced filtering
    
    Parameters:
        make (required): Car manufacturer
        model (required): Car model
        min_width (default 300): Minimum image width
        min_height (default 200): Minimum image height
    """
    try:
        make = request.args.get('make', '').strip()
        model = request.args.get('model', '').strip()
        min_width = int(request.args.get('min_width', 300))
        min_height = int(request.args.get('min_height', 200))

        if not make or not model:
            return jsonify({
                'error': "Parameters 'make' and 'model' are required",
                'success': False
            }), 400

        base_url = "https://commons.wikimedia.org/w/api.php"
        headers = {
            'User-Agent': 'CarGalleryApp/1.0 (https://yourdomain.com; contact@yourdomain.com)'
        }

        # Search with random sorting
        search_params = {
            'action': 'query',
            'format': 'json',
            'list': 'search',
            'srsearch': f"{make} {model} car",
            'srnamespace': 6,
            'srlimit': 15,
            'srsort': 'random',
            'origin': '*'
        }

        search_response = requests.get(
            base_url,
            params=search_params,
            headers=headers,
            timeout=10
        )
        search_response.raise_for_status()
        search_data = search_response.json()

        # Try each result until we find a suitable image
        for item in search_data.get('query', {}).get('search', []):
            title = item['title']
            
            info_params = {
                'action': 'query',
                'format': 'json',
                'titles': title,
                'prop': 'imageinfo',
                'iiprop': 'url|size|mime|dimensions',
                'iiurlwidth': min_width,
                'origin': '*'
            }

            try:
                info_response = requests.get(
                    base_url,
                    params=info_params,
                    headers=headers,
                    timeout=10
                )
                info_response.raise_for_status()
                info_data = info_response.json()

                pages = info_data.get('query', {}).get('pages', {})
                if not pages:
                    continue

                page = next(iter(pages.values()))
                image_info = (page.get('imageinfo') or [{}])[0]

                mime_type = image_info.get('mime', '')
                width = image_info.get('width', 0)
                height = image_info.get('height', 0)

                if (mime_type.startswith('image/') and 
                    width >= min_width and 
                    height >= min_height):
                    return jsonify({
                        'photo': {
                            'title': title.replace('File:', ''),
                            'url': image_info.get('url', ''),
                            'thumb_url': image_info.get('thumburl', image_info.get('url', '')),
                            'width': width,
                            'height': height,
                            'source': 'Wikimedia Commons'
                        },
                        'success': True
                    })

            except (requests.RequestException, KeyError, StopIteration):
                continue  # Skip to next image if error occurs

        return jsonify({
            'photo': None,
            'message': 'No suitable image found',
            'success': False
        }), 404

    except requests.RequestException as e:
        return jsonify({
            'error': 'Wikimedia API request failed',
            'details': str(e),
            'success': False
        }), 502
    except Exception as e:
        return jsonify({
            'error': 'Unexpected server error',
            'details': str(e),
            'success': False
        }), 500
    
@auth_bp.route('/add_dummy_favorite/<int:car_id>', methods=['POST'])
def add_dummy_favorite(car_id):
    if 'user_id' not in session:
        return jsonify({'message': 'Unauthorized'}), 401

    # Load favorites from session or init
    favorites = session.get('dummy_favorites', [])
    if car_id not in favorites:
        favorites.append(car_id)
        session['dummy_favorites'] = favorites
        session.modified = True

    return jsonify({'message': 'Dummy car added to favorites'})

@auth_bp.route('/my_dummy_favorites', methods=['GET'])
def get_dummy_favorites():
    try:
        DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'static', 'data', 'used_cars_data.json')

        if not os.path.exists(DATA_PATH):
            return jsonify({'error': 'Car data file not found'}), 500

        with open(DATA_PATH, 'r') as f:
            all_cars = json.load(f)

        favorites_ids = session.get('dummy_favorites', [])

        if not isinstance(favorites_ids, list):
            favorites_ids = []

        favorite_cars = []
        for car in all_cars:
            try:
                if int(car.get('id')) in favorites_ids:
                    favorite_cars.append(car)
            except Exception as e:
                print(f"❌ Skipping invalid car entry: {e}")

        return jsonify(favorite_cars)

    except Exception as e:
        print(f"🔥 Error in /my_dummy_favorites: {e}")
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500   
    
@auth_bp.route('/remove_dummy_favorite/<int:car_id>', methods=['DELETE'])
def remove_dummy_favorite(car_id):
    favorites = session.get('dummy_favorites', [])
    if car_id in favorites:
        favorites.remove(car_id)
        session['dummy_favorites'] = favorites
        session.modified = True

    return jsonify({'message': 'Dummy car removed from favorites'})

@modifications_bp.route('', methods=['GET'])
def get_modifications():
    make = request.args.get('make', '').lower()
    model = request.args.get('model', '').lower()

    try:
        with open(MODS_PATH, 'r') as file:
            all_mods = json.load(file)

        for mod in all_mods:
            if make == mod.get('make', '').lower() and model == mod.get('model', '').lower():
                return jsonify(mod.get('modifications', {}))

        return jsonify({})  # No match found

    except Exception as e:
        return jsonify({"error": str(e)}), 500



