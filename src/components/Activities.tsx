"use client";

import { useTranslations } from "next-intl";
import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight} from "lucide-react";

export default function Activities() {
  const t = useTranslations("activities");
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  // Autoplay plugin instance ref
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false })
  );

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const handlePrevious = () => {
    api?.scrollPrev();
    plugin.current.reset();
  };

  const handleNext = () => {
    api?.scrollNext();
    plugin.current.reset();
  };

  const activityItems = [
    {
      id: "board_games",
      color: "bg-amber-100",
      image: "🎲",
    },
    {
      id: "rpg",
      color: "bg-indigo-100",
      image: "🐉",
    },
    {
      id: "events",
      color: "bg-rose-100",
      image: "🏆",
    },
    {
      id: "egara",
      color: "bg-emerald-100",
      image: "🎉",
    },
  ];

  return (
    <section id="activities" className="bg-stone-200/50 py-24 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-6">
          <h2 className="mb-6 text-4xl font-bold tracking-tight text-stone-900 md:text-5xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-xl leading-relaxed text-stone-600">
            {t("text")}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-6">
            {activityItems.map((item, index) => {
              const isActive = current === index + 1;
              return (
                <button
                  key={`nav-${item.id}`}
                  onClick={() => {
                    api?.scrollTo(index);
                    plugin.current.reset();
                  }}
                  className={cn(
                    "relative px-4 py-2 rounded-full font-semibold transition-all duration-500 ease-out",
                    isActive 
                      ? "bg-stone-800 text-white scale-115 shadow-xl ring-4 ring-stone-800/10" 
                      : "bg-stone-100 text-stone-500 hover:bg-stone-200 scale-100"
                  )}
                >
                  {t(`items.${item.id}.title`)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mx-auto max-w-6xl">
          <Carousel
            setApi={setApi}
            plugins={[plugin.current]}
            className="w-full relative"
            opts={{
              loop: true,
            }}
          >
            <CarouselContent className="-ml-2 py-4 px-2">
              {activityItems.map((item) => (
                <CarouselItem key={item.id} className="basis-full">
                  <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
                    {/* Image Area (Side) */}
                    <div className="w-full md:w-1/2">
                        <div className={cn("aspect-[4/3] w-full relative overflow-hidden rounded-[2rem] flex items-center justify-center transition-colors duration-500 shadow-lg", item.color)}>
                            <div className="text-[8rem] opacity-40 animate-pulse">
                                {item.image}
                            </div>
                        </div>
                    </div>

                    {/* Content Area (No background, integrated) */}
                    <div className="w-full md:w-1/2 text-left space-y-6">
                      <h3 className="text-4xl md:text-5xl font-bold text-stone-900">
                        {t(`items.${item.id}.title`)}
                      </h3>
                      <div className="h-1.5 w-20 rounded-full bg-stone-300"></div>
                      <p className="text-xl text-stone-600 leading-relaxed">
                        {t(`items.${item.id}.description`)}
                      </p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Arrows - Centered on sides */}
            <button 
              onClick={handlePrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x md:-translate-x p-2 text-stone-800 opacity-10 hover:opacity-80 transition-colors duration-300 z-10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-8 w-8 md:h-12 md:w-12" />
            </button>

            <button 
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x md:translate-x p-2 text-stone-800 opacity-10 hover:opacity-80 transition-colors duration-300 z-10"
              aria-label="Next slide"
            >
              <ChevronRight className="h-8 w-8 md:h-12 md:w-12" />
            </button>
            
          </Carousel>
        </div>
      </div>
    </section>
  );
}
