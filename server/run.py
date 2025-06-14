from app import create_app
from app.extensions import db
from flask_migrate import Migrate
from flask_caching import Cache
import feedparser
from server import create_app

app = create_app()
migrate = Migrate(app, db)

# Add this to display routes
@app.cli.command("list-routes")
def list_routes():
    print("Available routes:")
    for rule in app.url_map.iter_rules():
        print(f"{rule.methods} {rule}")

if __name__ == '__main__':
    app.run(debug=True)