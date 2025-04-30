import Provider from "./providers/SessionProvider";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Onyx Dry Cleaners",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* <NoSsr> */}
          <Provider>{children}</Provider>
        {/* </NoSsr> */}
      </body> 
    </html>
  );
}