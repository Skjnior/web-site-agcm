export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Barre tricolore */}
      <div className="fixed top-0 left-0 right-0 h-3 flex">
        <div className="flex-1 bg-guinea-red" />
        <div className="flex-1 bg-guinea-yellow" />
        <div className="flex-1 bg-guinea-green" />
      </div>

      <div className="max-w-4xl mx-auto mt-12 space-y-6">
        <h1 className="text-4xl font-bold text-center text-guinea-red mb-8">
          Test Couleurs Guinéennes 🇬🇳
        </h1>

        {/* Card Rouge */}
        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-guinea-red">
          <h2 className="text-2xl font-bold text-guinea-red">Rouge Guinéen</h2>
          <p className="text-gray-600 mt-2">#DC143C - Couleur principale</p>
        </div>

        {/* Card Jaune */}
        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-guinea-yellow">
          <h2 className="text-2xl font-bold text-guinea-yellow">Jaune Guinéen</h2>
          <p className="text-gray-600 mt-2">#FFD700 - Couleur secondaire</p>
        </div>

        {/* Card Vert */}
        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-guinea-green">
          <h2 className="text-2xl font-bold text-guinea-green">Vert Guinéen</h2>
          <p className="text-gray-600 mt-2">#228B22 - Couleur accent</p>
        </div>

        {/* Boutons */}
        <div className="flex gap-4 justify-center">
          <button className="px-6 py-3 bg-guinea-red text-white rounded-lg font-semibold hover:bg-opacity-90">
            Bouton Rouge
          </button>
          <button className="px-6 py-3 bg-guinea-yellow text-gray-900 rounded-lg font-semibold hover:bg-opacity-90">
            Bouton Jaune
          </button>
          <button className="px-6 py-3 bg-guinea-green text-white rounded-lg font-semibold hover:bg-opacity-90">
            Bouton Vert
          </button>
        </div>
      </div>
    </div>
  );
}