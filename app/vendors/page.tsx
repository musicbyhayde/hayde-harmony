import { getVendors } from '@/app/actions/vendors'
import CreateVendorForm from '@/components/CreateVendorForm'

export default async function VendorsPage() {
  const vendors = await getVendors()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ספקים</h1>
          <p className="text-gray-600 mt-2">ניהול ספקים ונותני שירותים</p>
        </div>
        <CreateVendorForm />
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.length > 0 ? (
          vendors.map((vendor) => (
            <div key={vendor.id} className="card">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
                  <span className={`status-badge ${getVendorTypeClass(vendor.type)}`}>
                    {getVendorTypeText(vendor.type)}
                  </span>
                </div>
                {vendor.rating && (
                  <div className="flex items-center">
                    <span className="text-yellow-500">{'⭐'.repeat(vendor.rating)}</span>
                    <span className="text-sm text-gray-500 mr-1">({vendor.rating})</span>
                  </div>
                )}
              </div>

              {vendor.contact && (
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">איש קשר:</span> {vendor.contact}
                </p>
              )}

              {vendor.phone && (
                <p className="text-sm text-gray-600 mb-2">
                  📞 {vendor.phone}
                </p>
              )}

              {vendor.email && (
                <p className="text-sm text-gray-600 mb-2">
                  ✉️ {vendor.email}
                </p>
              )}

              {vendor.defaultRates && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-1">תעריפים:</p>
                  <p className="text-sm text-gray-600">{vendor.defaultRates}</p>
                </div>
              )}

              {vendor.terms && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700 mb-1">תנאי תשלום:</p>
                  <p className="text-sm text-gray-600">{vendor.terms}</p>
                </div>
              )}

              {vendor.notes && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700 mb-1">הערות:</p>
                  <p className="text-sm text-gray-600">{vendor.notes}</p>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <button className="text-sm btn btn-secondary flex-1">
                  עריכה
                </button>
                {vendor.documentsUrl && (
                  <a
                    href={vendor.documentsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm btn btn-secondary"
                  >
                    מסמכים
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🏢</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">אין ספקים</h3>
              <p className="text-gray-500 mb-4">הוסף ספקים כדי לנהל את רשת השירותים שלך</p>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      {vendors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">🏢</span>
                </div>
              </div>
              <div className="mr-4">
                <p className="text-sm text-gray-500">סה״כ ספקים</p>
                <p className="text-2xl font-semibold text-gray-900">{vendors.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">🎵</span>
                </div>
              </div>
              <div className="mr-4">
                <p className="text-sm text-gray-500">להקות</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {vendors.filter(v => v.type === 'BAND').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">🔊</span>
                </div>
              </div>
              <div className="mr-4">
                <p className="text-sm text-gray-500">סאונד</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {vendors.filter(v => v.type === 'SOUND').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">💡</span>
                </div>
              </div>
              <div className="mr-4">
                <p className="text-sm text-gray-500">תאורה</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {vendors.filter(v => v.type === 'LIGHTING').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function getVendorTypeClass(type: string) {
  switch (type) {
    case 'BAND': return 'bg-green-100 text-green-800'
    case 'SOUND': return 'bg-purple-100 text-purple-800'
    case 'LIGHTING': return 'bg-yellow-100 text-yellow-800'
    case 'OTHER': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getVendorTypeText(type: string) {
  switch (type) {
    case 'BAND': return 'להקה'
    case 'SOUND': return 'סאונד'
    case 'LIGHTING': return 'תאורה'
    case 'OTHER': return 'אחר'
    default: return type
  }
}