"use client"
import { useParams } from "next/navigation";
import GroupCalendarComponent from "@/components/GroupCalendarComponent/page";

const GroupCalendarScreen = () => {
  const params = useParams();
  const groupId = params?.groupId;

  if (!groupId) return <p>Loading...</p>;

  return (
    <div className="h-[130vh]">
      <div className="flex justify-center items-center">
        <GroupCalendarComponent groupId={Number(groupId)} />
      </div>
    </div>
  );
};

export default GroupCalendarScreen;