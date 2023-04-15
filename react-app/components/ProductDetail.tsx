import React from 'react';

export interface ProductDetailProps {
  name: string;
  imageSrc: string;
  country: string;
  company: string;
  labels: string[];
}

const ProductDetail: React.FC<ProductDetailProps> = ({
  name,
  imageSrc,
  country,
  company,
  labels,
}) => {
  return (
    <div className="product-detail">
      <div className="product-image">
        <img src={imageSrc} alt={name} />
      </div>
      <div className="product-info">
        <h2>{name}</h2>
        <p>Country of creation: {country}</p>
        <p>Company: {company}</p>
        <p>Labels: {labels.join(', ')}</p>
      </div>
    </div>
  );
};

export default ProductDetail;