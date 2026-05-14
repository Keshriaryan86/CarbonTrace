'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, User, LogOut } from "lucide-react";
import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

type UserNavProps = {
    isMobile: boolean;
};

export function UserNav({ isMobile }: UserNavProps) {
    const auth = useAuth();
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = async () => {
        if (auth) {
            await signOut(auth);
            router.push('/login');
        }
    };

    if (!mounted || isUserLoading) {
        return <Skeleton className="h-8 w-8 rounded-full" />;
    }

    const trigger = (
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
            <AvatarImage src={user?.photoURL || `https://i.pravatar.cc/150?u=${user?.uid}`} alt={user?.displayName || "User Avatar"} />
            <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
        </Button>
    )

    if (isMobile) {
         return (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    {trigger}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.displayName || 'Anonymous User'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                        {user?.email || (user?.isAnonymous ? "Anonymous Session" : "No email")}
                        </p>
                    </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }
  
  return (
    <div className="flex items-center gap-4">
       <Avatar className="h-9 w-9">
          <AvatarImage src={user?.photoURL || `https://i.pravatar.cc/150?u=${user?.uid}`} alt={user?.displayName || "User Avatar"} />
          <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
        <div className="grid gap-0.5">
          <p className="text-sm font-medium leading-none">{user?.displayName || 'Anonymous User'}</p>
          <p className="text-xs text-muted-foreground">{user?.email || (user?.isAnonymous ? "Anonymous Session" : "No email")}</p>
        </div>
    </div>
  );
}
