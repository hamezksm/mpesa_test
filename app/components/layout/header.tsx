import Link from "next/link";
import Image from "next/image";

const Header = () => {
  return (
    <header className="flex items-center justify-between p-4 bg-green-600 text-white">
      <div className="flex items-center">
        <Image src="/mpesa.svg" alt="MPESA Logo" width={40} height={40} />
        <h1 className="ml-2 text-xl font-bold">MPESA Login</h1>
      </div>
      <nav>
        <ul className="flex space-x-4">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          <li>
            <Link href="/about" className="hover:underline">
              About
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;