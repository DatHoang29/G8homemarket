import { getAccessToken, getPhoneNumber, authorize } from "zmp-sdk/apis";
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

function isValidSdkToken(token: unknown): token is string {
  if (typeof token !== "string") return false;
  const normalized = token.trim();
  if (!normalized) return false;
  if (normalized === "undefined") return false;
  if (normalized === "null") return false;
  return true;
}

export async function loginWithZalo() {
  try {
    const inZaloEnv =
      typeof window !== "undefined" && Boolean((window as any).ZJSBridge);

    // 1. Lấy Access Token từ Zalo
    let accessToken = await getAccessToken();
    if (!accessToken)
      accessToken = "752658f5d13832475dec8a4f0d3c70bfc0df56cee3915c44c6b0ba12059065cf";
    if (!accessToken) {
      console.log("No access token, requesting authorization...");
      await authorize({ scopes: ["scope.userInfo"] });
      accessToken = await getAccessToken();
    }
    console.log("Access Token:", accessToken ? "YES" : "NO");

    // 2. Lấy Phonenumber Token từ Zalo
    const DEFAULT_ENCRYPTED_PHONE_TOKEN =
      "zfpLJ9_AHb3RilniXTb5AC2X_sJbrNPRtwUqUAtkTc7DjknxlkbsIyAsqbsnwdPjoRBeMgh6JrVNZkXpjT1sTTURmKRiqs9wqOlyU-FJPNc1cy92kkjb3iIp_nIc-rWldOl_O-FMOYUVY_ys-FvCTeQBwpBam4CEXftmCVdjLt62fVz6_kmzNvwqfqNiwWDRdRQ9U-pgBL_Ij9bDxEizKzIqYN-dwJf0n9k2Twdh9LFBjRzZzEarTS-taMkpwpLzYhMHHR3gDN69je5Wk-ioNzgOXKQzwnjXq9wZUApL04IHYPb6y_anSPwnbbR-mmjrZx62IRBf67tCjQiyiEWn2DArWZUpnZKkrBMh2Rd0DYhBilGpji5j3ukTzoFtmaCNXPpt8_V1H1o9YkmxiVal1CYmx2Fsmbi3b9p2F-NVImETXzOWelLb79-fmGgdztKgdwl_EARqPZh4XC49_znR4uo3qGMpt7KJmeFHF_lqS6J9tDD_YOiQM-xVYqA0c051sxkkKPVlQaRsaUr7aEHQMjsbttda_KHbSZ1P";

    let phoneToken: string | undefined;
    try {
      const res = await getPhoneNumber({});
      phoneToken = res?.token;
    } catch (e) {
      console.warn("getPhoneNumber failed:", e);
    }

    // Nếu token không có/không hợp lệ thì xin quyền + retry (chỉ khi đang ở Zalo)
    if (!isValidSdkToken(phoneToken) && inZaloEnv) {
      try {
        console.log("No phone token, requesting authorization...");
        await authorize({ scopes: ["scope.userPhonenumber"] });
        const retry = await getPhoneNumber({});
        phoneToken = retry?.token;
      } catch (e) {
        console.warn("authorize/getPhoneNumber retry failed:", e);
      }
    }

    const usingFallback = !isValidSdkToken(phoneToken);
    console.log({ inZaloEnv, phoneTokenValid: !usingFallback, usingFallback });

    const finalToken = isValidSdkToken(phoneToken)
      ? phoneToken
      : DEFAULT_ENCRYPTED_PHONE_TOKEN;
    console.log(
      "Phone token:",
      isValidSdkToken(phoneToken) ? "YES" : "NO (fallback)"
    );
    console.log(
      "encryptedPhoneToken source:",
      usingFallback ? "DEFAULT_ENCRYPTED_PHONE_TOKEN" : "SDK",
      "len:",
      typeof finalToken === "string" ? finalToken.length : 0
    );

    // 3. TODO: Mai sẽ bật đoạn gọi API thật này lên
    // Hiện tại đang giả lập gọi đến Vendure ngrok
    console.log("Đang giả lập gọi API Vendure để lấy session token...");

    try {
      const res = await fetch(CONFIG.VENDURE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            mutation Authenticate($accessToken: String!, $encryptedPhoneToken: String!) {
              authenticate(
                input: {
                  zalo_token: { accessToken: $accessToken, encryptedPhoneToken: $encryptedPhoneToken }
                }
              ) {
                __typename
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
          variables: {
            accessToken,
            encryptedPhoneToken: finalToken,
          },
        }),
      });

      const body = await res.json();
      if (!res.ok) {
        console.warn("Authenticate HTTP status:", res.status);
      }
      if (body?.errors?.length) {
        console.error("Authenticate GraphQL errors:", body.errors);
      }
      const result = body?.data?.authenticate as CurrentUser | ErrorResult | undefined;
      console.log({ authenticateTypename: (result as any)?.__typename, result });
      if (result && result.__typename === "CurrentUser") {
        console.log("Authentication successful, saving tokens...");
        // Lưu ZMA Access Token để dùng cho các request sau
        localStorage.setItem("zma_token", accessToken || "");

        const sessionToken = res.headers.get("vendure-auth-token");
        if (sessionToken) {
          console.log("Saving vendure_session:", sessionToken);
          localStorage.setItem("vendure_session", sessionToken);
        }
        localStorage.setItem("user_id", result.id);
        return result;
      } else {
        console.warn("Authentication response was not CurrentUser:", result);
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
    console.log("Using mock data, saving zma_token:", accessToken);
    localStorage.setItem("zma_token", accessToken || "752658f5d13832475dec8a4f0d3c70bfc0df56cee3915c44c6b0ba12059065cf"); // Vẫn lưu token ZMA giả lập
    // localStorage.setItem("vendure_session", "mock-session-token");
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
  const zmaToken = localStorage.getItem("zma_token");
  const sessionToken = localStorage.getItem("vendure_session");

  console.log("Calling shopApi | ZMA Token:", zmaToken ? "YES" : "NO", "| Session Token:", sessionToken ? "YES" : "NO");

  const res = await fetch(CONFIG.VENDURE_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Luôn gửi Zalo Access Token (lấy sau khi đăng nhập) làm Bearer token
      ...(sessionToken && { "Authorization": `Bearer ${sessionToken}` }),
      // Kèm theo Vendure session token nếu có
      // ...(sessionToken && { "vendure-auth-token": sessionToken }),
    },
    body: JSON.stringify({ query, variables }),
  });

  // Kịch bản 3: Token hết hạn (401 Unauthorized)
  if (res.status === 401) {
    console.warn("Token expired or unauthorized. Clearing session.");
    localStorage.removeItem("vendure_session");
    localStorage.removeItem("user_id");
    // window.location.reload(); // Tải lại để yêu cầu login lại
    throw new Error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
  }

  // Đã loại bỏ logic tự động cập nhật session token để giữ đúng token từ bước Auth


  const result = await res.json();
  if (result.errors) {
    console.error("GraphQL Errors:", result.errors);
    throw new Error(result.errors[0]?.message || "Lỗi API");
  }
  return result;
}