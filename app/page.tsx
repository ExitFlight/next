// app/page.tsx
import { Plane, Users, FileText } from "lucide-react";
import { Card, CardContent } from "@/app/_components/Card";
import Image from "next/image";
import { CreateTicketButton } from "@/app/_components/CreateTicketButton"; // Import our new client component

// This is now a Server Component! No "use client" needed.
const Home = () => {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto text-center mb-10 md:mb-16">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
          Generate Flight Tickets Instantly
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Create realistic mock flight tickets with our easy-to-use generator.
          Perfect for presentations and novelty use.
        </p>
        {/* Use the client component for the interactive button */}
        <CreateTicketButton />
      </div>

      {/* Feature Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10 md:mb-16">
        <FeatureCard
          icon={<Plane size={24} />}
          title="Choose Your Flight"
          description="Select from a variety of airlines, routes, and times for your journey."
        />
        <FeatureCard
          icon={<Users size={24} />}
          title="Add Passenger Details"
          description="Enter passenger information for a personalized ticket experience."
        />
        <FeatureCard
          icon={<FileText size={24} />}
          title="Generate & Share"
          description="Instantly create and download your mock ticket."
        />
      </div>

      {/* Image Gallery Section */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-center text-foreground">
          Ready for your journey?
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <GalleryImage
            src="https://images.unsplash.com/photo-1536584754829-12214d404f32?w=500&h=300&auto=format&fit=crop"
            alt="Airplane flying through clouds"
          />
          <GalleryImage
            src="https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=500&h=300&auto=format&fit=crop"
            alt="View from airplane window"
          />
          <GalleryImage
            src="https://images.unsplash.com/photo-1455156218388-5e61b526818b?w=500&h=300&auto=format&fit=crop"
            alt="Snow-capped mountain peak"
          />
          <GalleryImage
            src="https://images.unsplash.com/photo-1573790387438-4da905039392?w=500&h=300&auto=format&fit=crop"
            alt="Tropical island in Indonesia"
          />
        </div>
      </div>
    </div>
  );
};

// Helper components to keep the main component clean
const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <Card className="border-border bg-card">
    <CardContent className="pt-6">
      <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const GalleryImage = ({ src, alt }: { src: string; alt: string }) => (
  <Image
    src={src}
    alt={alt}
    width={500}
    height={300}
    className="rounded-lg w-full h-28 md:h-48 object-cover"
    priority={false} // Only set priority=true for above-the-fold images
  />
);

export default Home;
