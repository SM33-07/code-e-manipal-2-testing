"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { createClient } from "@/lib/supabase/client";

export function LoginPage() {

  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading,setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/judging");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">

      <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-sm">

        <CardHeader className="text-center">

          <div className="flex justify-center mb-4">
            <Image src="/logo.png" alt="logo" width={64} height={64} />
          </div>

          <CardTitle className="text-2xl text-white">
            Judge Panel Access
          </CardTitle>

          <CardDescription className="text-gray-400">
            Login with your judge account
          </CardDescription>

        </CardHeader>

        <CardContent>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="space-y-2">

              <Label htmlFor="email" className="text-white">
                Email
              </Label>

              <Input
                id="email"
                type="email"
                placeholder="judge@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
                required
              />

            </div>

            <div className="space-y-2">

              <Label htmlFor="password" className="text-white">
                Password
              </Label>

              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
                required
              />

            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Logging in..." : "Access Judge Panel"}
            </Button>

          </form>

        </CardContent>

      </Card>
    </div>
  );
}
