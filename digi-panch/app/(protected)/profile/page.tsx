"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useUser, useClerk, useAuth } from "@clerk/nextjs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, LogOut, Shield, Loader2, Edit3, Plus, MapPin, Map, Phone, Building } from "lucide-react";
import { fetchAPI } from "@/lib/api-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface DBUser {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  age?: number;
  address?: string;
  pin?: string;
  panchayat?: string;
  police_station?: string;
  role: string;
}

export default function ProfilePage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { getToken } = useAuth();
  
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    age: "",
    address: "",
    pin: "",
    panchayat: "",
    police_station: ""
  });

  const role = (user?.publicMetadata?.role as string) || dbUser?.role || "CITIZEN";

  useEffect(() => {
    async function loadProfile() {
      try {
        const token = await getToken();
        const data = await fetchAPI<DBUser>("/auth/me", { token });
        setDbUser(data);
        setFormData({
          full_name: data.full_name || "",
          phone: data.phone || "",
          age: data.age?.toString() || "",
          address: data.address || "",
          pin: data.pin || "",
          panchayat: data.panchayat || "",
          police_station: data.police_station || ""
        });
      } catch (error) {
        console.error("Failed to load profile from backend", error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [getToken]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = await getToken();
      const updatedUser = await fetchAPI<DBUser>("/auth/me", {
        method: "PATCH",
        token,
        body: JSON.stringify({
          full_name: formData.full_name || null,
          phone: formData.phone || null,
          age: formData.age ? parseInt(formData.age) : null,
          address: formData.address || null,
          pin: formData.pin || null,
          panchayat: formData.panchayat || null,
          police_station: formData.police_station || null
        })
      });
      setDbUser(updatedUser);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasExtraDetails = !!(dbUser?.age || dbUser?.address || dbUser?.pin || dbUser?.panchayat || dbUser?.police_station || dbUser?.phone);

  return (
    <div className="w-full py-6 sm:py-12 px-0 sm:px-4 pb-24 sm:pb-12">
      <div className="mx-auto max-w-3xl">
        {/* Heading */}
        <div className="mb-6 sm:mb-10 px-4 sm:px-0">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            My Profile
          </h1>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-slate-600">
            View your account information and manage your session.
          </p>
        </div>

        {/* Profile Card */}
        <Card className="rounded-2xl sm:rounded-3xl border-none shadow-sm mb-6">
          <CardContent className="p-4 sm:p-8">
            <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-center sm:gap-6">
              <div className="relative h-24 w-24 overflow-hidden rounded-full border bg-slate-100 flex-shrink-0">
                <Image
                  src={user?.imageUrl || "/default-avatar.png"}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="mt-5 sm:mt-0 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {dbUser?.full_name || user?.fullName || "User"}
                  </h2>
                  <Badge variant={role === 'ADMIN' ? 'destructive' : role === 'OFFICER' ? 'default' : 'secondary'} className="w-fit mx-auto sm:mx-0">
                    <Shield className="h-3 w-3 mr-1" />
                    {role}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center justify-center gap-2 text-slate-600 sm:justify-start">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <p className="text-sm break-all">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </div>

              <div className="mt-6 sm:mt-0">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant={hasExtraDetails ? "outline" : "default"} className="rounded-xl">
                      {hasExtraDetails ? (
                        <><Edit3 className="mr-2 h-4 w-4" /> Update Details</>
                      ) : (
                        <><Plus className="mr-2 h-4 w-4" /> Add Details</>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[calc(100vw-32px)] max-w-[500px] rounded-3xl">
                    <DialogHeader>
                      <DialogTitle>{hasExtraDetails ? "Update Profile Details" : "Add Profile Details"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4 py-2 sm:py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-1.5 sm:col-span-2">
                          <Label htmlFor="full_name">Full Name</Label>
                          <Input id="full_name" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} required className="rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="age">Age</Label>
                          <Input id="age" type="number" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} className="rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="phone">Mobile No</Label>
                          <Input id="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} className="rounded-xl" pattern="[0-9]{10}" title="Please enter exactly 10 digits" maxLength={10} />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="pin">PIN Code</Label>
                          <Input id="pin" value={formData.pin} onChange={(e) => setFormData({...formData, pin: e.target.value})} className="rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="panchayat">Panchayat</Label>
                          <Input id="panchayat" value={formData.panchayat} onChange={(e) => setFormData({...formData, panchayat: e.target.value})} className="rounded-xl" />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                          <Label htmlFor="police_station">Police Station</Label>
                          <Input id="police_station" value={formData.police_station} onChange={(e) => setFormData({...formData, police_station: e.target.value})} className="rounded-xl" />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                          <Label htmlFor="address">Address</Label>
                          <Input id="address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="rounded-xl" />
                        </div>
                      </div>
                      <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting} className="rounded-xl">
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="rounded-xl">
                          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {loading ? (
              <div className="my-8 flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : hasExtraDetails ? (
              <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 bg-slate-50/50 p-4 sm:p-6 rounded-2xl border border-slate-100">
                {dbUser.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Mobile Number</p>
                      <p className="text-sm text-slate-600 break-all">{dbUser.phone}</p>
                    </div>
                  </div>
                )}
                {dbUser.age && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-500 mt-0.5 flex-shrink-0">
                      {dbUser.age}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Age</p>
                      <p className="text-sm text-slate-600">{dbUser.age} years old</p>
                    </div>
                  </div>
                )}
                {dbUser.address && (
                  <div className="flex items-start gap-3 col-span-1 sm:col-span-2">
                    <MapPin className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Address</p>
                      <p className="text-sm text-slate-600 break-words">{dbUser.address}{dbUser.pin ? `, PIN: ${dbUser.pin}` : ""}</p>
                    </div>
                  </div>
                )}
                {dbUser.panchayat && (
                  <div className="flex items-start gap-3">
                    <Map className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Panchayat</p>
                      <p className="text-sm text-slate-600 break-words">{dbUser.panchayat}</p>
                    </div>
                  </div>
                )}
                {dbUser.police_station && (
                  <div className="flex items-start gap-3">
                    <Building className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Police Station</p>
                      <p className="text-sm text-slate-600 break-words">{dbUser.police_station}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="my-8"></div>
            )}

            <div className="my-8 h-px w-full bg-slate-200"></div>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Logout
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  End your current session securely.
                </p>
              </div>
              <Button
                variant="destructive"
                className="rounded-xl"
                onClick={() => signOut()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}