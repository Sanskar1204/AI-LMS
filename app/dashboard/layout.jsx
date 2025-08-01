 
import React from "react";
import SideBar from "./_components/SideBar";
import DashboardHeader from "./_components/DashboardHeader"; 
import CourseCountProvider from "../_Context/CourseCountContext";

const DashboardLayout = ({ children }) => { 
  return (
    <CourseCountProvider>


      
    <div className="flex h-screen">
 
      <aside className="md:w-64  hidden md:block fixed h-screen">
        <SideBar />
      </aside> 
      <div className="flex flex-col  md:ml-64 flex-1">
   
        <header>
          <DashboardHeader />
        </header> 
        <main className="flex-1 p-6 bg-gray-100">{children}</main>
      </div>
      </div>
    </CourseCountProvider>
  );
};

export default DashboardLayout;
