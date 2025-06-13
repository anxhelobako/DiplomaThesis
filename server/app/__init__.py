from flask import Flask
from flask_cors import CORS
from flask_session import Session
from .config import Config
from .extensions import db, login_manager, jwt, migrate
from .routes.auth_routes import auth_bp, modifications_bp
from .routes.cars_routes import cars_bp
from flask_caching import Cache
from .routes.car_news_routes import news_bp
from .routes.used_car_routes import used_cars_bp

# Initialize extensions

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

     # Database and JWT setup
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///cars.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['CACHE_TYPE'] = 'SimpleCache'
    cache = Cache(app)

    db.init_app(app)
    jwt.init_app(app)
    login_manager.init_app(app)
    migrate.init_app(app, db)
    
    # CORS settings
    CORS(app, supports_credentials=True, origins=['http://localhost:3000'], methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

    # Session settings
    app.config.update(
        SESSION_TYPE='filesystem',
        SESSION_FILE_DIR='./flask_session',
        SESSION_COOKIE_NAME='react_flask_session',
        SESSION_COOKIE_SECURE=False,  # Set to True in production
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE='Lax',
        PERMANENT_SESSION_LIFETIME=86400
    )

    Session(app)

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(cars_bp, url_prefix='/api/cars')
    app.register_blueprint(news_bp)  
    app.register_blueprint(used_cars_bp)
    app.register_blueprint(modifications_bp)


    return app
