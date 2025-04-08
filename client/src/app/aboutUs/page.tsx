"use client";

import React from "react";
import Image, { StaticImageData } from "next/image";
import { Linkedin } from "lucide-react";

import profile from "../../../public/profile.png";
import sbm from "../../../public/sbm.jpg";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white p-8 flex flex-col items-center">
      {/* Header Section */}
      <h1 className="text-5xl font-bold text-center mt-12">About Us</h1>
      <p className="mt-4 text-lg text-center max-w-3xl text-gray-600 dark:text-gray-300">
        This website is your all-in-one platform for organizing events, managing savings, and collaborating efficiently.
        Our mission is to simplify planning and coordination, making life easier for individuals, teams, and businesses.
      </p>

      {/* Meet Our Team Section */}
      <section className="mt-16 text-center">
        <h2 className="text-4xl font-bold">Meet Our Team</h2>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Developer */}
          <TeamMemberCard
            image={sbm}
            name="Sebastian Bastida Marin"
            role="Developer"
            description="Sebastian is the sole developer behind this website, ensuring smooth performance and great features."
            linkedin="https://www.linkedin.com/in/sebastian-bastida/"
          />
        </div>
      </section>

    </div>
  );
};

/* Team Member Card Component */
const TeamMemberCard = ({ 
  image, 
  name, 
  role, 
  description, 
  linkedin 
}: { 
  image: StaticImageData | string; 
  name: string; 
  role: string; 
  description: string; 
  linkedin?: string;
}) => (
  <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
    <Image src={image} alt={name} width={120} height={120} className="rounded-full mx-auto mb-4" />
    <h3 className="text-xl font-semibold">{name}</h3>
    <p className="text-gray-500 dark:text-gray-400">{role}</p>
    <p className="mt-2 text-gray-600 dark:text-gray-300">{description}</p>

    {/* LinkedIn Icon (Shown Only If `linkedin` Exists) */}
    {linkedin && (
      <a 
        href={linkedin} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="inline-block mt-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition"
      >
        <Linkedin size={30} />
      </a>
    )}
  </div>
);

export default AboutPage;
