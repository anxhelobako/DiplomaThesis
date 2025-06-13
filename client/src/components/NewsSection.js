// src/components/NewsSection.js
import React from 'react';

const NewsSection = () => {
  const news = [
    { id: 1, title: 'New Electric Car Models Released in 2025', date: 'May 10, 2025', description: 'Exciting new electric cars are hitting the market this year, providing more options for eco-friendly driving.' },
    { id: 2, title: 'Fuel Prices Surge in Europe', date: 'May 9, 2025', description: 'Fuel prices in Europe have increased, making fuel efficiency more important than ever for car owners.' },
    { id: 3, title: 'Upcoming Car Technology Trends', date: 'May 8, 2025', description: 'A look at the new technologies that will revolutionize the automotive industry in the coming years.' },
  ];

  return (
    <div style={{ marginBottom: '30px' }}>
      <h2>Latest News</h2>
      <div>
        {news.map((item) => (
          <div key={item.id} style={{ marginBottom: '20px' }}>
            <h3>{item.title}</h3>
            <p><strong>{item.date}</strong></p>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsSection;