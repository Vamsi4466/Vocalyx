import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/appwrite";
import { getDemoAccountId } from "@/lib/actions/user.actions";
import { DEMO_SESSION_COOKIE } from "@/lib/constants";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirect") || "/";

  try {
    const { users } = await createAdminClient();
    const demoAccountId = await getDemoAccountId();

    const session = await users.createSession(demoAccountId);

    const response = NextResponse.redirect(new URL(redirectTo, request.url));

    response.cookies.set(DEMO_SESSION_COOKIE, session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: false,
    });

    return response;
  } catch (error) {
    console.error("Demo login failed:", error);
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }
}
