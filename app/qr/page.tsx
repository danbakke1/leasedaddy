import Image from "next/image"
import Link from "next/link"
import { Phone } from "lucide-react"

export default function QrCodePage() {
  const appUrl = "https://v0-lease-daddy-app.vercel.app/" // The URL the QR code points to

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-xl shadow-2xl text-center max-w-md w-full">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-blue-500 to-pink-400 mb-4">
          LeaseDaddy
        </h1>
        <p className="text-slate-600 mb-6 text-lg">Scan the QR code to access the app.</p>
        <div className="mb-8 flex justify-center">
          <Image
            src="/qr-code-leasedaddy.png" // Path to the QR code image in the public folder
            alt="QR Code for LeaseDaddy App"
            width={300} // Adjust size as needed
            height={300} // Adjust size as needed
            className="rounded-lg border-4 border-slate-200 shadow-lg"
            priority // Load the QR code image with high priority
          />
        </div>
        <p className="text-sm text-slate-500 mb-2">This QR code will take you to:</p>
        <Link
          href={appUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 hover:underline break-all text-sm"
        >
          {appUrl}
        </Link>
        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-slate-600 mb-3 text-md font-medium">
            Or, practice negotiating with a tough AI landlord by calling this number:
          </p>
          <a
            href="tel:507-585-4489"
            className="flex items-center justify-center text-2xl font-bold text-blue-600 hover:text-blue-700 hover:underline"
          >
            <Phone className="w-6 h-6 mr-2" />
            507-585-4489
          </a>
          <p className="text-xs text-slate-400 mt-2">(Standard call rates may apply)</p>
        </div>
      </div>
      {/* Optional: A small link back to the main app, styled subtly or removed if truly hidden navigation is desired */}
      {/* <div className="mt-8">
        <Link href="/" className="text-slate-500 hover:text-blue-600 transition-colors flex items-center text-sm">
          <Home className="w-4 h-4 mr-1" /> Go to Homepage
        </Link>
      </div> */}
      <footer className="absolute bottom-4 text-center w-full">
        <p className="text-xs text-slate-400">&copy; {new Date().getFullYear()} LeaseDaddy. For promotional use.</p>
      </footer>
    </div>
  )
}
