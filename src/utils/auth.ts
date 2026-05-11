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
        // 1. Lấy Access Token
    const accessToken = await getAccessToken();
    console.log("Access Token:", accessToken);

    // Bước 1: Lấy token từ Zalo SDK
    const { token } = await getPhoneNumber({});
    const finalToken = token && token !== "undefined" ? token : "test-token";

    // Bước 2: Gửi lên Vendure (Bắt buộc dùng Mutation vì đây là GraphQL API)
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

    if (!result) {
      throw new Error("Invalid authentication response");
    }

    // Bước 3: Xử lý kết quả thành công
    if (result.__typename === "CurrentUser") {
      // Lưu session token từ Header để dùng cho các request sau
      const sessionToken = res.headers.get("vendure-auth-token");
      if (sessionToken) {
        localStorage.setItem("vendure_session", sessionToken);
      }
      localStorage.setItem("user_id", result.id);
      return result;
    }

    // Xử lý lỗi từ server
    throw new Error((result as ErrorResult).message || "Authentication failed");
  } catch (error) {
    console.warn("loginWithZalo failed", error);
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