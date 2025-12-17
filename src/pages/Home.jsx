import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold mb-4">Gurisan Trengkas</h1>
      <p className="mb-6 text-gray-700">
        Aplikasi latihan pengenalan tulisan trengkas untuk pelajar.
      </p>

      <Link
        to="/verify"
        className="px-6 py-3 bg-blue-600 text-white rounded shadow"
      >
        Mula Latihan
      </Link>
    </div>
  );
}
