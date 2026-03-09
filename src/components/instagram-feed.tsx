import Image from "next/image";
import { Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { InstagramPost } from "@/lib/api";

interface InstagramFeedProps {
  posts: InstagramPost[];
  instagramUrl?: string;
}

export function InstagramFeed({
  posts,
  instagramUrl = "https://www.instagram.com/encantofloristeria_ecu",
}: InstagramFeedProps) {
  if (posts.length === 0) return null;

  return (
    <section className="py-16 bg-warm-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif mb-3">Síguenos en Instagram</h2>
          <p className="text-foreground-secondary">
            Inspírate con nuestros arreglos más recientes
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-lg overflow-hidden bg-secondary"
            >
              <Image
                src={post.mediaType === "VIDEO" ? (post.thumbnailUrl || post.mediaUrl) : post.mediaUrl}
                alt={post.caption || "Instagram post"}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Instagram className="h-8 w-8 text-white" />
              </div>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <Button variant="outline" size="lg" asChild>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram className="h-5 w-5 mr-2" />
              @encantofloristeria_ecu
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
