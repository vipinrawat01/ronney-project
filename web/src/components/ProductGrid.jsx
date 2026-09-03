import React from 'react';
import ProductCard from '@/components/ProductCard.jsx';

function ProductGrid({ products, layout = 'grid' }) {
  if (layout === 'zigzag') {
    return (
      <div className="space-y-24">
        {products.map((product, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
          >
            <div className={index % 2 === 0 ? 'md:order-1' : 'md:order-2'}>
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-auto rounded-2xl shadow-lg"
              />
            </div>
            <div className={index % 2 === 0 ? 'md:order-2' : 'md:order-1'}>
              <h3 className="text-3xl mb-4">{product.title}</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {product.description}
              </p>
              {product.price && (
                <p className="text-3xl font-semibold text-primary mb-6" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  ${product.price}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product, index) => (
        <ProductCard
          key={index}
          image={product.image}
          title={product.title}
          description={product.description}
          price={product.price}
          variant={index === 0 ? 'elevated' : index % 2 === 0 ? 'subtle' : 'elevated'}
        />
      ))}
    </div>
  );
}

export default ProductGrid;