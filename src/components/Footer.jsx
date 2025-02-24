import { Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full bg-[#1c2128] rounded-lg mt-4 text-gray-300 py-8 px-4">
      {/* Top Section - Security and Payments */}
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-12 h-12 text-green-500" />
            <div>
              <div className="font-bold text-white">100% SAFE</div>
              <div className="text-sm">Protected Connection</div>
              <div className="text-sm">and encrypted data.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Links */}
      <div className="container mx-auto">
        <nav className="flex flex-wrap gap-4 mb-6">
          <Link
            href="/kyc-policy"
            className="hover:text-blue-400 transition-colors"
          >
            KYC Policy
          </Link>
          <Link
            href="/privacy-policy"
            className="hover:text-blue-400 transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/self-exclusion"
            className="hover:text-blue-400 transition-colors"
          >
            Self-Exclusion
          </Link>
          <Link href="/aml" className="hover:text-blue-400 transition-colors">
            AML
          </Link>
          <Link href="/about" className="hover:text-blue-400 transition-colors">
            About
          </Link>
        </nav>

        {/* Legal Text */}
        <div className="text-sm text-gray-400 mb-8 space-y-4">
          <p>
            This website is operated by{" "}
            <Link href="#" className="text-blue-400 hover:underline">
              RAEEN Exchange N.V.
            </Link>
            , registered under No. 155342 at{" "}
            <Link href="#" className="text-blue-400 hover:underline">
              Schottegateweg Zuid 72 A, Curaçao
            </Link>
            . This website is licensed and regulated by{" "}
            <Link href="#" className="text-blue-400 hover:underline">
              Curaçao Gaming
            </Link>
            , license No. 1668/JAZ.
          </p>
          <p>
            In order to register for this website, the user is required to
            accept the General Terms and Conditions. In the event the General
            Terms and Conditions are updated, existing users may choose to
            discontinue using the products and services before the said update
            shall become effective, which is a minimum of two weeks after it has
            been announced.
          </p>
        </div>

        {/* Bottom Navigation */}
        <nav className="flex flex-wrap gap-4 text-sm">
          <Link
            href="/responsible-gambling"
            className="hover:text-blue-400 transition-colors"
          >
            Responsible Gambling
          </Link>
          <Link href="/terms" className="hover:text-blue-400 transition-colors">
            Terms & Conditions
          </Link>
          <Link
            href="/betting-rules"
            className="hover:text-blue-400 transition-colors"
          >
            Betting Rules
          </Link>
          <Link
            href="/dispute"
            className="hover:text-blue-400 transition-colors"
          >
            Dispute Resolution
          </Link>
          <Link
            href="/fairness"
            className="hover:text-blue-400 transition-colors"
          >
            Fairness & RNG Testing Methods
          </Link>
          <Link
            href="/accounts"
            className="hover:text-blue-400 transition-colors"
          >
            Accounts, Payouts and Bonuses
          </Link>
        </nav>
      </div>
    </footer>
  );
}
