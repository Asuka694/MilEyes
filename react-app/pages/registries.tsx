import React from 'react';
import ProductDetail, { ProductDetailProps } from 'components/ProductDetail';

interface ProductListProps {
  products: ProductDetailProps[];
}

const ProductList: React.FC<ProductListProps> = ({ products }) => {
  return (
    <div className="product-list">
      {products.map((product, index) => (
        <ProductDetail key={index} {...product} />
      ))}
    </div>
  );
};

export default ProductList;