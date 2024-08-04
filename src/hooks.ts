import { redirect, type Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  const { cookies, url } = event;
  const auth = cookies.get("auth");

  if (url.pathname.startsWith("/admin") && !auth) {
    throw redirect(302, "/auth");
  }

  return resolve(event);
};
