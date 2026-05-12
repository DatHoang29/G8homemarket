import React, { useState } from "react";
import { Page, Button, Text, Box, Icon, Spinner } from "zmp-ui";
import { useRequestInformation } from "@/hooks";
import logo from "@/static/g8_logo.png"; // I will move the generated logo to this path
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { BottomNavigation } from "@/components/bottom-navigation";

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
        navigate("/");
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
        <Box className="w-32 h-32 rounded-3xl overflow-hidden shadow-2xl animate-fade-in flex items-center justify-center bg-primary">
          <img 
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%2316a34a'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial, sans-serif' font-weight='bold' font-size='40' text-anchor='middle' dominant-baseline='middle' fill='white'%3EG8%3C/text%3E%3C/svg%3E" 
            alt="G8 Home Market Logo" 
            className="w-full h-full object-cover" 
          />
        </Box>

        <Box className="text-center space-y-2">
          <Text size="xLarge" bold className="text-primary">
            G8 Home Market
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
            className="rounded-xl h-14 flex items-center justify-center"
          >
            {loading ? <Spinner /> : "Đăng nhập với Zalo"}
          </Button>

          <Text size="small" className="text-center text-gray-400 px-4">
            Bằng cách đăng nhập, bạn đồng ý với các điều khoản và chính sách của G8 Home Market.
          </Text>
        </Box>
      </Box>

      <Box className="p-8 text-center">
        <Text size="xSmall" className="text-gray-300">
          Powered by Epacific
        </Text>
      </Box>
      <BottomNavigation />
    </Page>

  );
};

export default AuthPage;
