'use client'

import { useState } from 'react'
import { createVendor } from '@/app/actions/vendors'
import { VendorType } from '@prisma/client'

export default function CreateVendorForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      const result = await createVendor(formData)
      if (result.success) {
        setIsOpen(false)
        // Reset form
        const form = document.getElementById('create-vendor-form') as HTMLFormElement
        form?.reset()
      } else {
        alert(result.error || 'שגיאה ביצירת הספק')
      }
    } catch (error) {
      alert('שגיאה ביצירת הספק')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary"
      >
        ספק חדש
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">ספק חדש</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form id="create-vendor-form" action={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">שם הספק *</label>
            <input
              name="name"
              type="text"
              required
              className="form-input"
              placeholder="שם החברה או הספק"
            />
          </div>

          <div>
            <label className="form-label">סוג הספק *</label>
            <select name="type" required className="form-select">
              <option value="">בחר סוג ספק</option>
              <option value={VendorType.BAND}>להקה</option>
              <option value={VendorType.SOUND}>סאונד</option>
              <option value={VendorType.LIGHTING}>תאורה</option>
              <option value={VendorType.OTHER}>אחר</option>
            </select>
          </div>

          <div>
            <label className="form-label">איש קשר</label>
            <input
              name="contact"
              type="text"
              className="form-input"
              placeholder="שם איש הקשר"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">טלפון</label>
              <input
                name="phone"
                type="tel"
                className="form-input"
                placeholder="050-1234567"
              />
            </div>

            <div>
              <label className="form-label">אימייל</label>
              <input
                name="email"
                type="email"
                className="form-input"
                placeholder="vendor@example.com"
              />
            </div>
          </div>

          <div>
            <label className="form-label">תעריפים ברירת מחדל</label>
            <textarea
              name="defaultRates"
              className="form-input"
              rows={3}
              placeholder="מיקסר + רמקולים: 1500 ₪, תאורה בסיסית: 800 ₪..."
            />
          </div>

          <div>
            <label className="form-label">תנאי תשלום</label>
            <textarea
              name="terms"
              className="form-input"
              rows={2}
              placeholder="תשלום מראש, ביום האירוע..."
            />
          </div>

          <div>
            <label className="form-label">קישור למסמכים</label>
            <input
              name="documentsUrl"
              type="url"
              className="form-input"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="form-label">דירוג (1-5)</label>
            <select name="rating" className="form-select">
              <option value="">ללא דירוג</option>
              <option value="1">1 ⭐</option>
              <option value="2">2 ⭐⭐</option>
              <option value="3">3 ⭐⭐⭐</option>
              <option value="4">4 ⭐⭐⭐⭐</option>
              <option value="5">5 ⭐⭐⭐⭐⭐</option>
            </select>
          </div>

          <div>
            <label className="form-label">הערות</label>
            <textarea
              name="notes"
              className="form-input"
              rows={3}
              placeholder="הערות כלליות על הספק..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary flex-1"
            >
              {isSubmitting ? 'שמירה...' : 'שמירה'}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn btn-secondary"
            >
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}