import { ADMIN_PASSWORD } from "$env/static/private";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request }) => {
  const data = await request.json();
  const password = data.password as string;

  if (password === ADMIN_PASSWORD) {
    return json(
      { success: true },
      {
        status: 200,
        headers: {
          "Set-Cookie": `auth=true; Path=/; Max-Age=86400`,
        },
      },
    );
  } else {
    return json({ success: false, error: "Invalid Password" }, { status: 401 });
  }
};
