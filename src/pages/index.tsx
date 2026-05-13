import React from "react";
import { Page, Box, Text, Button, Sheet, Icon } from "zmp-ui";
import api from "zmp-sdk";
import { ProductList } from "@/components/product/list";
import { useAtomValue, useSetAtom, useAtom } from "jotai";
import {
  cartTotalState,
  cartVisibleState,
  authSheetVisibleState,
  userLocationState,
  userAddressState,
  userAddressDetailState,
  fetchAddressFromCoords
} from "@/state";
import { BottomNavigation } from "@/components/bottom-navigation";
import { CartSidebar } from "@/components/cart-sidebar";
import { useRequestInformation } from "@/hooks";
import toast from "react-hot-toast";

const HomePage: React.FC = () => {
  const { totalItems } = useAtomValue(cartTotalState);
  const setCartVisible = useSetAtom(cartVisibleState);
  const requestInfo = useRequestInformation();
  const [authLoading, setAuthLoading] = React.useState(false);
  const [sheetVisible, setSheetVisible] = useAtom(authSheetVisibleState);

  const location = useAtomValue(userLocationState);
  const setAddress = useSetAtom(userAddressState);
  const setAddressDetail = useSetAtom(userAddressDetailState);

  // useEffect tự động lấy địa chỉ khi có tọa độ mới
  React.useEffect(() => {
    const updateAddress = async () => {
      if (location.latitude && location.longitude) {
        console.log("Location:", location);
        const geoData = await fetchAddressFromCoords(location.latitude, location.longitude);
        if (geoData && geoData.display_name) {
          setAddress(geoData.display_name);
          localStorage.setItem("user_address", geoData.display_name);

          if (geoData.address) {
            setAddressDetail(geoData.address);
            localStorage.setItem("user_address_detail", JSON.stringify(geoData.address));
          }
        }
      }
    };
    updateAddress();
  }, [location.latitude, location.longitude, setAddress, setAddressDetail]);

  const handleLogin = React.useCallback(async () => {
    if (authLoading) return;
    setAuthLoading(true);
    try {
      await requestInfo();
      // Nếu login thành công, tự động đóng sheet
      setSheetVisible(false);
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setAuthLoading(false);
    }
  }, [requestInfo, authLoading]);

  return (
    <Page className="bg-gray-50 pb-20">
      <Box className="bg-white p-4 pt-st sticky top-0 z-[100] flex items-center justify-between shadow-sm">
        <Box className="flex items-center space-x-2">
          <Box
            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center cursor-pointer active:scale-95 transition-transform overflow-hidden shadow-sm"
            onClick={() => {
              // Secret logout for testing on mobile: click 3 times
              window._clickCount = (window._clickCount || 0) + 1;
              toast(`Click ${window._clickCount}/3`);
              if (window._clickCount >= 3) {
                window._clickCount = 0;
                localStorage.clear();
                toast.success("Đã xóa dữ liệu, đang tải lại...");
                setTimeout(() => window.location.reload(), 1000);
              }
            }}
          >
            <img
              src="https://images.weserv.nl/?url=thietbidieng8.com/userfile/config/Logo.png"
              alt="G8 Logo"
              className="w-full h-full object-contain p-1"
            />
          </Box>
          <Box>
            <Text size="large" bold className="text-primary">G8 Home</Text>
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

      <Sheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        mask
        handler
        swipeToClose
      >
        <Box className="flex flex-col items-center p-6 text-center bg-white rounded-t-3xl">
          {/* Logo Illustration */}
          <Box className="w-full aspect-video flex items-center justify-center mb-6">
            <img
              src="https://images.weserv.nl/?url=thietbidieng8.com/userfile/config/Logo.png"
              alt="G8 Home Logo"
              className="w-48 h-auto object-contain animate-fade-in"
            />
          </Box>

          <Text size="xLarge" bold className="text-gray-900 mb-6 px-4">
            Chào mừng bạn đến với G8 Home!
          </Text>

          {/* Features List */}
          <Box className="w-full space-y-4 mb-8">
            <Box className="flex items-center space-x-4 text-left px-2">
              <Box className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Icon icon="zi-check-circle" className="text-blue-500" size={20} />
              </Box>
              <Text size="normal" className="text-gray-700 font-medium">Mua sắm thông minh & tiện lợi</Text>
            </Box>
            <Box className="flex items-center space-x-4 text-left px-2">
              <Box className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Icon icon="zi-check-circle" className="text-blue-500" size={20} />
              </Box>
              <Text size="normal" className="text-gray-700 font-medium">Sản phẩm chính hãng, chất lượng</Text>
            </Box>
            <Box className="flex items-center space-x-4 text-left px-2">
              <Box className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Icon icon="zi-check-circle" className="text-blue-500" size={20} />
              </Box>
              <Text size="normal" className="text-gray-700 font-medium">Giao hàng nhanh & tin cậy</Text>
            </Box>
          </Box>

          <Text size="xSmall" className="text-gray-400 mb-8 px-6 leading-relaxed">
            Vui lòng đồng ý chia sẻ số điện thoại để liên kết với tài khoản của bạn trên hệ thống G8 Home.
          </Text>

          <Box className="w-full space-y-4 pb-8">
            <Button
              fullWidth
              size="large"
              onClick={handleLogin}
              loading={authLoading}
              className="rounded-full h-14 bg-primary text-white font-bold text-lg shadow-lg"
            >
              Liên kết số điện thoại
            </Button>

            <Box
              className="py-2 cursor-pointer"
              onClick={() => {
                api.closeApp().catch(() => {
                  toast("Không thể thoát ứng dụng lúc này");
                });
              }}
            >
              <Text size="small" className="text-red-500 font-bold">Từ chối và Thoát</Text>
            </Box>
          </Box>
        </Box>
      </Sheet>

      <BottomNavigation />
      <CartSidebar />
    </Page>
  );
};

export default HomePage;


const CartIcon = ({ color = "#F26522", size = 28 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 10a4 4 0 01-8 0" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);