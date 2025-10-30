import CheckOutComponent from "@/components/CheckOutComponent";
import { serverApi } from "@/services/ServerApi";
import { Metadata } from "next";
import { cookies } from "next/headers";

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

export const metadata: Metadata = {
  title: "Sampa Connect - Checkout",
  description:
    "Güvenli ödeme ile siparişinizi tamamlayın. Hızlı ve güvenli checkout süreci.",
  keywords: ["checkout", "ödeme", "sipariş", "sampa connect", "e-ticaret"],
  openGraph: {
    title: "Sampa Connect - Checkout",
    description: "Güvenli ödeme ile siparişinizi tamamlayın.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CheckOutPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let userAddresses: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let userCards: any[] = [];
  let cartItems: OrderItem[] = [];

  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token");

    if (authToken) {
      try {
        userAddresses = await serverApi.getAddresses();
      } catch (err) {
        console.error("Error fetching addresses:", err);
      }

      try {
        userCards = await serverApi.getPaymentCards();
      } catch (err) {
        console.error("Error fetching payment cards:", err);
      }

      try {
        const cartData = await serverApi.getCartItems();

        if (Array.isArray(cartData)) {
          cartItems = cartData.map((item: any) => ({
            id: item.product_id || item.id,
            name:
              item.product_name || item.name || item.product?.name || "Ürün",
            quantity: item.quantity || 1,
            price: item.price || item.product?.price || 0,
          }));
        } else if (cartData && typeof cartData === "object") {
          const cartObj = cartData as any;
          const items =
            cartObj.items || cartObj.products || cartObj.cart_items || [];
          if (Array.isArray(items)) {
            cartItems = items.map((item: any) => ({
              id: item.product_id || item.id,
              name:
                item.product_name || item.name || item.product?.name || "Ürün",
              quantity: item.quantity || 1,
              price: item.price || item.product?.price || 0,
            }));
          } else {
            cartItems = [];
          }
        } else {
          cartItems = [];
        }
      } catch (err) {
        console.error("Error fetching cart items:", err);
        cartItems = [];
      }
    } else {
      cartItems = [];
    }
  } catch (err) {
    console.error("Checkout page error:", err);
    cartItems = [];
  }

  return (
    <CheckOutComponent
      initialOrderItems={cartItems}
      userAddresses={userAddresses}
      userCards={userCards}
    />
  );
}
