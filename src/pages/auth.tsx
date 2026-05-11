import React, { useState } from "react";
import { Page, Button, Text, Box, Icon, Spinner } from "zmp-ui";
import { useRequestInformation } from "@/hooks";
import logo from "@/static/g8_logo.png"; // I will move the generated logo to this path
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AuthPage: React.FC = () => {
  const requestInfo = useRequestInformation();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const user = await requestInfo();
      console.log({user})
      if (user) {
        toast.success("Đăng nhập thành công!");
        // Navigate to a profile or home if needed, but for now we stay here or show success
      }
    } catch (error: any) {
      toast.error(error.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page className="flex flex-col h-screen bg-white">
      <Box className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
        <Box className="w-32 h-32 rounded-3xl overflow-hidden shadow-2xl animate-fade-in">
          <img src={logo} alt="G8 Market Logo" className="w-full h-full object-cover" />
        </Box>

        <Box className="text-center space-y-2">
          <Text size="xLarge" bold className="text-primary">
            G8 Market
          </Text>
          <Text size="large" className="text-gray-500">
            Trải nghiệm mua sắm đẳng cấp
          </Text>
        </Box>

        <Box className="w-full space-y-4 pt-8">
          <Button
            fullWidth
            size="large"
            onClick={handleLogin}
            disabled={loading}
            className="rounded-xl h-14 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <Spinner />
            ) : (
              <>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM16.4839 15.1118C16.4839 15.1118 16.4839 15.1118 16.4839 15.1119C16.3262 15.6599 15.8239 16.0371 15.263 16.0371C15.1091 16.0371 14.9546 16.0076 14.8055 15.9472C13.5684 15.4475 11.5369 15.4475 10.2998 15.9472C10.0031 16.0673 9.68069 16.0645 9.38711 15.9402C9.09353 15.8159 8.87103 15.5869 8.76104 15.2917C8.61864 14.9103 8.75168 14.4752 9.07923 14.2372C10.5192 13.1908 11.2392 12.0108 11.2392 10.6971C11.2392 10.1343 11.0028 9.59688 10.5828 9.20818C10.1627 8.81948 9.59379 8.61314 9.00693 8.61314C7.7904 8.61314 6.80413 9.54719 6.80413 10.6971C6.80413 11.1343 6.94098 11.5472 7.17282 11.8901C7.30967 12.0959 7.30967 12.3587 7.17282 12.5645C7.03597 12.7702 6.78333 12.8731 6.53597 12.8273C6.11492 12.753 5.71491 12.5759 5.3886 12.313C5.06229 12.0501 4.82334 11.7129 4.6986 11.3358C4.52491 10.8101 4.52491 10.2515 4.6986 9.72583C4.94597 8.98308 5.43018 8.35165 6.07923 7.92594C6.72828 7.50022 7.50828 7.30594 8.2998 7.37165C9.5398 7.47451 10.6512 8.01736 11.4112 8.89165C11.6059 9.11451 11.8941 9.24594 12.2 9.24594C12.5059 9.24594 12.7941 9.11451 12.9888 8.89165C13.7488 8.01736 14.8602 7.47451 16.1002 7.37165C16.8917 7.30594 17.6717 7.50022 18.3208 7.92594C18.9698 8.35165 19.454 8.98308 19.7014 9.72583C19.8751 10.2515 19.8751 10.8101 19.7014 11.3358C19.5767 11.7129 19.3377 12.0501 19.0114 12.313C18.6851 12.5759 18.2851 12.753 17.864 12.8273C17.6167 12.8731 17.364 12.7702 17.2272 12.5645C17.0903 12.3587 17.0903 12.0959 17.2272 11.8901C17.459 11.5472 17.5959 11.1343 17.5959 10.6971C17.5959 9.54719 16.6096 8.61314 15.3931 8.61314C14.8062 8.61314 14.2373 8.81948 13.8172 9.20818C13.3972 9.59688 13.1608 10.1343 13.1608 10.6971C13.1608 12.0108 13.8808 13.1908 15.3208 14.2372C15.6483 14.4752 15.7814 14.9103 15.639 15.2917C15.529 15.5869 15.3065 15.8159 15.0129 15.9402C14.7193 16.0645 14.3969 16.0673 14.1002 15.9472C13.3333 15.6385 12.5039 15.4851 11.6667 15.4947C10.8294 15.5042 10.0031 15.6766 9.23197 16.0028C9.08285 16.0632 8.92842 16.0927 8.77451 16.0927C8.21356 16.0927 7.71128 15.7155 7.55357 15.1675C7.40424 14.6461 7.69741 14.107 8.21357 13.9472C9.33333 13.6015 10.5186 13.4347 11.7039 13.4547C12.8892 13.4747 14.0533 13.6811 15.1481 14.0645C15.6642 14.2243 15.9574 14.7634 15.8081 15.2848C15.7661 15.4312 15.6946 15.5658 15.5991 15.6814L16.4839 15.1118Z" fill="white"/>
                </svg>
                <Text bold>Đăng nhập với Zalo</Text>
              </>
            )}
          </Button>

          <Text size="small" className="text-center text-gray-400 px-4">
            Bằng cách đăng nhập, bạn đồng ý với các điều khoản và chính sách của G8 Market.
          </Text>
        </Box>
      </Box>

      <Box className="p-8 text-center">
        <Text size="xSmall" className="text-gray-300">
          Powered by Epacific
        </Text>
      </Box>
    </Page>
  );
};

export default AuthPage;
