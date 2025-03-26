"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-black">
      <section className="flex flex-col items-center justify-center flex-grow text-center p-6">
        <h1 className="text-6xl font-extrabold mb-5 text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-800">
          Send Anonymous Messages
        </h1>
        <p className="text-lg text-black max-w-lg mb-6">
          Connect with anyone anonymously. Share your thoughts freely and
          securely.
        </p>
        <Link
          href="/dashboard"
          className="bg-black text-white hover:bg-gray-800 text-lg px-6 py-3 rounded-lg shadow-lg transition-all"
        >
          Get Started
        </Link>
      </section>

      <footer className="bg-gray-300 text-center p-6  mt-6">
        <Card className=" shadow-lg max-w-md mx-auto">
          <CardContent className="p-4">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} AnonChat. All rights reserved.
            </p>
          </CardContent>
        </Card>
      </footer>
    </div>
  );
}
