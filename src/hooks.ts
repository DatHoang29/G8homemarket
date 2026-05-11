import { useSetAtom } from "jotai";
import { userInfoKeyState, userInfoState } from "@/state";
import { authorize } from "zmp-sdk/apis";
import { loginWithZalo } from "@/utils/auth";
import { useAtomCallback } from "jotai/utils";
import toast from "react-hot-toast";

export function useRequestInformation() {
  const getStoredUserInfo = useAtomCallback(async (get) => {
    const userInfo = await get(userInfoState);
    return userInfo;
  });
  const setInfoKey = useSetAtom(userInfoKeyState);
  const refreshPermissions = () => setInfoKey((key) => key + 1);

  return async () => {
    try {
      // Đảm bảo đã có quyền truy cập thông tin và số điện thoại
      await authorize({
        scopes: ["scope.userInfo", "scope.userPhonenumber"],
      }).catch((err) => {
        // Kịch bản 2: Từ chối cấp quyền
        toast.error("Bạn cần cấp quyền số điện thoại để tiếp tục");
        throw err;
      });
      
      // Thực hiện login với backend Vendure (Gọi API ngrok)
      const result = await loginWithZalo();
      
      // Refresh state để cập nhật UI
      refreshPermissions();
      
      return result;
    } catch (e) {
      console.error("Login process failed:", e);
      throw e;
    }
  };
}
