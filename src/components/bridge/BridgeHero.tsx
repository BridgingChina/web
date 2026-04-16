'use client';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import type { BridgeImage } from '@/api/types';

export function BridgeHero({ images, name, bridgeType }: { images: BridgeImage[]; name: string; bridgeType: string }) {
  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-[16/7] items-center justify-center rounded-md bg-muted text-muted-foreground">
        <p className="text-sm">暂无图片（{bridgeType}）</p>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <figure className="overflow-hidden rounded-md">
        <img src={images[0].url} alt={images[0].caption || name} className="aspect-[16/7] w-full object-cover" />
        {images[0].caption && <figcaption className="mt-1 text-xs text-muted-foreground">{images[0].caption}</figcaption>}
      </figure>
    );
  }

  return (
    <Carousel className="w-full">
      <CarouselContent>
        {images.map((img, i) => (
          <CarouselItem key={i}>
            <figure className="overflow-hidden rounded-md">
              <img src={img.url} alt={img.caption || name} className="aspect-[16/7] w-full object-cover" />
              {img.caption && <figcaption className="mt-1 text-xs text-muted-foreground">{img.caption}</figcaption>}
            </figure>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
