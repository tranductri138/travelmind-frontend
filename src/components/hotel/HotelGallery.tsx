import { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ImageWithFallback } from '@/components/common/ImageWithFallback'

interface HotelGalleryProps {
  images: string[]
  hotelName: string
}

export function HotelGallery({ images, hotelName }: HotelGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  if (!images.length) return null

  const showPrev = () => setActiveIndex((i) => (i > 0 ? i - 1 : images.length - 1))
  const showNext = () => setActiveIndex((i) => (i < images.length - 1 ? i + 1 : 0))

  return (
    <>
      <div className="grid grid-cols-4 gap-2 rounded-lg overflow-hidden">
        <div className="col-span-4 md:col-span-2 md:row-span-2">
          <ImageWithFallback
            src={images[0]}
            alt={hotelName}
            className="h-64 md:h-full w-full cursor-pointer"
            onClick={() => { setActiveIndex(0); setLightboxOpen(true) }}
          />
        </div>
        {images.slice(1, 5).map((img, i) => (
          <div key={i} className="hidden md:block">
            <ImageWithFallback
              src={img}
              alt={`${hotelName} ${i + 2}`}
              className="h-full w-full cursor-pointer"
              onClick={() => { setActiveIndex(i + 1); setLightboxOpen(true) }}
            />
          </div>
        ))}
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black/95 border-none">
          <div className="relative flex items-center justify-center min-h-[60vh]">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-white z-10"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="absolute left-2 text-white" onClick={showPrev}>
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <img
              src={images[activeIndex]}
              alt={`${hotelName} ${activeIndex + 1}`}
              className="max-h-[80vh] max-w-full object-contain"
            />
            <Button variant="ghost" size="icon" className="absolute right-2 text-white" onClick={showNext}>
              <ChevronRight className="h-8 w-8" />
            </Button>
            <div className="absolute bottom-4 text-white text-sm">
              {activeIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
