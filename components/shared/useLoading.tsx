// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation"; // Updated import for App Router
// import NProgress from "nprogress";
// import "nprogress/nprogress.css";

// NProgress.configure({ showSpinner: false, speed: 500 });

// const LoadingBar = () => {
//   const router = useRouter();
//   console.log(router);

//   useEffect(() => {
//     const handleStart = () => NProgress.start();
//     const handleComplete = () => NProgress.done();

//     router.events?.on("routeChangeStart", handleStart);
//     router.events?.on("routeChangeComplete", handleComplete);
//     router.events?.on("routeChangeError", handleComplete);

//     return () => {
//       router.events?.off("routeChangeStart", handleStart);
//       router.events?.off("routeChangeComplete", handleComplete);
//       router.events?.off("routeChangeError", handleComplete);
//     };
//   }, [router]);

//   return null;
// };

// export default LoadingBar;

"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: false, speed: 500 });

const LoadingBar = () => {
  const pathname = usePathname(); // Get current route
  const [prevPath, setPrevPath] = useState(pathname);

  useEffect(() => {
    if (prevPath !== pathname) {
      // Trigger progress bar on route change
      NProgress.start();
      setTimeout(() => NProgress.done(), 500); // Ensure it completes smoothly
      setPrevPath(pathname); // Update the previous path
    }
  }, [pathname, prevPath]);

  return null;
};

export default LoadingBar;
