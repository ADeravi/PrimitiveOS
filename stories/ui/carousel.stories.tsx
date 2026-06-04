import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

const meta: Meta = { title: "UI/Carousel", tags: ["autodocs"], parameters: { layout: "padded" } };
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Carousel className="w-full max-w-sm mx-auto">
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, i) => (
          <CarouselItem key={i}>
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="text-4xl font-semibold">{i + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
};

export const BasisThird: Story = {
  render: () => (
    <Carousel className="w-full max-w-sm mx-auto">
      <CarouselContent>
        {Array.from({ length: 9 }).map((_, i) => (
          <CarouselItem key={i} className="basis-1/3">
            <Card><CardContent className="flex aspect-square items-center justify-center p-2"><span className="text-xl font-semibold">{i + 1}</span></CardContent></Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
};
