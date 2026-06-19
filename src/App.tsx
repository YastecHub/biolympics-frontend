import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { PageSkeleton } from "@/components/Skeletons";

// Route-level code splitting for fast first load on mobile.
const Home = lazy(() => import("@/pages/Home"));
const Live = lazy(() => import("@/pages/Live"));
const Fixtures = lazy(() => import("@/pages/Fixtures"));
const Schedule = lazy(() => import("@/pages/Schedule"));
const Results = lazy(() => import("@/pages/Results"));
const Sports = lazy(() => import("@/pages/Sports"));
const SportDetail = lazy(() => import("@/pages/SportDetail"));
const Departments = lazy(() => import("@/pages/Departments"));
const DepartmentDetail = lazy(() => import("@/pages/DepartmentDetail"));
const Standings = lazy(() => import("@/pages/Standings"));
const MedalTable = lazy(() => import("@/pages/MedalTable"));
const Announcements = lazy(() => import("@/pages/Announcements"));
const FixtureDetail = lazy(() => import("@/pages/FixtureDetail"));
const AdminLogin = lazy(() => import("@/pages/admin/Login"));
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const NotFound = lazy(() => import("@/pages/NotFound"));

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/live" element={<Live />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/fixtures" element={<Fixtures />} />
          <Route path="/results" element={<Results />} />
          <Route path="/sports" element={<Sports />} />
          <Route path="/sports/:slug/matches/:matchId" element={<SportDetail />} />
          <Route path="/sports/:slug" element={<SportDetail />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/departments/:slug" element={<DepartmentDetail />} />
          <Route path="/standings" element={<Standings />} />
          <Route path="/medal-table" element={<MedalTable />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/fixtures/:id" element={<FixtureDetail />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
