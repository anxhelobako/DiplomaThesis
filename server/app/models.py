from .extensions import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

favorites_table = db.Table('favorites',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('car_id', db.Integer, db.ForeignKey('car.id'))
)

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(128))
    is_admin = db.Column(db.Boolean, default=False)

    favorites = db.relationship('Car', secondary=favorites_table, backref=db.backref('favorited_by', lazy='dynamic'))

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name
        }

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Car(db.Model):
    __tablename__ = 'car'
    id = db.Column(db.Integer, primary_key=True)
    make = db.Column(db.String(100), nullable=False)
    model = db.Column(db.String(100), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'make': self.make,
            'model': self.model,
            'year': self.year,
            'price': self.price
        }


class FuelRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    distance = db.Column(db.Float, nullable=False)
    km_per_liter = db.Column(db.Float, nullable=False)
    liters_per_100km = db.Column(db.Float, nullable=False)
    total_expense = db.Column(db.Float, nullable=True)
    cost_per_km = db.Column(db.Float, nullable=True)
    km_per_currency = db.Column(db.Float, nullable=True)
    gas_added = db.Column(db.Float, nullable=False)

    user = db.relationship('User', backref=db.backref('fuel_records', lazy=True))
