import React from "react";
import { Box, Text } from "zmp-ui";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const SvgHome = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke={active ? "#52b361" : "#a9adb2"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 21V12h6v9" stroke={active ? "#52b361" : "#a9adb2"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SvgGrid = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="7" height="7" rx="1" stroke="#a9adb2" strokeWidth="2"/>
    <rect x="14" y="3" width="7" height="7" rx="1" stroke="#a9adb2" strokeWidth="2"/>
    <rect x="3" y="14" width="7" height="7" rx="1" stroke="#a9adb2" strokeWidth="2"/>
    <rect x="14" y="14" width="7" height="7" rx="1" stroke="#a9adb2" strokeWidth="2"/>
  </svg>
);

const SvgUser = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" stroke={active ? "#52b361" : "#a9adb2"} strokeWidth="2"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={active ? "#52b361" : "#a9adb2"} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

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
        <SvgHome active={activeTab === "/"} />
        <Text size="xxxSmall" bold={activeTab === "/"}>Trang chủ</Text>
      </Box>
      <Box 
        className="flex flex-col items-center text-gray-400 cursor-pointer"
        onClick={() => {
          toast("Tính năng Danh mục sắp ra mắt!");
        }}
      >
        <SvgGrid />
        <Text size="xxxSmall">Danh mục</Text>
      </Box>
      <Box 
        className={`flex flex-col items-center cursor-pointer ${activeTab === "/auth" ? "text-primary" : "text-gray-400"}`}
        onClick={() => navigate("/auth")}
      >
        <SvgUser active={activeTab === "/auth"} />
        <Text size="xxxSmall" bold={activeTab === "/auth"}>Cá nhân</Text>
      </Box>
    </Box>
  );
};
