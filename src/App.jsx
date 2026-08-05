import React from 'react';

export default function App({ products }) {
  // Fall back to an empty array if products are undefined during early hydration
  const productList = products || [];

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1>E-Commerce SSR Showcase</h1>
        <p>Ultra-fast server-rendered storefront</p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px' 
      }}>
        {productList.map(product => (
          <div key={product.id} style={{ 
            border: '1px solid #eaeaea', 
            padding: '20px', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <img 
              src={product.image} 
              alt={product.title} 
              style={{ height: '150px', objectFit: 'contain', marginBottom: '15px' }} 
            />
            <h2 style={{ fontSize: '1.1rem', margin: '10px 0' }}>
              {product.title.substring(0, 30)}...
            </h2>
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2ecc71' }}>
              ${product.price}
            </p>
            <button style={{
              background: '#000',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }} onClick={() => alert(`Added ${product.title} to cart!`)}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}