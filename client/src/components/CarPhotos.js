import React, { useState, useEffect } from 'react';

const CarPhotos = ({ style = {} }) => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMake, setFilterMake] = useState('');
  const [selectedCar, setSelectedCar] = useState(null);
  const [wikimediaPhotos, setWikimediaPhotos] = useState([]);
  const [loadingWikimedia, setLoadingWikimedia] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Car database with specifications
  const carDatabase = [
    {
      id: 1,
      make: 'Tesla',
      model: 'Model S',
      year: 2014,
      type: 'Electric',
      price: 40000,
      specs: {
        acceleration: '0-60 mph in 5.4s',
        range: '265 miles',
        topSpeed: '210 kph',
        power: '416 hp'
      }
    },
    {
      id: 2,
      make: 'BMW',
      model: 'M3 GTR',
      year: 2014,
      type: 'Gasoline',
      price: 45400,
      specs: {
        acceleration: '0-60 mph in 4.1s',
        engine: '4.0L V8',
        topSpeed: '260 kph',
        power: '450 hp'
      }
    },
    {
      id: 3,
      make: 'Mercedes',
      model: 'AMG GT',
      year: 2021,
      type: 'Gasoline',
      price: 167650,
      specs: {
        acceleration: '0-60 mph in 3.5s',
        engine: '4.0L twin-turbo V8 engine',
        topSpeed: '310 kph',
        power: '577 hp'
      }
    },
    {
      id: 4,
      make: 'Audi',
      model: 'RS7',
      year: 2024,
      type: 'Gasoline',
      price: 131195,
      specs: {
        acceleration: '0-60 mph in 3.3s',
        engine: '4.0L V8 twin-turbo engine',
        topSpeed: '305 kph',
        power: '621 hp'
      }
    },
    {
      id: 5,
      make: 'Porsche',
      model: '911 Turbo',
      year: 1980,
      type: 'Gasoline',
      price: 55000,
      specs: {
        acceleration: '0-60 mph in 6s',
        engine: '3.0L',
        topSpeed: '225 kph',
        power: '180 hp'
      }
    },
    {
      id: 6,
      make: 'Ferrari',
      model: 'F8 Tributo',
      year: 2019,
      type: 'Gasoline',
      price: 250000,
      specs: {
        acceleration: '0-60 mph in 2.8s',
        engine: '3.9L Twin-Turbocharged V8',
        topSpeed: '340 kph',
        power: '710 hp'
      }
    }
  ];

  /* --------------------------------------------------
     WIKIMEDIA HELPERS (updated implementation)
  -------------------------------------------------- */
  const fetchWikimediaImages = async (query, limit = 6) => {
    const base = 'https://commons.wikimedia.org/w/api.php';
    const search = new URLSearchParams({
      action: 'query',
      format: 'json',
      list: 'search',
      srsearch: `${query} car`,
      srnamespace: 6,
      srlimit: String(limit * 2),
      origin: '*',
    });

    try {
      const res = await fetch(`${base}?${search}`);
      if (!res.ok) throw new Error(`search failed (${res.status})`);

      const { query: q } = await res.json();
      if (!q?.search?.length) return [];

      const images = [];
      for (const item of q.search.slice(0, limit)) {
        const info = new URLSearchParams({
          action: 'query',
          format: 'json',
          titles: item.title,
          prop: 'imageinfo',
          iiprop: 'url|size|mime|dimensions',
          iiurlwidth: 600,
          origin: '*',
        });
        
        const infoRes = await fetch(`${base}?${info}`);
        if (!infoRes.ok) continue;
        
        const data = await infoRes.json();
        const page = data.query.pages[Object.keys(data.query.pages)[0]];
        const img = page.imageinfo?.[0];
        
        if (!img) continue;
        if (!img.mime.startsWith('image/') || img.width < 200 || img.height < 150) continue;
        
        images.push({
          title: item.title.replace('File:', ''),
          url: img.url,
          thumb_url: img.thumburl ?? img.url,
          width: img.width,
          height: img.height,
        });
      }
      return images.sort((a, b) => b.width * b.height - a.width * a.height);
    } catch (error) {
      console.error('Wikimedia search error:', error);
      throw error;
    }
  };

  const fetchCarPhoto = async (make, model) => {
    try {
      const pics = await fetchWikimediaImages(`${make} ${model}`, 1);
      return pics[0]?.thumb_url || `https://via.placeholder.com/400x250/374151/f8fafc?text=${encodeURIComponent(make + ' ' + model)}`;
    } catch (error) {
      console.error(`Error fetching photo for ${make} ${model}:`, error);
      return `https://via.placeholder.com/400x250/374151/f8fafc?text=${encodeURIComponent(make + ' ' + model)}`;
    }
  };

  // Load car data with photos
  useEffect(() => {
    const loadCarsWithPhotos = async () => {
      setLoading(true);
      try {
        const carsWithPhotos = await Promise.all(
          carDatabase.map(async (car) => {
            const photoUrl = await fetchCarPhoto(car.make, car.model);
            return { ...car, photoUrl };
          })
        );
        setCars(carsWithPhotos);
      } catch (err) {
        setError('Failed to load car photos');
        console.error('Error loading cars:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCarsWithPhotos();
  }, []);

  // Handle Wikimedia search for car images
  const handleWikimediaSearch = async () => {
    setLoadingWikimedia(true);
    setSearchError(null);
    try {
      const query = searchTerm.trim() || 'car';
      const photos = await fetchWikimediaImages(query);
      
      if (photos.length > 0) {
        setWikimediaPhotos(photos);
      } else {
        setSearchError('No images found.');
        setWikimediaPhotos([]);
      }
    } catch (err) {
      setSearchError('Failed to fetch Wikimedia images.');
      setWikimediaPhotos([]);
    } finally {
      setLoadingWikimedia(false);
    }
  };

  // Filter cars based on search and make filter
  const filteredCars = cars.filter(car => {
    const matchesSearch = !searchTerm || 
      car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMake = !filterMake || car.make === filterMake;
    
    return matchesSearch && matchesMake;
  });

  // Get unique makes for filter dropdown
  const uniqueMakes = [...new Set(cars.map(car => car.make))].sort();

  // Icons
  const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
      <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );

  const FilterIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );

  const EyeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );

  const HeartIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );

  const XIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
      <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );

  const styles = {
    container: {
      ...style,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '2rem',
    },
    icon: {
      width: '3rem',
      height: '3rem',
      borderRadius: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
      color: 'white',
    },
    title: {
      fontSize: '1.875rem',
      fontWeight: 700,
      color: 'white',
      margin: 0,
    },
    filtersContainer: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      flexWrap: 'wrap',
    },
    searchInput: {
      flex: 1,
      minWidth: '200px',
      padding: '0.75rem 1rem 0.75rem 3rem',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '0.75rem',
      color: 'white',
      fontSize: '0.875rem',
      position: 'relative',
    },
    searchContainer: {
      position: 'relative',
      flex: 1,
      minWidth: '200px',
    },
    searchIconContainer: {
      position: 'absolute',
      left: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: 'rgba(255, 255, 255, 0.5)',
    },
    filterSelect: {
      padding: '0.75rem 1rem',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '0.75rem',
      color: 'white',
      fontSize: '0.875rem',
      minWidth: '150px',
    },
    carsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '2rem',
    },
    carCard: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      backdropFilter: 'blur(8px)',
      borderRadius: '1rem',
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
    },
    carImage: {
      width: '100%',
      height: '200px',
      objectFit: 'cover',
      background: '#374151',
    },
    carContent: {
      padding: '1.5rem',
    },
    carHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem',
    },
    carInfo: {
      flex: 1,
    },
    carMake: {
      fontSize: '1.25rem',
      fontWeight: 700,
      color: 'white',
      margin: 0,
    },
    carModel: {
      fontSize: '1.125rem',
      color: '#c084fc',
      fontWeight: 600,
      margin: 0,
    },
    carBadge: {
      padding: '0.25rem 0.75rem',
      background: 'rgba(34, 197, 94, 0.2)',
      color: '#86efac',
      fontSize: '0.75rem',
      fontWeight: 600,
      borderRadius: '50px',
      border: '1px solid rgba(34, 197, 94, 0.3)',
    },
    carDetails: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
    },
    carYear: {
      color: 'rgba(255, 255, 255, 0.6)',
    },
    carPrice: {
      fontSize: '1.25rem',
      fontWeight: 700,
      color: '#06b6d4',
    },
    specsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.5rem',
      marginBottom: '1.5rem',
    },
    specItem: {
      fontSize: '0.75rem',
      color: 'rgba(255, 255, 255, 0.7)',
    },
    buttonGroup: {
      display: 'flex',
      gap: '0.5rem',
    },
    button: {
      padding: '0.75rem 1rem',
      borderRadius: '0.75rem',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 600,
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.875rem',
      flex: 1,
    },
    primaryButton: {
      background: 'linear-gradient(90deg, #8b5cf6 0%, #06b6d4 100%)',
      color: 'white',
    },
    secondaryButton: {
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '2rem',
    },
    modalContent: {
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(88, 28, 135, 0.95) 100%)',
      backdropFilter: 'blur(16px)',
      borderRadius: '1.5rem',
      padding: '2rem',
      maxWidth: '600px',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
    },
    closeButton: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: 'none',
      borderRadius: '0.5rem',
      padding: '0.5rem',
      cursor: 'pointer',
      color: 'white',
      transition: 'all 0.3s ease',
    },
    modalImage: {
      width: '100%',
      height: '300px',
      objectFit: 'cover',
      borderRadius: '1rem',
      marginBottom: '1.5rem',
    },
    specsList: {
      display: 'grid',
      gap: '0.75rem',
    },
    specListItem: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0.75rem',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '0.5rem',
      color: 'white',
    },
    specLabel: {
      fontWeight: 600,
    },
    specValue: {
      color: '#06b6d4',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '4rem',
    },
    loadingSpinner: {
      width: '3rem',
      height: '3rem',
      border: '4px solid rgba(255, 255, 255, 0.1)',
      borderTop: '4px solid #8b5cf6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    errorContainer: {
      textAlign: 'center',
      padding: '2rem',
      color: '#fca5a5',
    },
    wikimediaButton: {
      padding: '0.75rem 1rem',
      borderRadius: '0.75rem',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 600,
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.875rem',
      background: 'linear-gradient(90deg, #ec4899 0%, #8b5cf6 100%)',
      color: 'white',
    },
    wikimediaGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '1rem',
      marginTop: '2rem',
    },
    wikimediaImage: {
      width: '100%',
      height: '150px',
      objectFit: 'cover',
      borderRadius: '0.5rem',
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: 'white',
      margin: '2rem 0 1rem',
    },
    errorText: {
      color: '#fca5a5',
      marginTop: '0.5rem',
      fontSize: '0.875rem'
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.icon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18.4 10c-.4-.8-1.2-1.3-2.1-1.3H7.7c-.9 0-1.7.5-2.1 1.3L3.5 11.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2" stroke="currentColor" strokeWidth="2"/>
              <circle cx="7" cy="17" r="2" stroke="currentColor" strokeWidth="2"/>
              <circle cx="17" cy="17" r="2" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <h2 style={styles.title}>Car Gallery</h2>
        </div>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.icon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18.4 10c-.4-.8-1.2-1.3-2.1-1.3H7.7c-.9 0-1.7.5-2.1 1.3L3.5 11.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2" stroke="currentColor" strokeWidth="2"/>
            <circle cx="7" cy="17" r="2" stroke="currentColor" strokeWidth="2"/>
            <circle cx="17" cy="17" r="2" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
        <h2 style={styles.title}>Car Gallery</h2>
      </div>

      <div style={styles.filtersContainer}>
        <div style={styles.searchContainer}>
          <div style={styles.searchIconContainer}>
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search cars..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        
        <select
          value={filterMake}
          onChange={(e) => setFilterMake(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="">All Makes</option>
          {uniqueMakes.map(make => (
            <option key={make} value={make}>{make}</option>
          ))}
        </select>

        <button 
          onClick={handleWikimediaSearch}
          style={styles.wikimediaButton}
          disabled={loadingWikimedia}
        >
          {loadingWikimedia ? 'Searching...' : 'Search Wikimedia'}
        </button>
      </div>

      <div style={styles.carsGrid}>
        {filteredCars.map(car => (
          <div
            key={car.id}
            style={styles.carCard}
            className="card-hover"
            onClick={() => setSelectedCar(car)}
          >
            <img
              src={car.photoUrl}
              alt={`${car.make} ${car.model}`}
              style={styles.carImage}
              onError={(e) => {
                e.target.src = `https://via.placeholder.com/400x250/374151/f8fafc?text=${encodeURIComponent(car.make + ' ' + car.model)}`;
              }}
            />
            
            <div style={styles.carContent}>
              <div style={styles.carHeader}>
                <div style={styles.carInfo}>
                  <h3 style={styles.carMake}>{car.make}</h3>
                  <p style={styles.carModel}>{car.model}</p>
                </div>
                <span style={styles.carBadge}>{car.type}</span>
              </div>

              <div style={styles.carDetails}>
                <span style={styles.carYear}>{car.year}</span>
                <span style={styles.carPrice}>${car.price.toLocaleString()}</span>
              </div>

              <div style={styles.specsGrid}>
                <div style={styles.specItem}>
                  <strong>Power:</strong> {car.specs.power}
                </div>
                <div style={styles.specItem}>
                  <strong>0-60:</strong> {car.specs.acceleration}
                </div>
              </div>

              <div style={styles.buttonGroup}>
                <button style={{...styles.button, ...styles.primaryButton}}>
                  <EyeIcon />
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h3 style={styles.sectionTitle}>Wikimedia Images</h3>
      {loadingWikimedia && (
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
        </div>
      )}
      
      {searchError && (
        <p style={styles.errorText}>{searchError}</p>
      )}

     <div style={styles.wikimediaGrid}>
  {wikimediaPhotos.map((photo, index) => (
    <div key={`${photo.url}-${index}`}>
      <a href={photo.url} target="_blank" rel="noopener noreferrer">
        <img 
          src={photo.thumb_url} 
          alt={photo.title} 
          style={styles.wikimediaImage}
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/200x150/374151/f8fafc?text=Image+not+found`;
          }}
        />
      </a>
      <p style={{color: 'white', fontSize: '0.875rem'}}>
        {photo.title.length > 30 
          ? `${photo.title.substring(0, 30)}...` 
          : photo.title}
      </p>
    </div>
  ))}
</div>


      {selectedCar && (
        <div style={styles.modal} onClick={() => setSelectedCar(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={{color: 'white', margin: 0}}>
                {selectedCar.make} {selectedCar.model}
              </h2>
              <button
                style={styles.closeButton}
                onClick={() => setSelectedCar(null)}
              >
                <XIcon />
              </button>
            </div>

            <img
              src={selectedCar.photoUrl}
              alt={`${selectedCar.make} ${selectedCar.model}`}
              style={styles.modalImage}
            />

            <div style={styles.specsList}>
              <div style={styles.specListItem}>
                <span style={styles.specLabel}>Year:</span>
                <span style={styles.specValue}>{selectedCar.year}</span>
              </div>
              <div style={styles.specListItem}>
                <span style={styles.specLabel}>Price:</span>
                <span style={styles.specValue}>${selectedCar.price.toLocaleString()}</span>
              </div>
              <div style={styles.specListItem}>
                <span style={styles.specLabel}>Type:</span>
                <span style={styles.specValue}>{selectedCar.type}</span>
              </div>
              {Object.entries(selectedCar.specs).map(([key, value]) => (
                <div key={key} style={styles.specListItem}>
                  <span style={styles.specLabel}>
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:
                  </span>
                  <span style={styles.specValue}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .card-hover:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(139, 92, 246, 0.3);
        }
      `}</style>
    </div>
  );
};

export default CarPhotos;