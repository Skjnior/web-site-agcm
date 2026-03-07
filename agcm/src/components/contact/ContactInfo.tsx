export default function ContactInfo() {
  const contactInfo = {
    address: 'Commune de Matoto, Conakry, Guinée',
    phone: '+224 25-58-72',
    email: 'contact@agcm-guinee.org',
  };

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white border rounded-xl p-6">
            <div className="text-sm text-gray-500">Adresse</div>
            <div className="font-semibold text-gray-900">{contactInfo.address}</div>
          </div>
          <div className="bg-white border rounded-xl p-6">
            <div className="text-sm text-gray-500">Téléphone</div>
            <a href={`tel:${contactInfo.phone}`} className="font-semibold text-guinea-red">
              {contactInfo.phone}
            </a>
          </div>
          <div className="bg-white border rounded-xl p-6">
            <div className="text-sm text-gray-500">Email</div>
            <a href={`mailto:${contactInfo.email}`} className="font-semibold text-guinea-red">
              {contactInfo.email}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
