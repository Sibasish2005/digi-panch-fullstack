"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api-client";
import Link from "next/link";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

export default function LatestNews() {
  const [newsList, setNewsList] = useState<any[]>([]);

  useEffect(() => {
    async function loadNews() {
      try {
        // Fetch up to 10 latest news items for the horizontal scroll
        const data = await fetchAPI('/news?active_only=true&limit=10');
        if (data) {
          setNewsList(data);
        }
      } catch (e) {
        console.error("Failed to load news from backend, falling back to static data", e);
      }
    }
    loadNews();
  }, []);

  return (
    <section className="w-full bg-white py-20 px-6">

      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Badge className="mb-4 px-4 py-1 text-sm">
            Latest Updates
          </Badge>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-inter text-gray-900">
            News & Announcements
          </h2>

          <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            Stay informed with the latest Panchayat updates,
            AI governance initiatives, citizen services,
            and rural development programs.
          </p>
        </motion.div>

        {/* News Horizontal Scroll */}
        <div className="mt-14 flex overflow-x-auto gap-8 pb-8 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

          {newsList.map((news, index) => (

            <motion.div
              key={news.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
              }}
              viewport={{ once: true }}
              className="min-w-[300px] md:min-w-[350px] lg:min-w-[400px] flex-shrink-0 snap-start"
            >
              <Card className="overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl h-full flex flex-col">

                {/* Image */}
                <div className="relative h-56 w-full overflow-hidden">

                  <Image
                    src={news.image_url || news.image}
                    alt={news.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />

                </div>

                <CardContent className="p-6">

                  {/* Category + Date */}
                  <div className="flex items-center justify-between mb-4">

                    <Badge variant="secondary">
                      {news.category}
                    </Badge>

                    <span className="text-sm text-gray-500">
                      {news.published_date || news.date}
                    </span>

                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-gray-900 font-inter leading-snug">
                    {news.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-3 text-gray-600 text-sm leading-relaxed flex-grow">
                    {news.description}
                  </p>

                  {/* Read More */}
                  <Link href={`/news/${news.id}`} className="mt-5 inline-block text-blue-600 font-medium hover:text-blue-800 transition-colors">
                    Read More →
                  </Link>

                </CardContent>
              </Card>
            </motion.div>

          ))}

        </div>
      </div>
    </section>
  );
}