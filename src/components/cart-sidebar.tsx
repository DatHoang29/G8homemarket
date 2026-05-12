import React from "react";
import { useAtom, useAtomValue } from "jotai";
import { cartState, cartVisibleState, cartTotalState, useCheckout } from "@/state";
import { Box, Text, Button, Spinner, Sheet, Input, Checkbox } from "zmp-ui";
import { formatPrice } from "@/utils/format";
import { NgrokImage } from "@/components/ngrok-image";
import { shopApi } from "@/utils/auth";
import toast from "react-hot-toast";

const SvgClose = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6l12 12" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const SvgCartEmpty = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#e9e9e9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="3" y1="6" x2="21" y2="6" stroke="#e9e9e9" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16 10a4 4 0 01-8 0" stroke="#e9e9e9" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const SvgDelete = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polyline points="3 6 5 6 21 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
    <path d="M19 6l-1 14H6L5 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 11v6M14 11v6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
    <path d="M9 6V4h6v2" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SvgSummary = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 6h18M16 10a4 4 0 01-8 0" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SvgTruck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="3" width="15" height="13" stroke="#16a34a" strokeWidth="2" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" stroke="#16a34a" strokeWidth="2" />
    <circle cx="5.5" cy="18.5" r="2.5" stroke="#16a34a" strokeWidth="2" />
    <circle cx="18.5" cy="18.5" r="2.5" stroke="#16a34a" strokeWidth="2" />
  </svg>
);

const SvgInvoice = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9h6m-6 4h6" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CartSidebar: React.FC = () => {
  const [visible, setVisible] = useAtom(cartVisibleState);
  const [cart, setCart] = useAtom(cartState);
  const { totalAmount } = useAtomValue(cartTotalState);
  const checkout = useCheckout();
  const [processing, setProcessing] = React.useState(false);
  const [step, setStep] = React.useState<"cart" | "checkout">("cart");

  type CustomerAddress = {
    id: string;
    fullName?: string;
    phoneNumber?: string;
    streetLine1?: string;
    city?: string;
    countryCode?: string;
    country?: {
      code?: string;
      name?: string;
    };
  };

  const [addresses, setAddresses] = React.useState<CustomerAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = React.useState(false);
  const [selectedAddressId, setSelectedAddressId] = React.useState<string | null>(null);
  const [showCreateAddress, setShowCreateAddress] = React.useState(false);

  type ShippingMethod = {
    id: string;
    name: string;
    priceWithTax: number;
  };

  type PaymentMethod = {
    id: string;
    code: string;
    name: string;
  };

  const [shippingMethods, setShippingMethods] = React.useState<ShippingMethod[]>([]);
  const [shippingMethodsLoading, setShippingMethodsLoading] = React.useState(false);
  const [selectedShippingMethodId, setSelectedShippingMethodId] = React.useState<string | null>(null);

  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>([]);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = React.useState(false);
  const [selectedPaymentMethodCode, setSelectedPaymentMethodCode] = React.useState<string | null>(null);

  const getUnitPrice = (product: any) => {
    const p = product?.price;
    if (typeof p === "number") return p;
    if (p && typeof p === "object") {
      return Number(p.min ?? p.value ?? p.max ?? 0);
    }
    return 0;
  };

  const [fullName, setFullName] = React.useState("Nguyễn Văn Khách Hàng");
  const [phoneNumber, setPhoneNumber] = React.useState("0987654321");
  const [streetLine1, setStreetLine1] = React.useState("27 hoàng hoa thám");
  const [city, setCity] = React.useState("Hà Nội");

  // Invoice States
  const [wantInvoice, setWantInvoice] = React.useState(false);
  const [invoiceCompanyName, setInvoiceCompanyName] = React.useState("");
  const [invoiceTaxId, setInvoiceTaxId] = React.useState("");
  const [invoiceEmail, setInvoiceEmail] = React.useState("");
  const [invoiceCompanyAddress, setInvoiceCompanyAddress] = React.useState("");
  const [orderNote, setOrderNote] = React.useState("");

  const selectedAddress = React.useMemo(() => {
    if (!selectedAddressId) return null;
    return addresses.find((a) => a.id === selectedAddressId) || null;
  }, [addresses, selectedAddressId]);

  const selectedShippingMethod = React.useMemo(() => {
    if (!selectedShippingMethodId) return null;
    return shippingMethods.find((m) => m.id === selectedShippingMethodId) || null;
  }, [shippingMethods, selectedShippingMethodId]);

  const shippingFee = Number(selectedShippingMethod?.priceWithTax || 0);
  const finalTotal = totalAmount + shippingFee;

  const loadAddresses = React.useCallback(async () => {
    setAddressesLoading(true);
    try {
      const query = `
        query GetAddresses {
          activeCustomer {
            addresses {
              id
              fullName
              phoneNumber
              streetLine1
              city
              country { code name }
            }
          }
        }
      `;

      const res = await shopApi(query);
      const raw: CustomerAddress[] = res?.data?.activeCustomer?.addresses || [];
      const list: CustomerAddress[] = raw.map((a) => ({
        ...a,
        countryCode: a.countryCode || a.country?.code || "VN",
      }));
      setAddresses(list);

      // Auto-select first address if present
      if (list.length > 0 && !selectedAddressId) {
        setSelectedAddressId(list[0].id);
      }

      // If none, open create form
      if (list.length === 0) {
        setShowCreateAddress(true);
      }
    } catch (e: any) {
      console.warn("Load addresses failed:", e);
      // Fallback mock to let UI continue while API is not ready
      const mock: CustomerAddress[] = [
        {
          id: "mock-address-1",
          fullName: "Khách hàng",
          phoneNumber: "0000000000",
          streetLine1: "120, Phường Phả Lại",
          city: "Chí Linh, Hải Dương",
          countryCode: "VN",
        },
      ];
      setAddresses(mock);
      if (!selectedAddressId) setSelectedAddressId(mock[0].id);
      toast.error(e?.message || "Không tải được danh sách địa chỉ, dùng dữ liệu giả");
    } finally {
      setAddressesLoading(false);
    }
  }, []); // Remove selectedAddressId from here

  React.useEffect(() => {
    if (!visible) return;
    if (step !== "checkout") return;
    loadAddresses();
  }, [visible, step, loadAddresses]);

  const loadShippingMethods = React.useCallback(async () => {
    setShippingMethodsLoading(true);
    try {
      const query = `
        query GetShipping {
          eligibleShippingMethods { id name priceWithTax }
        }
      `;
      const res = await shopApi(query);
      const list: ShippingMethod[] = res?.data?.eligibleShippingMethods || [];
      setShippingMethods(list);
      if (list.length > 0 && !selectedShippingMethodId) {
        setSelectedShippingMethodId(list[0].id);
      }
    } catch (e: any) {
      console.warn("Load shipping methods failed:", e);
      toast.error(e?.message || "Không tải được tuỳ chọn giao hàng");
    } finally {
      setShippingMethodsLoading(false);
    }
  }, []); // Remove selectedShippingMethodId from here

  const loadPaymentMethods = React.useCallback(async () => {
    setPaymentMethodsLoading(true);
    try {
      const query = `
        query GetPayment {
          eligiblePaymentMethods { id code name }
        }
      `;
      const res = await shopApi(query);
      const list: PaymentMethod[] = res?.data?.eligiblePaymentMethods || [];
      setPaymentMethods(list);
      if (list.length > 0 && !selectedPaymentMethodCode) {
        setSelectedPaymentMethodCode(list[0].code);
      }
    } catch (e: any) {
      console.warn("Load payment methods failed:", e);
      toast.error(e?.message || "Không tải được tuỳ chọn thanh toán");
    } finally {
      setPaymentMethodsLoading(false);
    }
  }, []); // Remove selectedPaymentMethodCode

  React.useEffect(() => {
    if (!visible) return;
    if (step !== "checkout") return;
    loadShippingMethods();
    loadPaymentMethods();
  }, [visible, step, loadShippingMethods, loadPaymentMethods]);

  const handleCreateAddress = async () => {
    setProcessing(true);
    try {
      const mutation = `
        mutation CreateAddress($input: CreateAddressInput!) {
          createCustomerAddress(input: $input) {
            id
            fullName
            phoneNumber
            streetLine1
            city
            country { code name }
          }
        }
      `;

      const variables = {
        input: {
          fullName,
          phoneNumber,
          streetLine1,
          city,
          countryCode: "VN",
          defaultShippingAddress: true,
        },
      };

      const res = await shopApi(mutation, variables);
      const createdRaw: CustomerAddress | undefined = res?.data?.createCustomerAddress;
      const created: CustomerAddress | undefined = createdRaw
        ? {
          ...createdRaw,
          countryCode: createdRaw.countryCode || createdRaw.country?.code || "VN",
        }
        : undefined;
      if (!created?.id) {
        throw new Error("Tạo địa chỉ thất bại");
      }

      setAddresses((prev) => [created, ...prev.filter((a) => a.id !== created.id)]);
      setSelectedAddressId(created.id);
      setShowCreateAddress(false);
      toast.success("Đã tạo địa chỉ mới");
    } catch (e: any) {
      console.warn("Create address failed:", e);
      toast.error(e?.message || "Không tạo được địa chỉ");
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckout = async () => {
    setProcessing(true);
    const addr = selectedAddress;
    if (addresses.length > 0 && !addr) {
      toast.error("Vui lòng chọn địa chỉ giao hàng");
      setProcessing(false);
      return;
    }

    if (shippingMethods.length > 0 && !selectedShippingMethodId) {
      toast.error("Vui lòng chọn tuỳ chọn giao hàng");
      setProcessing(false);
      return;
    }

    if (paymentMethods.length > 0 && !selectedPaymentMethodCode) {
      toast.error("Vui lòng chọn phương thức thanh toán");
      setProcessing(false);
      return;
    }

    await checkout({
      fullName: addr?.fullName || fullName,
      phoneNumber: addr?.phoneNumber || phoneNumber,
      streetLine1: addr?.streetLine1 || streetLine1,
      city: addr?.city || city,
      countryCode: addr?.countryCode || "VN",
      shippingMethodId: selectedShippingMethodId || undefined,
      paymentMethodCode: selectedPaymentMethodCode || undefined,
      note: orderNote,
      isCompanyInvoice: wantInvoice,
      invoiceCompanyName: wantInvoice ? invoiceCompanyName : undefined,
      invoiceTaxId: wantInvoice ? invoiceTaxId : undefined,
      invoiceEmail: wantInvoice ? invoiceEmail : undefined,
      invoiceCompanyAddress: wantInvoice ? invoiceCompanyAddress : undefined,
    });
    setProcessing(false);
  };

  const openCheckoutForm = () => {
    setStep("checkout");
  };

  const removeItem = (id: string | number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== id));
  };

  return (
    <Sheet
      visible={visible}
      onClose={() => {
        setVisible(false);
        setStep("cart");
        setShowCreateAddress(false);
      }}
      autoHeight={false}
      height="80vh"
      mask
      handler={false}
      swipeToClose={false}
    >
      <Box className="h-full bg-white rounded-t-3xl flex flex-col p-4">
        {/* Header */}
        <Box className="flex items-center justify-between mb-6">
          <Text size="xLarge" bold className="text-primary">
            {step === "checkout" ? "Tạo đơn hàng" : "Giỏ hàng của bạn"}
          </Text>
          <Button
            variant="tertiary"
            icon={<SvgClose />}
            onClick={() => {
              setVisible(false);
              setStep("cart");
            }}
            className="p-0 min-w-0"
          />
        </Box>

        {/* Content */}
        <Box
          className="flex-1 overflow-y-auto space-y-4 pb-24 overscroll-contain touch-pan-y"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {cart.length === 0 ? (
            <Box className="flex flex-col items-center justify-center h-full space-y-4">
              <SvgCartEmpty />
              <Text className="text-gray-400">Giỏ hàng đang trống</Text>
              <Button
                onClick={() => {
                  setVisible(false);
                  setStep("cart");
                }}
              >
                Tiếp tục mua sắm
              </Button>
            </Box>
          ) : step === "checkout" ? (
            <Box className="space-y-3">
              <Box className="bg-gray-50 p-3 rounded-2xl">
                <Box className="flex items-center justify-between">
                  <Text bold>Địa chỉ nhận hàng</Text>
                  <Button
                    variant="tertiary"
                    size="small"
                    disabled={addressesLoading}
                    onClick={loadAddresses}
                  >
                    {addressesLoading ? "Đang tải..." : "Làm mới"}
                  </Button>
                </Box>

                {addressesLoading ? (
                  <Text size="small" className="text-gray-500 mt-2">Đang tải danh sách địa chỉ...</Text>
                ) : addresses.length === 0 ? (
                  <Text size="small" className="text-orange-500 mt-2">Vui lòng chọn địa chỉ giao hàng</Text>
                ) : (
                  <Box className="mt-2 space-y-2">
                    {addresses.map((a) => {
                      const isSelected = a.id === selectedAddressId;
                      return (
                        <Box
                          key={a.id}
                          onClick={() => setSelectedAddressId(a.id)}
                          className={`p-3 rounded-xl cursor-pointer bg-white border ${isSelected ? "border-primary" : "border-gray-100"}`}
                        >
                          <Text bold className="truncate">
                            {(a.streetLine1 || "") + (a.city ? `, ${a.city}` : "")}
                          </Text>
                          <Text size="small" className="text-gray-500">
                            {(a.fullName || "") + (a.phoneNumber ? ` • ${a.phoneNumber}` : "")}
                          </Text>
                        </Box>
                      );
                    })}
                  </Box>
                )}

                <Box className="mt-3">
                  <Button
                    fullWidth
                    variant="secondary"
                    onClick={() => setShowCreateAddress((v) => !v)}
                  >
                    Thêm địa chỉ giao hàng mới
                  </Button>
                </Box>
              </Box>

              {showCreateAddress && (
                <Box className="space-y-3 max-h-[45vh] overflow-y-auto overscroll-contain pr-1">
                  <Input
                    label="Họ và tên"
                    value={fullName}
                    onChange={(e) => setFullName(e.currentTarget.value)}
                    clearable
                  />
                  <Input
                    label="Số điện thoại"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.currentTarget.value)}
                    type="number"
                    clearable
                  />
                  <Input
                    label="Địa chỉ"
                    value={streetLine1}
                    onChange={(e) => setStreetLine1(e.currentTarget.value)}
                    clearable
                  />
                  <Input
                    label="Thành phố"
                    value={city}
                    onChange={(e) => setCity(e.currentTarget.value)}
                    clearable
                  />
                  <Button
                    fullWidth
                    disabled={processing}
                    onClick={handleCreateAddress}
                  >
                    {processing ? <Spinner /> : "Lưu địa chỉ"}
                  </Button>
                </Box>
              )}

              <Box className="bg-gray-50 p-3 rounded-2xl">
                <Box className="flex items-center justify-between">
                  <Text bold>Tuỳ chọn giao hàng</Text>
                  <Button
                    variant="tertiary"
                    size="small"
                    disabled={shippingMethodsLoading}
                    onClick={loadShippingMethods}
                  >
                    {shippingMethodsLoading ? "Đang tải..." : "Làm mới"}
                  </Button>
                </Box>

                {shippingMethodsLoading ? (
                  <Text size="small" className="text-gray-500 mt-2">Đang tải tuỳ chọn giao hàng...</Text>
                ) : shippingMethods.length === 0 ? (
                  <Text size="small" className="text-orange-500 mt-2">Chưa có tuỳ chọn giao hàng</Text>
                ) : (
                  <Box className="mt-2 space-y-2">
                    {shippingMethods.map((m) => {
                      const isSelected = m.id === selectedShippingMethodId;
                      const price = Number(m.priceWithTax || 0);
                      return (
                        <label
                          key={m.id}
                          className={`block p-3 rounded-xl cursor-pointer bg-white border ${isSelected ? "border-primary" : "border-gray-100"}`}
                        >
                          <Box className="flex items-center justify-between gap-3">
                            <Box className="flex items-center gap-3 min-w-0">
                              <input
                                type="radio"
                                name="shippingMethod"
                                className="accent-primary w-5 h-5 flex-none"
                                checked={isSelected}
                                onChange={() => setSelectedShippingMethodId(m.id)}
                              />
                              <Text bold className="truncate">{m.name}</Text>
                            </Box>
                            <Text size="small" className="text-gray-500 flex-none">
                              {price <= 0 ? "Miễn phí" : formatPrice(price)}
                            </Text>
                          </Box>
                        </label>
                      );
                    })}
                  </Box>
                )}
              </Box>

              <Box className="bg-gray-50 p-3 rounded-2xl">
                <Box className="flex items-center justify-between">
                  <Text bold>Phương thức thanh toán</Text>
                  <Button
                    variant="tertiary"
                    size="small"
                    disabled={paymentMethodsLoading}
                    onClick={loadPaymentMethods}
                  >
                    {paymentMethodsLoading ? "Đang tải..." : "Làm mới"}
                  </Button>
                </Box>

                {paymentMethodsLoading ? (
                  <Text size="small" className="text-gray-500 mt-2">Đang tải phương thức thanh toán...</Text>
                ) : paymentMethods.length === 0 ? (
                  <Text size="small" className="text-orange-500 mt-2">Chưa có phương thức thanh toán</Text>
                ) : (
                  <Box className="mt-2 space-y-2">
                    {paymentMethods.map((m) => {
                      const isSelected = m.code === selectedPaymentMethodCode;
                      return (
                        <label
                          key={m.id}
                          className={`block p-3 rounded-xl cursor-pointer bg-white border ${isSelected ? "border-primary" : "border-gray-100"}`}
                        >
                          <Box className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="paymentMethod"
                              className="accent-primary mt-1 w-5 h-5 flex-none"
                              checked={isSelected}
                              onChange={() => setSelectedPaymentMethodCode(m.code)}
                            />
                            <Box className="min-w-0">
                              <Text bold className="truncate">{m.name}</Text>
                            </Box>
                          </Box>
                        </label>
                      );
                    })}
                  </Box>
                )}
              </Box>

              {/* Xuất hóa đơn (Giống UI mẫu) */}
              <Box className="space-y-3">
                <Box
                  className="flex items-center space-x-2 py-1 px-1"
                  onClick={() => setWantInvoice(!wantInvoice)}
                >
                  <Checkbox checked={wantInvoice} value="wantInvoice" />
                  <Text bold className="text-gray-800">Tôi muốn xuất hóa đơn công ty</Text>
                </Box>

                {wantInvoice && (
                  <Box className="bg-white p-4 rounded-2xl shadow-sm space-y-4 border border-gray-100">
                    <Box className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                      <SvgInvoice />
                      <Text bold className="text-gray-800">Thông tin hóa đơn</Text>
                    </Box>

                    <Box className="space-y-3">
                      <Input
                        label="Tên công ty *"
                        placeholder="Nhập tên công ty"
                        value={invoiceCompanyName}
                        onChange={(e) => setInvoiceCompanyName(e.target.value)}
                      />
                      <Box className="flex space-x-3">
                        <Box className="flex-1">
                          <Input
                            label="Mã số thuế *"
                            placeholder="Mã số thuế"
                            value={invoiceTaxId}
                            onChange={(e) => setInvoiceTaxId(e.target.value)}
                          />
                        </Box>
                        <Box className="flex-1">
                          <Input
                            label="Email nhận hóa đơn *"
                            placeholder="Email"
                            value={invoiceEmail}
                            onChange={(e) => setInvoiceEmail(e.target.value)}
                          />
                        </Box>
                      </Box>
                      <Input
                        label="Địa chỉ xuất hóa đơn *"
                        placeholder="Địa chỉ công ty"
                        value={invoiceCompanyAddress}
                        onChange={(e) => setInvoiceCompanyAddress(e.target.value)}
                      />
                      <Input
                        label="Ghi chú cho đơn hàng"
                        // placeholder="Ví dụ: Giao giờ hành chính..."
                        value={orderNote}
                        onChange={(e) => setOrderNote(e.target.value)}
                      />
                      <Text size="xxxSmall" className="text-orange-500 italic mt-1">
                        * Vui lòng nhập đầy đủ Tên công ty, MST và Email hợp lệ
                      </Text>
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Tóm tắt đơn hàng (Giống UI mẫu) */}
              <Box className="bg-white p-4 rounded-2xl shadow-sm space-y-4 border border-gray-50">
                <Box className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                  <SvgSummary />
                  <Text bold className="text-gray-800">Tóm tắt đơn hàng</Text>
                </Box>

                {/* Delivery Info */}
                <Box className="flex items-center justify-between bg-gray-50/50 p-2 rounded-xl">
                  <Box className="flex items-center space-x-2">
                    <SvgTruck />
                    <Text size="small" bold>Giao hàng tận nơi</Text>
                  </Box>
                  <Text size="xSmall" className="text-gray-400">{cart.length} SP</Text>
                </Box>

                {/* Items List (Simplified) */}
                <Box className="space-y-3">
                  {cart.map((item) => (
                    <Box key={item.product.id} className="flex space-x-3 items-start">
                      <Box className="w-12 h-12 rounded-lg overflow-hidden flex-none border border-gray-100">
                        <NgrokImage src={item.product.image} className="w-full h-full object-cover" alt={item.product.name} />
                      </Box>
                      <Box className="flex-1 min-w-0">
                        <Text size="small" bold className="truncate">{item.product.name}</Text>
                        <Text size="xxxSmall" className="text-gray-400 line-clamp-1">
                          Đơn giá: {formatPrice(getUnitPrice(item.product))}
                        </Text>
                        <Box className="flex justify-between items-baseline mt-1">
                          <Text size="xxxSmall" className="text-gray-400">Số lượng: {item.quantity}</Text>
                          <Text size="small" bold className="text-gray-700">
                            {formatPrice(getUnitPrice(item.product) * item.quantity)}
                          </Text>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>

                {/* Cost Summary */}
                <Box className="pt-3 border-t border-gray-100 space-y-2">
                  <Box className="flex justify-between">
                    <Text size="small" className="text-gray-500">Tổng tiền {cart.length} sản phẩm</Text>
                    <Text size="small" bold>{formatPrice(totalAmount)}</Text>
                  </Box>
                  <Box className="flex justify-between">
                    <Text size="small" className="text-gray-500">Phí giao hàng</Text>
                    <Text size="small" bold className={shippingFee <= 0 ? "text-green-600" : "text-gray-800"}>
                      {shippingFee <= 0 ? "Miễn phí" : formatPrice(shippingFee)}
                    </Text>
                  </Box>
                  <Box className="flex justify-between pt-3 border-t border-gray-100 items-center">
                    <Text bold className="text-gray-800">Tổng thanh toán</Text>
                    <Text bold className="text-orange-600 text-xl">
                      {formatPrice(finalTotal)}
                    </Text>
                  </Box>
                </Box>
              </Box>
            </Box>
          ) : (
            cart.map((item) => (
              <Box key={item.product.id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-2xl">
                <Box className="w-16 h-16 rounded-xl overflow-hidden shadow-sm">
                  <NgrokImage src={item.product.image} className="w-full h-full object-cover" alt={item.product.name} />
                </Box>
                <Box className="flex-1 min-w-0">
                  <Text bold className="truncate">{item.product.name}</Text>
                  <Text size="small" className="text-gray-500">Số lượng: {item.quantity}</Text>
                  <Text size="large" bold className="text-primary">
                    {formatPrice(getUnitPrice(item.product) * item.quantity)}
                  </Text>
                </Box>
                <Button
                  variant="tertiary"
                  icon={<SvgDelete />}
                  onClick={() => removeItem(item.product.id)}
                  className="p-0 min-w-0"
                />
              </Box>
            ))
          )}
        </Box>

        {/* Footer */}
        {cart.length > 0 && (
          <Box className="mt-6 pt-6 border-t border-gray-100 space-y-4">
            <Box className="flex items-center justify-between">
              <Text size="large" className="text-gray-500">Tổng cộng</Text>
              <Text size="xLarge" bold className="text-primary">{formatPrice(totalAmount)}</Text>
            </Box>

            {step === "checkout" ? (
              <Box className="flex space-x-2">
                <Button
                  fullWidth
                  size="large"
                  variant="tertiary"
                  disabled={processing}
                  onClick={() => setStep("cart")}
                >
                  Quay lại
                </Button>
                <Button
                  fullWidth
                  size="large"
                  disabled={processing}
                  className="rounded-xl shadow-lg shadow-primary/20"
                  onClick={handleCheckout}
                >
                  {processing ? <Spinner /> : "Tạo đơn"}
                </Button>
              </Box>
            ) : (
              <Button
                fullWidth
                size="large"
                disabled={processing}
                className="rounded-xl shadow-lg shadow-primary/20"
                onClick={openCheckoutForm}
              >
                {processing ? <Spinner /> : "Thanh toán ngay"}
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Sheet>
  );
};
