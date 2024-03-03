import { authMiddleware } from "@clerk/nextjs";
 
export default authMiddleware({
  ignoredRoutes: ["/api/webhooks", "/signin", "/signup"],
});
 
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};