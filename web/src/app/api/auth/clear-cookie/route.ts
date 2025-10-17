import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("auth_token");
    cookieStore.delete("refresh_token");

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ message: "Cookie clear hatası" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}


