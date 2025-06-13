from flask import Blueprint, jsonify
import feedparser

news_bp = Blueprint('news', __name__, url_prefix='/api/news')

@news_bp.route('/', methods=['GET'])
def get_car_news():
    url = "https://news.google.com/rss/search?q=car+industry&hl=en-US&gl=US&ceid=US:en"
    feed = feedparser.parse(url)

    articles = []
    for entry in feed.entries[:5]:
        articles.append({
            "title": entry.title,
            "link": entry.link,
            "published": entry.published,
            "summary": entry.summary
        })

    return jsonify(articles)
