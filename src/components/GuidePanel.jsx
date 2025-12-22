export default function GuidePanel() {
  return (
    <div className="p-6 border rounded-lg shadow-lg bg-white">
      <h3 className="text-xl font-bold text-blue-700 mb-4">Panduan Trengkas</h3>
      <p className="mb-3 text-gray-700">
        Sistem Trengkas Pimean 2000 Malaysia menggunakan gurisan untuk mewakili bunyi konsonan.
      </p>
      <ul className="list-disc pl-5 mb-3 text-gray-700">
        <li><strong>Gurisan ke bawah:</strong> t, d, p, b</li>
        <li><strong>Gurisan melintang:</strong> k, g, s, z</li>
        <li><strong>Gurisan ke atas:</strong> m, n, ng, ny</li>
        <li><strong>Gurisan lengkung:</strong> f, v, th</li>
      </ul>
      <p className="text-gray-700">
        <strong>Saiz Gurisan:</strong> Biasa (0.5 cm), Separuh (0.25 cm)
      </p>
    </div>
  );
}
