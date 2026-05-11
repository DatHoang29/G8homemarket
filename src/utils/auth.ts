import { getAccessToken, getPhoneNumber } from "zmp-sdk/apis";
import CONFIG from "@/config";

type CurrentUser = {
  id: string;
  identifier?: string;
  __typename: "CurrentUser";
};

type ErrorResult = {
  errorCode: string;
  message: string;
  __typename: "ErrorResult";
};

export async function loginWithZalo() {
  try {
    // 1. Lấy Access Token từ Zalo
    const accessToken = await getAccessToken();
    console.log("Access Token:", accessToken);

    // 2. Lấy Phonenumber Token từ Zalo
    const { token } = await getPhoneNumber({});
    const finalToken = token && token !== "undefined" ? token : "test-phone-token";

    // 3. TODO: Mai sẽ bật đoạn gọi API thật này lên
    // Hiện tại đang giả lập gọi đến Vendure ngrok
    console.log("Đang giả lập gọi API Vendure để lấy session token...");
    
    try {
      const res = await fetch(CONFIG.VENDURE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            mutation {
              authenticate(input: {
                zalo_token: {
                  accessToken: "${accessToken}",
                  encryptedPhoneToken: "${finalToken}"
                }
              }) {
                ... on CurrentUser {
                  id
                  identifier
                }
                ... on ErrorResult {
                  errorCode
                  message
                }
              }
            }
          `,
        }),
      });

      const body = await res.json();
      const result = body?.data?.authenticate as CurrentUser | ErrorResult | undefined;

      if (result && result.__typename === "CurrentUser") {
        const sessionToken = res.headers.get("vendure-auth-token");
        if (sessionToken) {
          localStorage.setItem("vendure_session", sessionToken);
        }
        localStorage.setItem("user_id", result.id);
        return result;
      }
    } catch (e) {
      console.warn("API Vendure chưa sẵn sàng, dùng data giả lập để tiếp tục UI.");
    }

    // Dữ liệu giả lập khi API chưa chạy (Dùng cho ngày hôm nay)
    const mockUser: CurrentUser = {
      id: "mock-user-123",
      identifier: "guest@g8home.vn",
      __typename: "CurrentUser"
    };
    localStorage.setItem("vendure_session", "mock-session-token");
    localStorage.setItem("user_id", mockUser.id);
    
    // Giả lập delay mạng
    await new Promise(r => setTimeout(r, 1000));
    
    return mockUser;

  } catch (error) {
    console.error("loginWithZalo error:", error);
    throw error;
  }
}


// Hàm bổ trợ để gọi các API khác của Vendure sau khi đã login
export async function shopApi(query: string, variables: Record<string, any> = {}) {
  const sessionToken = localStorage.getItem("vendure_session");

  const res = await fetch(CONFIG.VENDURE_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(sessionToken && { "Authorization": `Bearer ${sessionToken}` }),
    },
    body: JSON.stringify({ query, variables }),
  });

  // Kịch bản 3: Token hết hạn (401 Unauthorized)
  if (res.status === 401) {
    localStorage.removeItem("vendure_session");
    localStorage.removeItem("user_id");
    window.location.reload(); // Tải lại để yêu cầu login lại
    throw new Error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
  }

  return res.json();
}