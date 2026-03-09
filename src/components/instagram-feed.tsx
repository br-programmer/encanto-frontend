import Image from "next/image";
import { Instagram, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { InstagramPost } from "@/types";

interface InstagramFeedProps {
  instagramUrl?: string;
  limit?: number;
}

export async function InstagramFeed({
  instagramUrl = "https://www.instagram.com/encanto_ecu",
  limit = 6,
}: InstagramFeedProps) {
  let posts: InstagramPost[] = [];

  try {
    const response = await api.instagram.feed({ limit });
    posts = response.result;
  } catch (error) {
    // Silently fail - component will show empty state or not render
    console.warn("Failed to fetch Instagram feed:", error);
  }

  return (
    <section className="py-10 sm:py-16 bg-warm-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="font-serif mb-2 sm:mb-3">Síguenos en Instagram</h2>
          <p className="text-foreground-secondary text-sm sm:text-base">
            Inspírate con nuestros arreglos más recientes
          </p>
        </div>

        {/* Grid - only show if posts exist */}
        {posts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            {posts.map((post) => (
              <a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square rounded-lg overflow-hidden bg-secondary"
              >
                <Image
                  src={post.mediaType === "VIDEO" && post.thumbnailUrl ? post.thumbnailUrl : post.mediaUrl}
                  alt={post.caption || "Post de Instagram"}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                />
                {/* Video indicator */}
                {post.mediaType === "VIDEO" && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center">
                    <Play className="h-3 w-3 text-white fill-white" />
                  </div>
                )}
                {/* Carousel indicator */}
                {post.mediaType === "CAROUSEL_ALBUM" && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center">
                    <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="3" y="3" width="8" height="8" rx="1" />
                      <rect x="13" y="3" width="8" height="8" rx="1" />
                      <rect x="3" y="13" width="8" height="8" rx="1" />
                      <rect x="13" y="13" width="8" height="8" rx="1" />
                    </svg>
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Instagram className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
              </a>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className={posts.length > 0 ? "text-center mt-6 sm:mt-8" : "text-center"}>
          <Button variant="outline" size="lg" className="h-11 sm:h-12" asChild>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram className="h-5 w-5 mr-2" />
              @encanto_ecu
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
