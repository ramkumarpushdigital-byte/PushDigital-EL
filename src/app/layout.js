import "./globals.css";

export const metadata = {
  title: "Push Digital || EL",
  description: "Electro Lunminecent",
  icons: {
    icon: "/icon.png",
  },

};

export default function RootLayout({ children }) {
  return (
    <html lang="en">

      <body>
        {children}
      </body>
    </html>
  );
}
