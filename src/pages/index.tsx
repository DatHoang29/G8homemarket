import React from "react";
import { Page, Box, Text, Icon } from "zmp-ui";
import { ProductList } from "@/components/product/list";
import { useAtomValue } from "jotai";
import { cartTotalState } from "@/state";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BottomNavigation } from "@/components/bottom-navigation";



const HomePage: React.FC = () => {
  const { totalItems } = useAtomValue(cartTotalState);
  const navigate = useNavigate();

  return (
    <Page className="bg-gray-50 pb-20">
      <Box className="bg-white p-4 sticky top-0 z-50 flex items-center justify-between shadow-sm">
        <Box className="flex items-center space-x-2">
          <Box className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Icon icon="zi-home" className="text-white" />
          </Box>
          <Box>
            <Text size="large" bold className="text-primary">G8 Market</Text>
            <Text size="xSmall" className="text-gray-400">Mua sắm thông minh</Text>
          </Box>
        </Box>
        
        <Box 
          className="relative w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full"
          onClick={() => {
            // Future: Navigate to cart
          }}
        >
          <Icon icon="zi-cart" size={24} className="text-gray-600" />
          {totalItems > 0 && (
            <Box className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white">
              {totalItems}
            </Box>
          )}
        </Box>
      </Box>

      <Box className="mt-4 px-4">
        <Text size="large" bold className="text-gray-800">Sản phẩm mới</Text>
        <Text size="small" className="text-gray-400">Khám phá các sản phẩm từ Vendure</Text>
      </Box>

      <ProductList />

      <BottomNavigation />
    </Page>
  );
};


export default HomePage;

