import React from "react";
import { Page, Box, Text } from "zmp-ui";
import { ProductList } from "@/components/product/list";
import { useAtomValue, useSetAtom } from "jotai";
import { cartTotalState, cartVisibleState } from "@/state";
import { useNavigate } from "react-router-dom";
import { BottomNavigation } from "@/components/bottom-navigation";
import { CartSidebar } from "@/components/cart-sidebar";

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 21V12h6v9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CartIcon = ({ color = "#52b361", size = 28 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 10a4 4 0 01-8 0" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HomePage: React.FC = () => {
  const { totalItems } = useAtomValue(cartTotalState);
  const setCartVisible = useSetAtom(cartVisibleState);
  const navigate = useNavigate();

  return (
    <Page className="bg-gray-50 pb-20">
      <Box className="bg-white p-4 sticky top-0 z-[100] flex items-center justify-between shadow-sm">
        <Box className="flex items-center space-x-2">
          <Box className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <HomeIcon />
          </Box>
          <Box>
            <Text size="large" bold className="text-primary">G8 Home Market</Text>
            <Text size="xSmall" className="text-gray-400">Mua sắm thông minh</Text>
          </Box>
        </Box>
      </Box>

      <Box className="mt-4 px-4 flex items-center justify-between">
        <Box>
          <Text size="large" bold className="text-gray-800">Sản phẩm mới</Text>
          <Text size="small" className="text-gray-400">Khám phá các sản phẩm từ Vendure</Text>
        </Box>
        <Box 
          className="relative w-12 h-12 flex items-center justify-center bg-primary/10 rounded-full cursor-pointer"
          onClick={() => setCartVisible(true)}
        >
          <CartIcon color="var(--primary)" size={28} />
          {totalItems > 0 && (
            <Box className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white pointer-events-none">
              {totalItems}
            </Box>
          )}
        </Box>
      </Box>

      <ProductList />

      <BottomNavigation />
      <CartSidebar />
    </Page>
  );
};

export default HomePage;
