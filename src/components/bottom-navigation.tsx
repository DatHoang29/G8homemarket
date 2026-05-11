import React from "react";
import { Box, Icon, Text } from "zmp-ui";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

export const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = location.pathname;

  return (
    <Box className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around z-50">
      <Box 
        className={`flex flex-col items-center cursor-pointer ${activeTab === "/" ? "text-primary" : "text-gray-400"}`}
        onClick={() => navigate("/")}
      >
        <Icon icon="zi-home" size={24} />
        <Text size="xxxSmall" bold={activeTab === "/"}>Trang chủ</Text>
      </Box>
      <Box 
        className="flex flex-col items-center text-gray-400 cursor-pointer"
        onClick={() => {
          toast("Tính năng Danh mục sắp ra mắt!");
        }}
      >
        <Icon icon="zi-more-grid" size={24} />
        <Text size="xxxSmall">Danh mục</Text>
      </Box>
      <Box 
        className={`flex flex-col items-center cursor-pointer ${activeTab === "/auth" ? "text-primary" : "text-gray-400"}`}
        onClick={() => navigate("/auth")}
      >
        <Icon icon="zi-user" size={24} />
        <Text size="xxxSmall" bold={activeTab === "/auth"}>Cá nhân</Text>
      </Box>
    </Box>
  );
};
