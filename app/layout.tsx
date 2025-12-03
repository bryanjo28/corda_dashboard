// import "./globals.css";
// import Sidebar from "@/components/layout/Sidebar";
// import Header from "@/components/layout/Header";
// import { ToastProvider } from "@/components/toast/ToastProvider";

// export default function RootLayout({ children }: any) {
//   return (
//     <html lang="en">
//       <body>
//         <ToastProvider>
//           <Sidebar />
//           <Header />
//           <main className="ml-64 pt-20">{children}</main>
//         </ToastProvider>
//       </body>
//     </html>
//   );
// }

import "./globals.css";
import { ToastProvider } from "@/components/toast/ToastProvider";

export default function RootLayout({ children }: any) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
