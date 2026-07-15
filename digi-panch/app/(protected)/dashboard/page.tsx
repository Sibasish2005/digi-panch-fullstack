'use client';

import { useFetchDashboardData } from './useFetchDashboardData';
import { 
  FileText, CheckCircle, Clock, Bell, Home, Sprout, 
  PiggyBank, FolderOpen, FileDown, PlusCircle, ChevronRight,
  ArrowRight, LayoutGrid, Loader2
} from "lucide-react";
import FloatingChatbotButton from "../chatbot/chatbot";
import { LoadingSpinner } from '@/components/LoadingSpinner';
import Link from 'next/link';

export default function DashboardPage() {
  const {
    loading,
    applications,
    grievances,
    bookings,
    adminSummary
  } = useFetchDashboardData();

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  // Calculate real-time counts
  const totalAppsCount = adminSummary ? adminSummary.total_applications : applications.length;
  const totalPendingCount = adminSummary 
    ? (adminSummary.pending_applications + adminSummary.pending_grievances)
    : (applications.filter((a: any) => a.status === 'SUBMITTED' || a.status === 'PENDING').length + grievances.filter((g: any) => g.status !== 'Resolved' && g.status !== 'Closed').length);
  
  const approvedDocsCount = adminSummary ? adminSummary.approved_applications : applications.filter((a: any) => a.status === 'APPROVED' || a.status === 'DOCUMENT_ISSUED').length;

  // Filter approved certificates to show
  const recentCertificates = applications.filter((a: any) => a.status === 'APPROVED' || a.status === 'DOCUMENT_ISSUED');

  // Dynamically generate notifications
  const notificationsList: any[] = [];

  if (adminSummary) {
    notificationsList.push({
      id: 'admin-welcome',
      title: 'Welcome to Administrative Hub',
      description: `There are currently ${adminSummary.pending_applications} pending certificate reviews.`,
      time: 'Just now',
      color: 'bg-blue-500',
    });
  } else {
    applications.forEach((app) => {
      if (app.status === 'DOCUMENT_ISSUED') {
        notificationsList.push({
          id: `app-issued-${app.id}`,
          title: 'Document Issued',
          description: `Your ${app.document_type?.name || 'document'} is ready for download.`,
          time: new Date(app.created_at).toLocaleDateString(),
          color: 'bg-green-500',
        });
      } else if (app.status === 'APPROVED') {
        notificationsList.push({
          id: `app-approved-${app.id}`,
          title: 'Application Approved',
          description: `Your application for ${app.document_type?.name || 'certificate'} is approved.`,
          time: new Date(app.created_at).toLocaleDateString(),
          color: 'bg-blue-500',
        });
      }
    });

    grievances.forEach((g) => {
      if (g.status === 'Resolved') {
        notificationsList.push({
          id: `grievance-resolved-${g.id}`,
          title: 'Complaint Resolved',
          description: `Your complaint #${g.ticket_number || g.id.split('-')[0]} is resolved.`,
          time: new Date(g.created_at).toLocaleDateString(),
          color: 'bg-green-500',
        });
      } else if (g.status !== 'Resolved' && g.status !== 'Closed') {
        notificationsList.push({
          id: `grievance-active-${g.id}`,
          title: 'Complaint Active',
          description: `Your complaint #${g.ticket_number || g.id.split('-')[0]} is currently: ${g.status}.`,
          time: new Date(g.created_at).toLocaleDateString(),
          color: 'bg-orange-500',
        });
      }
    });

    bookings.forEach((b) => {
      if (b.status === 'CONFIRMED') {
        notificationsList.push({
          id: `booking-confirmed-${b.id}`,
          title: 'Booking Confirmed',
          description: `Your booking for ${b.amenity?.name || 'amenity'} is confirmed.`,
          time: new Date(b.created_at).toLocaleDateString(),
          color: 'bg-green-500',
        });
      }
    });
  }

  // Fallback default notification
  if (notificationsList.length === 0) {
    notificationsList.push({
      id: 'welcome',
      title: 'Welcome to DigiPanch',
      description: 'Start applying for certificate services or track active requests directly.',
      time: 'Just now',
      color: 'bg-blue-500',
    });
  }

  const activeNotifications = notificationsList.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl">
        <FloatingChatbotButton />

        {/* Header */}
        <div className="mb-8 flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm border border-slate-200 md:flex-row md:items-center md:justify-between lg:p-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              DigiPanch Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Manage applications, certificates, complaints, and village services efficiently.
            </p>
          </div>
          <Link href="/citizen/apply" className="w-full md:w-auto">
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 md:w-auto">
              <PlusCircle className="h-5 w-5" />
              Apply New Service
            </button>
          </Link>
        </div>

        {/* Stats Section */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
          {/* Card 1: Total Applications */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-200 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div style={{ fontFamily: "var(--font-noto-serif)" }} className="text-base font-semibold leading-tight text-slate-800">
                Total<br />Applications
              </div>
              <LayoutGrid className="h-6 w-6 text-slate-400 transition-colors group-hover:text-blue-500" />
            </div>
            <div style={{ fontFamily: "var(--font-noto-serif)" }} className="mt-8 text-5xl font-black text-[#0f2a5e]">
              {totalAppsCount}
            </div>
          </div>

          {/* Card 2: Pending Status */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-orange-200 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div style={{ fontFamily: "var(--font-noto-serif)" }} className="text-base font-semibold leading-tight text-slate-800">
                Pending<br />Status
              </div>
              <FileText className="h-6 w-6 text-slate-400 transition-colors group-hover:text-orange-500" />
            </div>
            <div style={{ fontFamily: "var(--font-noto-serif)" }} className="mt-8 text-5xl font-black text-[#0f2a5e]">
              {totalPendingCount}
            </div>
          </div>

          {/* Card 3: Approved Documents */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-green-200 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div style={{ fontFamily: "var(--font-noto-serif)" }} className="text-base font-semibold leading-tight text-slate-800">
                Approved<br />Documents
              </div>
              <CheckCircle className="h-6 w-6 text-slate-400 transition-colors group-hover:text-green-500" />
            </div>
            <div style={{ fontFamily: "var(--font-noto-serif)" }} className="mt-8 text-5xl font-black text-[#0f2a5e]">
              {approvedDocsCount}
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-3">
          
          {/* Left Side */}
          <div className="space-y-6 lg:col-span-2">
            
            {/* Apply Services */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Apply For Services</h2>
                <Link href="/citizen/apply" className="flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700">
                  View All <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Link href="/citizen/apply" className="group flex flex-col items-start rounded-xl border border-slate-200 p-5 text-left transition-all hover:border-blue-600 hover:bg-slate-50 hover:shadow-sm focus:outline-none">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Income Certificate</h3>
                  <p className="mt-1 text-sm text-slate-500">Apply for official income verification certificate.</p>
                </Link>

                <Link href="/citizen/apply" className="group flex flex-col items-start rounded-xl border border-slate-200 p-5 text-left transition-all hover:border-blue-600 hover:bg-slate-50 hover:shadow-sm focus:outline-none">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100">
                    <Home className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Residence Certificate</h3>
                  <p className="mt-1 text-sm text-slate-500">Verify permanent residential address.</p>
                </Link>

                <Link href="/citizen/apply" className="group flex flex-col items-start rounded-xl border border-slate-200 p-5 text-left transition-all hover:border-blue-600 hover:bg-slate-50 hover:shadow-sm focus:outline-none">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600 group-hover:bg-green-100">
                    <Sprout className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Farmer Assistance</h3>
                  <p className="mt-1 text-sm text-slate-500">Apply for agricultural and farming schemes.</p>
                </Link>

                <Link href="/citizen/apply" className="group flex flex-col items-start rounded-xl border border-slate-200 p-5 text-left transition-all hover:border-blue-600 hover:bg-slate-50 hover:shadow-sm focus:outline-none">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600 group-hover:bg-orange-100">
                    <PiggyBank className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Pension Scheme</h3>
                  <p className="mt-1 text-sm text-slate-500">Apply for pension and welfare benefits.</p>
                </Link>
              </div>
            </div>

            {/* Certificates */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Recent Certificates</h2>
                <Link href="/citizen/applications" className="flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700">
                  History <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="space-y-3">
                {recentCertificates.length === 0 ? (
                  <div className="text-center text-sm text-slate-500 py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No approved certificates available yet.
                  </div>
                ) : (
                  recentCertificates.slice(0, 3).map((app) => (
                    <div key={app.id} className="group flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3 sm:items-center">
                        <div className="hidden h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 sm:flex">
                          <FileDown className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900">{app.document_type?.name || 'Certificate'}</h3>
                          <p className="text-sm text-slate-500">
                            {app.status === 'DOCUMENT_ISSUED' ? 'Issued' : 'Approved'} on {new Date(app.submitted_at || app.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {app.final_document?.pdf_url ? (
                        <a 
                          href={app.final_document.pdf_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-blue-600 shadow-sm ring-1 ring-inset ring-slate-200 transition-all hover:bg-slate-50 hover:ring-blue-300 sm:w-auto"
                        >
                          <FileDown className="h-4 w-4" />
                          Download PDF
                        </a>
                      ) : (
                        <span className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 self-start sm:self-auto">
                          Ready to Issue
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-semibold text-slate-900">Quick Actions</h2>
              <div className="space-y-3">
                <Link href="/citizen/grievances" className="block w-full">
                  <button className="group flex w-full items-center gap-3 rounded-xl bg-blue-600 px-4 py-3 text-left text-sm font-medium text-white transition-all hover:bg-blue-700 hover:shadow-md focus:outline-none">
                    <PlusCircle className="h-5 w-5" />
                    <span className="flex-1">New Complaint</span>
                    <ArrowRight className="h-4 w-4 opacity-70 transition-transform group-hover:translate-x-1" />
                  </button>
                </Link>

                <Link href="/citizen/applications" className="block w-full">
                  <button className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 focus:outline-none">
                    <FolderOpen className="h-5 w-5 text-slate-400 group-hover:text-slate-600" />
                    <span className="flex-1">View Applications</span>
                  </button>
                </Link>

                <Link href="/citizen/applications" className="block w-full">
                  <button className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 focus:outline-none">
                    <FileDown className="h-5 w-5 text-slate-400 group-hover:text-slate-600" />
                    <span className="flex-1">Download Documents</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Notifications */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                  {activeNotifications.length}
                </span>
              </div>

              <div className="space-y-4">
                {activeNotifications.map((notif) => (
                  <div key={notif.id} className="relative pl-4 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-blue-500">
                    <h3 className="text-sm font-medium text-slate-900">{notif.title}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">{notif.description}</p>
                    <p className="mt-1 text-xs font-medium text-blue-600">{notif.time}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
