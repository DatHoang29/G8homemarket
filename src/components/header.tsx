import { useAtomValue } from "jotai";
import { useLocation, useNavigate } from "react-router-dom";
import {
  categoriesStateUpwrapped,
  loadableUserInfoState,
} from "@/state";
import { useMemo } from "react";
import { useRouteHandle } from "@/hooks";
import { getConfig } from "@/utils/template";
import headerIllus from "@/static/header-illus.svg";
import TransitionLink from "./transition-link";
import { Icon, Text } from "zmp-ui";
import toast from "react-hot-toast";

export default function Header() {
  const categories = useAtomValue(categoriesStateUpwrapped);
  const navigate = useNavigate();
  const location = useLocation();
  const [handle, match] = useRouteHandle();
  const userInfo = useAtomValue(loadableUserInfoState);

  const title = useMemo(() => {
    if (handle) {
      if (typeof handle.title === "function") {
        return handle.title({ categories, params: match.params });
      } else {
        return handle.title;
      }
    }
  }, [handle, categories]);
  console.log({ userInfo });
  const showBack = location.key !== "default" && !handle?.noBack;
  return (
    <div
      className="w-full flex flex-col px-4 bg-primary text-primaryForeground pt-st overflow-hidden bg-no-repeat bg-right-top"
      // style={{
      //   backgroundImage: `url(${headerIllus})`,
      //   paddingTop:
      //     "max(44px, var(--zaui-safe-area-inset-top, env(safe-area-inset-top, 0px)))",
      // }}
    >
      {/* User Greeting Section */}
      {userInfo.state === "hasData" && userInfo.data?.id && (
        <div className="w-full flex items-center space-x-3 py-3 animate-fadeIn">
          <div className="relative">
            <img
              src={userInfo.data.avatar}
              className="w-12 h-12 rounded-full border-2 border-white/30 shadow-lg object-cover"
              alt={userInfo.data.name}
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-primary rounded-full"></div>
          </div>
          <div className="flex flex-col">
            <Text size="xSmall" className="text-white/70 font-medium">Chào bạn,</Text>
            <Text bold className="text-lg text-white leading-tight drop-shadow-sm">
              {userInfo.data.name}
            </Text>
          </div>
        </div>
      )}

      <div className="w-full min-h-12 pr-[90px] flex py-2 space-x-2 items-center">
        {handle?.logo ? (
          <>
            <div
              className="flex-none w-8 h-8 rounded-full overflow-hidden cursor-pointer"
              onClick={() => {
                // Secret logout for testing on mobile: click 3 times
                (window as any)._clickCount = ((window as any)._clickCount || 0) + 1;
                toast(`Click ${(window as any)._clickCount}/3`);
                if ((window as any)._clickCount >= 3) {
                  (window as any)._clickCount = 0;
                  localStorage.clear();
                  toast.success("Đã xóa dữ liệu, đang tải lại...");
                  setTimeout(() => window.location.reload(), 1000);
                }
              }}
            >
              <img
                src={getConfig((c) => c.template.logoUrl)}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center space-x-1">
              <h1 className="text-lg font-bold">
                {getConfig((c) => c.template.shopName)}
              </h1>
            </div>
          </>
        ) : (
          <>
            {showBack && (
              <div
                className="py-1 px-2 cursor-pointer"
                onClick={() => navigate(-1)}
              >
                <Icon icon="zi-arrow-left" />
              </div>
            )}
            <div className="text-xl font-medium truncate">{title}</div>
          </>
        )}
      </div>
    </div>
  );
}
