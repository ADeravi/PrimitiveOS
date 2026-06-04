import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const meta: Meta = { title: "UI/AspectRatio", tags: ["autodocs"] };
export default meta;
type Story = StoryObj;

export const SixteenByNine: Story = {
  render: () => (
    <div className="w-80">
      <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden">
        <img src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80" alt="Photo" className="object-cover w-full h-full" />
      </AspectRatio>
    </div>
  ),
};

export const Square: Story = {
  render: () => (
    <div className="w-48">
      <AspectRatio ratio={1} className="bg-muted rounded-md overflow-hidden">
        <img src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80" alt="Photo" className="object-cover w-full h-full" />
      </AspectRatio>
    </div>
  ),
};
