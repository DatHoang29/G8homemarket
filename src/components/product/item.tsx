import React from "react";
import { Box, Text, Button } from "zmp-ui";
import { Product } from "@/types";
import { useAddToCart } from "@/state";
import { formatPrice } from "@/utils/format";
import { NgrokImage } from "@/components/ngrok-image";

const SvgPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

export interface ProductItemProps {
  product: Product;
}

export const ProductItem: React.FC<ProductItemProps> = ({ product }) => {
  const addToCart = useAddToCart();

  return (
    <Box className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full">
      <Box 
        className="relative aspect-square overflow-hidden bg-gray-50"
        onClick={() => {
          // Future: Navigate to product detail
        }}
      >
        <NgrokImage
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        {product.originalPrice > product.price && (
          <Box className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
          </Box>
        )}
      </Box>
      
      <Box className="p-3 flex-1 flex flex-col justify-between space-y-2">
        <Box>
          <Text size="small" className="line-clamp-2 font-medium text-gray-800 min-h-[40px]">
            {product.name}
          </Text>
          <Box className="mt-1 flex items-baseline space-x-1">
            <Text className="text-primary font-bold" size="normal">
              {formatPrice(product.price)}
            </Text>
            {product.originalPrice > product.price && (
              <Text className="text-gray-400 line-through text-[10px]">
                {formatPrice(product.originalPrice)}
              </Text>
            )}
          </Box>
        </Box>

        <Button
          size="small"
          fullWidth
          onClick={() => {
            console.log("Button 'Thêm' clicked for product:", product.name);
            addToCart(product);
          }}
          prefixIcon={<SvgPlus />}
        >
          Thêm
        </Button>
      </Box>
    </Box>
  );
};
