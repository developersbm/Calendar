"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetAuthUserQuery, useGetUserQuery, useGetTemplatesByUserQuery } from "@/state/api";
import Image from "next/image";
import { ChevronUp, ChevronDown, Trash2, PlusCircle } from "lucide-react";

const TemplateScreen = () => {
  const router = useRouter();
  const { data: authData } = useGetAuthUserQuery({});
  let userId = authData?.user.userId;

  const { data: user } = useGetUserQuery(userId ?? "", {
    skip: !userId,
  });

  const { data: templates } = useGetTemplatesByUserQuery(userId ?? "", {
    skip: !userId,
  });

  const [expandedTemplates, setExpandedTemplates] = useState<Record<number, boolean>>({});

  const toggleTemplate = (templateId: number) => {
    setExpandedTemplates((prev) => ({
      ...prev,
      [templateId]: !prev[templateId],
    }));
  };

  return (
    <div className="container mx-auto p-6 dark:bg-black dark:text-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Your Templates</h1>
        <button
          onClick={() => router.push("/add-template")}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" /> Add Template
        </button>
      </div>

      {templates?.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">You have no templates.</p>
      ) : (
        templates?.map((template) => (
          <div key={template.id} className="border rounded-lg p-4 mb-4 shadow-md bg-white dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">{template.title}</h2>
              <button
                onClick={() => toggleTemplate(template.id)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
                aria-label={`Toggle details for ${template.title}`}
              >
                {expandedTemplates[template.id] ? (
                  <ChevronUp className="h-5 w-5 text-gray-800 dark:text-gray-100" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-800 dark:text-gray-100" />
                )}
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{template.description}</p>

            {expandedTemplates[template.id] && (
              <div>
                <h3 className="text-lg font-medium mb-2">Details:</h3>
                <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm text-gray-800 dark:text-white overflow-x-auto">
                  {JSON.stringify(template.elements, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default TemplateScreen;