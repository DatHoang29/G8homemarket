import { atom, useSetAtom } from "jotai";
import {
  atomFamily,
  atomWithRefresh,
  atomWithStorage,
  loadable,
  unwrap,
} from "jotai/utils";
import {
  Cart,
  Category,
  Delivery,
  Location,
  Order,
  OrderStatus,
  Product,
  ShippingAddress,
  Station,
  UserInfo,
} from "@/types";
import { requestWithFallback } from "@/utils/request";
import {
  getLocation,
  getPhoneNumber,
  authorize,
  getSetting,
  getUserInfo,
  getAccessToken,
  showToast
} from "zmp-sdk/apis";
import toast from "react-hot-toast";
import { shopApi } from "./utils/auth";
import { calculateDistance } from "./utils/location";
import { formatDistant } from "./utils/format";
import CONFIG from "./config";

const ADD_TO_CART_TOAST_ID = "add-to-cart";
let addToCartToastTimer: ReturnType<typeof setTimeout> | null = null;
let addToCartPendingCount = 0;
let addToCartLastName = "";

function queueAddToCartToast(productName: string, quantityAdded: number) {
  addToCartPendingCount += Math.max(1, Number(quantityAdded) || 1);
  addToCartLastName = productName || addToCartLastName;

  if (addToCartToastTimer) clearTimeout(addToCartToastTimer);
  addToCartToastTimer = setTimeout(() => {
    const count = addToCartPendingCount;
    const name = addToCartLastName;
    addToCartPendingCount = 0;
    addToCartLastName = "";
    addToCartToastTimer = null;

    const message =
      count <= 1
        ? `Đã thêm ${name || "sản phẩm"} vào giỏ hàng`
        : `Đã thêm ${count} sản phẩm vào giỏ hàng`;

    toast.success(message, { id: ADD_TO_CART_TOAST_ID });
  }, 350);
}

export const userInfoKeyState = atom(0);

export const userInfoState = atom<Promise<UserInfo>>(async (get) => {
  get(userInfoKeyState);
  console.log("Loading user info...");
  // Nếu người dùng đã chỉnh sửa thông tin tài khoản trước đó, sử dụng thông tin đã lưu trữ
  // const savedUserInfo = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_INFO);
  // Phía tích hợp có thể thay đổi logic này thành fetch từ server
  let accessToken = await getAccessToken();
  if (!accessToken) {
    await authorize({
      scopes: ["scope.userInfo"],
    });
    accessToken = await getAccessToken();
  }
  console.log("accessToken:", accessToken);
  // if (savedUserInfo) {
  // return JSON.parse(savedUserInfo);

  const {
    authSetting: {
      "scope.userInfo": grantedUserInfo,
      "scope.userPhonenumber": grantedPhoneNumber,
    },
  } = await getSetting({});
  if (!grantedUserInfo) {
    throw new Error("User has not granted scope.userInfo");
  }
  // Người dùng cho phép truy cập tên và ảnh đại diện
  const { userInfo } = await getUserInfo({});
  const phone =
    grantedPhoneNumber // Người dùng cho phép truy cập số điện thoại
      ? await get(phoneState)
      : "";
  return {
    id: userInfo.id,
    name: userInfo.name,
    avatar: userInfo.avatar,
    phone,
    email: "",
    address: "",
  };
});

export const loadableUserInfoState = loadable(userInfoState);

export const phoneState = atom(async () => {
  let phone = "";
  try {
    const setting = await getSetting({});
    const grantedPhoneNumber = setting.authSetting?.["scope.userPhonenumber"];

    if (!grantedPhoneNumber) {
      await authorize({
        scopes: ["scope.userPhonenumber"],
      });
    }

    const { token } = await getPhoneNumber({});
    console.log("phone token:", token);

    if (!token) {
      throw new Error("Phone token is empty");
    }
    // Phía tích hợp làm theo hướng dẫn tại https://mini.zalo.me/documents/api/getPhoneNumber/ để chuyển đổi token thành số điện thoại người dùng ở server.
    // phone = await decodeToken(token);

    // Các bước bên dưới để demo chức năng, phía tích hợp có thể bỏ đi sau.
    toast(
      "Đã lấy được token chứa số điện thoại người dùng. Phía tích hợp cần decode token này ở server. Giả lập số điện thoại 0912345678...",
      {
        icon: "ℹ",
        duration: 10000,
      }
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
    phone = "0912345678";
    // End demo
  } catch (error) {
    console.warn(error);
  }
  return phone;
});

export const bannersState = atom(() =>
  requestWithFallback<string[]>("/banners", [])
);

export const tabsState = atom(["Tất cả", "Nam", "Nữ", "Trẻ em"]);

export const selectedTabIndexState = atom(0);

export const categoriesState = atom(() =>
  requestWithFallback<Category[]>("/categories", [])
);

export const categoriesStateUpwrapped = unwrap(
  categoriesState,
  (prev) => prev ?? []
);

export const productsState = atom(async (get) => {
  try {
    const categories = await get(categoriesState);

    const query = `
      query GetProducts($options: SearchInput!) {
        search(input: $options) {
          items {
            productId
            productVariantId
            productName
            description
            slug
            priceWithTax {
              ... on PriceRange {
                min
                max
              }
              ... on SinglePrice {
                value
              }
            }
            currencyCode
            inStock
            productAsset {
              preview
            }
          }
          totalItems
        }
      }
    `;

    const variables = {
      options: {
        take: 20,
        skip: 0
      }
    };

    console.log("Fetching products from Vendure...");
    const response = await shopApi(query, variables);
    console.log("Raw Vendure search response:", response);
    const items = response?.data?.search?.items || [];

    return items.map((item: any) => ({
      id: item.productId,
      variantId: item.productVariantId,
      name: item.productName,
      price: item.priceWithTax?.min || item.priceWithTax?.value || item.price?.value || item.price || 0,
      image: (() => {
        const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='45%25' font-size='80' text-anchor='middle' dominant-baseline='middle'%3E%F0%9F%9B%8D%3C/text%3E%3Ctext x='50%25' y='70%25' font-size='24' text-anchor='middle' fill='%239ca3af'%3ESản phẩm%3C/text%3E%3C/svg%3E";
        
        const addNgrokBypass = (url: string) =>
          url.includes("ngrok") ? `${url}${url.includes("?") ? "&" : "?"}ngrok-skip-browser-warning=true` : url;

        const rawPreview = item.productAsset?.preview || "";
        console.log("Raw Preview Path:", rawPreview);
        const preview = rawPreview.replace(/\\/g, "/");
        // Nếu URL đã đầy đủ (http)
        if (preview.startsWith("http")) return addNgrokBypass(preview);
        // Nếu có path tương đối, ghép với base URL
        if (preview) {
          const baseUrl = CONFIG.VENDURE_API.replace("/shop-api", "");
          const fullUrl = `${baseUrl}${preview.startsWith("/") ? "" : "/"}${preview}`;
          return addNgrokBypass(fullUrl);
        }
        // Không có ảnh: dùng placeholder data URI (không cần network)
        return PLACEHOLDER;
      })(),
      detail: item.description,
      category: categories[0] || { id: 1, name: "General", image: "" }, // Fallback category
      // Additional fields if needed
      slug: item.slug,
      inStock: item.inStock
    })) as Product[];

  } catch (error) {
    console.error("Error fetching products:", error);
    // Return empty list or fallback to mock if desired, but here we return empty to show error
    return [];
  }
});


export const flashSaleProductsState = atom((get) => get(productsState));

export const recommendedProductsState = atom((get) => get(productsState));

export const productState = atomFamily((id: string | number) =>
  atom(async (get) => {
    const products = await get(productsState);
    return products.find((product) => product.id === id);
  })
);

export const cartState = atomWithStorage<Cart>("cart", []);

export const cartVisibleState = atom(false);

export const selectedCartItemIdsState = atom<(string | number)[]>([]);

export const cartTotalState = atom((get) => {
  const items = get(cartState);
  console.log("Current cart items:", items);

  const getPrice = (product: any) => {
    if (!product) return 0;
    const p = product.price ?? product.priceWithTax;
    if (typeof p === 'number') return p;
    if (p && typeof p === 'object') {
      const val = Number(p.min ?? p.value ?? p.max ?? 0);
      console.log("Extracted price from object:", p, "=>", val);
      return val;
    }
    const val = Number(p) || 0;
    if (p !== undefined) console.log("Extracted price from fallback:", p, "=>", val);
    return val;
  };

  const totalItems = items.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
  const totalAmount = items.reduce(
    (total, item) => total + getPrice(item.product) * (Number(item.quantity) || 0),
    0
  );

  console.log("Total Items:", totalItems, "Total Amount:", totalAmount);

  return {
    totalItems,
    totalAmount,
  };
});

export const keywordState = atom("");

export const searchResultState = atom(async (get) => {
  const keyword = get(keywordState);
  const products = await get(productsState);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return products.filter((product) =>
    product.name.toLowerCase().includes(keyword.toLowerCase())
  );
});

export const productsByCategoryState = atomFamily((id: String) =>
  atom(async (get) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const products = await get(productsState);
    return products.filter((product) => String(product.category.id) === id);
  })
);

export const stationsState = atom(async () => {
  let location: Location | undefined;
  try {
    const { token } = await getLocation({});
    // Phía tích hợp làm theo hướng dẫn tại https://mini.zalo.me/documents/api/getLocation/ để chuyển đổi token thành thông tin vị trí người dùng ở server.
    // location = await decodeToken(token);

    // Các bước bên dưới để demo chức năng, phía tích hợp có thể bỏ đi sau.
    toast(
      "Đã lấy được token chứa thông tin vị trí người dùng. Phía tích hợp cần decode token này ở server. Giả lập vị trí tại VNG Campus...",
      {
        icon: "ℹ",
        duration: 10000,
      }
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
    location = {
      lat: 10.773756,
      lng: 106.689247,
    };
    // End demo
  } catch (error) {
    console.warn(error);
  }

  const stations = await requestWithFallback<Station[]>("/stations", []);
  const stationsWithDistance = stations.map((station) => ({
    ...station,
    distance: location
      ? formatDistant(
        calculateDistance(
          location.lat,
          location.lng,
          station.location.lat,
          station.location.lng
        )
      )
      : undefined,
  }));

  return stationsWithDistance;
});

export const selectedStationIndexState = atom(0);

export const selectedStationState = atom(async (get) => {
  const index = get(selectedStationIndexState);
  const stations = await get(stationsState);
  return stations[index];
});

export const shippingAddressState = atomWithStorage<
  ShippingAddress | undefined
>(CONFIG.STORAGE_KEYS.SHIPPING_ADDRESS, undefined);

export const ordersState = atomFamily((status: OrderStatus) =>
  atomWithRefresh(async () => {
    // Phía tích hợp thay đổi logic filter server-side nếu cần:
    // const serverSideFilteredData = await requestWithFallback<Order[]>(`/orders?status=${status}`, []);
    const allMockOrders = await requestWithFallback<Order[]>("/orders", []);
    const clientSideFilteredData = allMockOrders.filter(
      (order) => order.status === status
    );
    return clientSideFilteredData;
  })
);

export const deliveryModeState = atomWithStorage<Delivery["type"]>(
  CONFIG.STORAGE_KEYS.DELIVERY,
  "shipping"
);

import { useNavigate } from "react-router-dom";

export const useAddToCart = () => {
  const setCart = useSetAtom(cartState);
  const navigate = useNavigate();

  return async (product: Product, quantity: number = 1) => {
    // Kiểm tra token trước khi cho phép thêm vào giỏ hàng
    const token = localStorage.getItem("zma_token") || localStorage.getItem("vendure_session");
    if (!token) {
      toast.error("Vui lòng đăng nhập để mua sắm");
      navigate("/auth");
      return;
    }
    try {
      const query = `
        mutation AddItem($productVariantId: ID!, $quantity: Int!) {
          addItemToOrder(productVariantId: $productVariantId, quantity: $quantity) {
            __typename
            ... on Order {
              id
              code
              totalWithTax
            }
            ... on ErrorResult {
              errorCode
              message
            }
          }
        }
      `;

      const variables = {
        productVariantId: product.variantId || String(product.id),
        quantity: quantity
      };

      console.log("Adding to Vendure cart:", variables);
      console.log("Product data being added:", product);
      const response = await shopApi(query, variables);
      const result = response?.data?.addItemToOrder;

      if (result?.__typename === "ErrorResult") {
        toast.error(result.message || "Lỗi khi thêm vào giỏ hàng");
        return;
      }

      // Cập nhật local state để UI phản hồi ngay lập tức
      setCart((cart) => {
        const existingItem = cart.find((item) => item.product.id === product.id);
        if (existingItem) {
          return cart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...cart, { product, quantity }];
      });

      queueAddToCartToast(product.name, quantity);

    } catch (error: any) {
      console.error("AddToCart error:", error);
      toast.error(error.message || "Lỗi hệ thống khi thêm giỏ hàng");
    }
  };
};


export const useCheckout = () => {
  const setCart = useSetAtom(cartState);
  const setVisible = useSetAtom(cartVisibleState);
  const navigate = useNavigate();

  return async (input?: {
    fullName?: string;
    phoneNumber?: string;
    streetLine1?: string;
    city?: string;
    countryCode?: string;
    note?: string;
    shippingMethodId?: string;
    paymentMethodCode?: string;
    // Invoice fields
    isCompanyInvoice?: boolean;
    invoiceCompanyName?: string;
    invoiceTaxId?: string;
    invoiceCompanyAddress?: string;
    invoiceEmail?: string;
  }) => {
    // Kiểm tra token trước khi thanh toán
    const token = localStorage.getItem("zma_token") || localStorage.getItem("vendure_session");
    if (!token) {
      toast.error("Vui lòng đăng nhập để thanh toán");
      navigate("/auth");
      return;
    }
    try {
      toast.loading("Đang xử lý thanh toán...", { id: "checkout" });

      // 1. Set Address
      console.log("Checkout Step 1: Setting Address...");
      const setAddressQuery = `
        mutation SetAddress($input: CreateAddressInput!) {
          setOrderShippingAddress(input: $input) {
            __typename
            ... on Order { 
              id 
              shippingAddress {
                fullName
                phoneNumber
                streetLine1
                city
                country
              }
            }
            ... on ErrorResult { errorCode message }
          }
        }
      `;
      const addressVars = {
        input: {
          fullName: (input?.fullName || "Nguyễn Văn Khách Hàng").trim(),
          phoneNumber: (input?.phoneNumber || "0987654321").trim(),
          streetLine1: (input?.streetLine1 || "27 hoàng hoa thám").trim(),
          city: (input?.city || "Hà Nội").trim(),
          countryCode: "VN",
        }
      };
      const addressRes = await shopApi(setAddressQuery, addressVars);
      console.log("Address Result Details:", addressRes?.data?.setOrderShippingAddress);
      if (addressRes?.data?.setOrderShippingAddress?.__typename === "ErrorResult") {
        throw new Error(addressRes.data.setOrderShippingAddress.message);
      }


      // 2. Set Shipping Method
      console.log("Checkout Step 2: Setting Shipping Method...");
      const setShippingQuery = `
        mutation SetShipping($ids: [ID!]!) {
          setOrderShippingMethod(shippingMethodId: $ids) {
            __typename
            ... on Order { 
              id 
              shippingLines {
                shippingMethod {
                  id
                  name
                }
                priceWithTax
              }
            }
            ... on ErrorResult { errorCode message }
          }
        }
      `;
      const shippingRes = await shopApi(setShippingQuery, { ids: [input?.shippingMethodId || "2"] });
      console.log("Shipping Result Details:", shippingRes?.data?.setOrderShippingMethod);
      if (shippingRes?.data?.setOrderShippingMethod?.__typename === "ErrorResult") {
        throw new Error(shippingRes.data.setOrderShippingMethod.message);
      }

      // 3. Set Custom Fields (Ghi chú & Hóa đơn)
      if (input?.note || input?.isCompanyInvoice) {
        console.log("Checkout Step 3: Setting Custom Fields...");
        const setCustomFieldsQuery = `
          mutation SetOrderCustomFields($input: UpdateOrderInput!) {
            setOrderCustomFields(input: $input) {
              __typename
              ... on Order { 
                id 
                customFields { 
                  customerNote 
                  isCompanyInvoice 
                  invoiceCompanyName 
                  invoiceTaxId 
                  invoiceCompanyAddress 
                  invoiceEmail 
                } 
              }
              ... on ErrorResult { errorCode message }
            }
          }
        `;
        const customFieldsVars = {
          input: {
            customFields: {
              customerNote: input?.note || undefined,
              isCompanyInvoice: !!input?.isCompanyInvoice,
              invoiceCompanyName: input?.invoiceCompanyName || undefined,
              invoiceTaxId: input?.invoiceTaxId || undefined,
              invoiceCompanyAddress: input?.invoiceCompanyAddress || undefined,
              invoiceEmail: input?.invoiceEmail || undefined,
            }
          }
        };
        const cfRes = await shopApi(setCustomFieldsQuery, customFieldsVars);
        console.log("Custom Fields Result Details:", cfRes?.data?.setOrderCustomFields);
      }

      // 4. Transition to ArrangingPayment (Bước cuối cùng theo yêu cầu)
      console.log("Checkout Step 4 (Final): Transitioning to ArrangingPayment...");
      const transitionQuery = `
        mutation TransitionState($state: String!) {
          transitionOrderToState(state: $state) {
            __typename
            ... on Order { id state }
            ... on ErrorResult { errorCode message }
          }
        }
      `;
      const transitionRes = await shopApi(transitionQuery, { state: "ArrangingPayment" });
      console.log("Transition Result:", transitionRes);
      if (transitionRes?.data?.transitionOrderToState?.__typename === "ErrorResult") {
        throw new Error(transitionRes.data.transitionOrderToState.message);
      }


      // 5. Add Payment
      console.log("Checkout Step 5: Adding Payment...");
      const addPaymentQuery = `
        mutation AddPayment($input: PaymentInput!) {
          addPaymentToOrder(input: $input) {
            __typename
            ... on Order {
              id
              code
              state
              totalWithTax
            }
            ... on ErrorResult { errorCode message }
          }
        }
      `;
      const paymentVars = {
        input: {
          method: input?.paymentMethodCode || "manual-payment-cod",
          metadata: {
            note: "Khách thanh toán trực tiếp tại quầy"
          }
        }
      };
      const paymentRes = await shopApi(addPaymentQuery, paymentVars);
      console.log("Payment Result:", paymentRes);
      const paymentData = paymentRes?.data?.addPaymentToOrder;
      if (paymentData?.__typename === "ErrorResult") {
        throw new Error(paymentData.message);
      }

      // Success
      console.log("Checkout Complete!");
      toast.success("Tạo đơn hàng thành công!", { id: "checkout" });

      setCart([]); // Xóa giỏ hàng
      setVisible(false); // Đóng sidebar

    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Lỗi thanh toán", { id: "checkout" });
    }
  };
};
