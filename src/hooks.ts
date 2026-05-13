import { useMatches } from "react-router-dom";
import { useSetAtom } from "jotai";
import { userInfoKeyState } from "@/state";
import api, { getLocation } from "zmp-sdk";
import { loginWithZalo } from "@/utils/auth";
import toast from "react-hot-toast";

export function useRouteHandle() {
  const matches = useMatches();
  const match = matches[matches.length - 1] || {};
  return [match.handle || {}, match] as any;
}

export function useRequestInformation() {
  const setInfoKey = useSetAtom(userInfoKeyState);
  const refreshPermissions = () => setInfoKey((key) => key + 1);

  return async () => {
    const zmp = (window as any).zmp || api;
    try {
      // Đợt 1: Xin quyền thông tin cá nhân và số điện thoại (tối đa 2 quyền)
      await zmp.authorize({
        scopes: ["scope.userInfo", "scope.userPhonenumber"],
      });

      // Lấy vị trí user qua bản đồ sau khi đã được cấp quyền
      let tokenLocation: string = "";
      try {
        // Đợt 2: Xin quyền vị trí riêng biệt trước khi mở bản đồ
        await zmp
          .authorize({
            scopes: ["scope.userLocation"],
          })
          .catch((err) => {
            console.error("Authorize Location Error:", err);
            throw new Error(
              `Lỗi xin quyền vị trí: ${err.message || JSON.stringify(err)}`,
            );
          });
        const locationRes = await getLocation();
        tokenLocation = locationRes.token ?? "";
        console.log("Location Token obtained:", tokenLocation);
        
      } catch (locationErr: any) {
        console.warn("Location Step Failed:", locationErr);
        toast.error(locationErr.message || "Bạn chưa chọn địa chỉ");
      }

      try {
        // Thực hiện login với backend Vendure (Gọi API ngrok)
        const result = await loginWithZalo(tokenLocation);
        toast.dismiss("login-loading");

        // Refresh state để cập nhật UI
        refreshPermissions();
        return result;
      } catch (error: any) {
        toast.dismiss("login-loading");
        toast.error(
          `Đăng nhập thất bại: ${error.message || "Vui lòng thử lại"}`,
        );
        throw error;
      }
    } catch (e) {
      console.error("Login process failed:", e);
      toast.dismiss("login-loading");
      throw e;
    }
  };
}
