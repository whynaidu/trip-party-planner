import './globals.css';

export const metadata = {
  title: 'HDFC Trip Party Planner 🎉',
  description: 'Tell us your food & drink vibe for the HDFC trip',
};

export const viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
