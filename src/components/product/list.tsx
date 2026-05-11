import React, { Suspense } from "react";
import { useAtomValue } from "jotai";
import { productsState } from "@/state";
import { Box, Grid, Text, Spinner } from "zmp-ui";
import { ProductItem } from "./item";

const ProductListContent: React.FC = () => {
  const products = useAtomValue(productsState);

  if (products.length === 0) {
    return (
      <Box className="p-8 text-center">
        <Text className="text-gray-400">Không tìm thấy sản phẩm nào</Text>
      </Box>
    );
  }

  return (
    <Box className="p-4">
      <Grid columnCount={1} gap={12}>
        {products.slice(0, 1).map((product) => (
          <ProductItem key={product.id} product={product} />
        ))}
      </Grid>
    </Box>
  );

};

export const ProductList: React.FC = () => {
  return (
    <Suspense 
      fallback={
        <Box className="flex justify-center items-center p-12">
          <Spinner />
        </Box>
      }
    >
      <ProductListContent />
    </Suspense>
  );
};
