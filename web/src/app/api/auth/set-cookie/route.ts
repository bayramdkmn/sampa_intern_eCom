import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { access_token, refresh_token } = await request.json();

    if (!access_token) {
      return new Response(JSON.stringify({ message: "access_token gerekli" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const cookieStore = await cookies();

    cookieStore.set({
      name: "auth_token",
      value: access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    if (refresh_token) {
      cookieStore.set({
        name: "refresh_token",
        value: refresh_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ message: "Cookie set hatası" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}


