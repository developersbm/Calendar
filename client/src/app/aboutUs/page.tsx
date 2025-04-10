"use client";

import React from "react";
import Image, { StaticImageData } from "next/image";
import { Linkedin } from "lucide-react";
import { useAppSelector } from "@/app/redux";

import profile from "../../../public/profile.png";
import sbm from "../../../public/sbm.jpg";
import name2 from "../../../public/name2.png";
import name1 from "../../../public/name1.png";

const AboutPage = () => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white p-8 flex flex-col items-center">
      {/* Header Section */}
      <h1 className="text-5xl font-bold text-center mt-12">About Us</h1>
      <p className="mt-4 text-lg text-center max-w-3xl text-gray-600 dark:text-gray-300">
        This website is your all-in-one platform for organizing events, managing savings, and collaborating efficiently.
        Our mission is to simplify planning and coordination, making life easier for individuals, teams, and businesses.
      </p>

      <section className="mt-16 w-full max-w-4xl mx-auto text-center">
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:max-w-3xl mx-auto">
          <TeamMemberCard
            image={sbm}
            name="Sebastian Bastida Marin"
            role="Co-Founder & Software Developer & DevOps Engineer"
            description="Led the end-to-end development of the Timely application, architecting both frontend and backend functionalities. He managed feature implementation, and integration of AI-powered tools, while coordinating with cloud computing services to ensure a smooth development workflow. His contributions shaped the app's user experience, scalability, and overall technical direction."
            linkedin="https://www.linkedin.com/in/sebastian-bastida/"
          />
          <TeamMemberCard
            image={profile}
            name={isDarkMode ? name1 : name2}
            role="Co-Founder & Chief Strategy & Development Officer (CSDO)"
            description="Led the strategic planning and operational development of the Timely application. He managed the product roadmap, budgeting, and resource allocation, while supervising a team of interns to support daily operations. He collaborated closely with developers to align user needs with business goals, helping shape the platform's core functionality, growth strategy, and overall user experience."
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
  name: string | StaticImageData; 
  role: string; 
  description: string; 
  linkedin?: string;
}) => (
  <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
    <Image src={image} alt={typeof name === 'string' ? name : 'Team Member'} width={120} height={120} className="rounded-full mx-auto mb-4" />
    {typeof name === 'string' ? (
      <h3 className="text-xl font-semibold">{name}</h3>
    ) : (
      <Image src={name} alt="Team Member Name" width={200} height={40} className="mx-auto mb-2" />
    )}
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
