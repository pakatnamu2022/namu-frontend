"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useUsersByRole } from "../lib/role.hook";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserResource } from "../../usuarios/lib/user.interface";

interface RoleUsersModalProps {
  id: number;
  nombre: string;
  trigger: React.ReactNode;
}

export function RoleUsersModal({ id, nombre, trigger }: RoleUsersModalProps) {
  const [open, setOpen] = useState(false);

  const { data: users } = useUsersByRole(id);

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-[400px] sm:w-[600px] overflow-auto">
          <SheetHeader>
            <SheetTitle>Usuarios con este rol</SheetTitle>
            <SheetDescription>
              <span className="font-semibold">{nombre}</span>
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-4 overflow-auto max-h-[80vh] h-full">
            {users && users?.length > 0 ? (
              users.map((user: UserResource) => (
                <div key={user.id} className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      className="object-cover object-top"
                      src={user.foto_adjunto}
                      alt={user.name}
                    />
                    <AvatarFallback>{user.name?.[0] ?? "-"}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {user.username} | {user.empresa} | {user.sede}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No hay usuarios.</p>
            )}
          </div>
          <div className="w-full flex justify-end">
            <Button onClick={() => setOpen(false)}>Cerrar</Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
